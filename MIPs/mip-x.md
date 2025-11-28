---
mip: X
title: Implement `wallet_getTransactionCountIncludingQueued` to include locally pending transactions
status: Draft
stability: n/a
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions
author(s): Amal Sudama (@cds-amal)
type: Community
created: 2025-11-26
---

## Summary

This proposal introduces a new JSON-RPC method `wallet_getTransactionCountIncludingQueued` that returns the next available nonce for an account, including transactions that are pending locally in MetaMask but not yet confirmed on-chain.

This enables dApps that require **nonce precision** to predict contract deployment addresses before transactions confirm. CREATE addresses are deterministically derived from `keccak256(rlp(sender, nonce))`, so knowing the exact nonce MetaMask will assign is essential for multi-step deployments where subsequent transactions must reference not-yet-deployed contracts.

## Motivation

The current `eth_getTransactionCount` method, when called with the `pending` block tag, queries the node for the pending nonce but does not account for transactions that are pending locally within MetaMask. While submitting multiple transactions in rapid succession is already possible today, this limitation breaks dApps that need to **predict CREATE addresses** for contract deployments.

### The Problem

Contract deployment addresses are deterministic: `address = keccak256(rlp(sender, nonce))`. When a dApp needs to deploy contract A and then deploy contract B that references A's address, it must know the exact nonce for transaction A to compute the address before A confirms.

When a dApp submits transaction N and immediately queries `eth_getTransactionCount("pending")`, MetaMask returns the nonce from the connected node. If transaction N hasn't propagated to the node's mempool yet, the returned nonce will be N (not N+1), resulting in the dApp's CREATE address prediction for transaction N+1 to be wrong.

### Use Case: Multi-Step Contract Deployments

Consider a deployment orchestrator managing multi-step contract deployments:

1. **Deploy Factory** (nonce N) -> predicted address: `0xABC`
2. **Deploy Contract via Factory** (nonce N+1)  must reference `0xABC` in calldata
3. **Initialize contracts** (nonce N+2) -> wires them together

The orchestrator computes `0xABC = keccak256(rlp(sender, N))` *before* transaction N confirms, so it can prepare transaction N+1's calldata. This requires knowing N precisely.

Tools like TXTX deliberately use `eth_sendTransaction` to leverage MetaMask's security stack (transaction simulation, phishing detection, spend limits, confirmation flows) rather than asking users to hand over private keys for raw transaction signing. But to make this work for complex deployments, there needs to be visibility into exactly what nonce MetaMask will assign.

### Current Workaround

Developers must implement a local NonceManager that tracks `max(cached_nonce, on_chain_nonce)` after each send. This duplicates functionality that MetaMask's internal nonce tracker already maintains, adding complexity and potential for bugs.

### Historical Context

MetaMask previously included local pending transactions in `eth_getTransactionCount` responses when the `pending` block tag was used (see [old implementation](https://github.com/MetaMask/web3-provider-engine/blob/472426ae0460e7482330d970a2a1e17c7b5b5157/subproviders/nonce-tracker.js#L34)). This behavior was changed around 2019 on extension, and more recently on mobile.

Introducing a new method rather than reverting the old behavior avoids breaking dApps that may depend on the current `eth_getTransactionCount` semantics and provides a clear, explicit API for this functionality.

## Usage Example

### Predicting CREATE Addresses for Multi-Step Deployments

```javascript
import { getContractAddress } from 'viem';

const deployerAddress = '0x1234567890abcdef1234567890abcdef12345678';

// Get the next nonce MetaMask will assign (including locally queued txs)
const nonce = await ethereum.request({
  method: 'wallet_getTransactionCountIncludingQueued',
  params: [deployerAddress]
});

// Predict the factory contract address before deployment confirms
const predictedFactoryAddress = getContractAddress({
  from: deployerAddress,
  nonce: BigInt(nonce)
});

// Deploy the factory (MetaMask assigns nonce N)
await ethereum.request({
  method: 'eth_sendTransaction',
  params: [{
    from: deployerAddress,
    data: factoryBytecode,
  }]
});

// Now prepare the next transaction that references the factory
// We know the factory address even though deployment hasn't confirmed
const childDeploymentCalldata = encodeDeployViaFactory(predictedFactoryAddress, childParams);

// Query again for the next nonce (now N+1)
const nextNonce = await ethereum.request({
  method: 'wallet_getTransactionCountIncludingQueued',
  params: [deployerAddress]
});

// Submit the dependent transaction
await ethereum.request({
  method: 'eth_sendTransaction',
  params: [{
    from: deployerAddress,
    to: predictedFactoryAddress,
    data: childDeploymentCalldata,
  }]
});
```

# Proposal

## Language

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" written in uppercase in this document are to be interpreted as described in RFC 2119.

## Definitions

**CREATE address**: The deterministic address where a contract will be deployed, computed as `keccak256(rlp(sender, nonce))`. Knowing the exact nonce is required to predict this address before the deployment transaction confirms.

**locally pending transaction**: A transaction that has been signed and submitted through MetaMask but has not yet been confirmed on-chain. These transactions are tracked in MetaMask's internal transaction queue.

**nonce**: A sequential number assigned to each transaction from an account, used to ensure transactions are processed in order and to prevent replay attacks.

**queued transaction**: Synonymous with locally pending transaction in the context of this proposal.

## Proposal Specification

The new JSON-RPC method `wallet_getTransactionCountIncludingQueued` MUST be implemented with the following parameters:

### Parameters

- `address` (REQUIRED): The Ethereum address to query, as a hex string with `0x` prefix.

### Return Value

Returns the next available nonce as a hexadecimal string (e.g., `"0x5"`).

The returned value MUST be:
```
max(on_chain_pending_nonce, highest_local_pending_nonce + 1)
```

This differs from `eth_getTransactionCount(address, 'pending')` by including transactions that are pending locally in MetaMask but MAY not yet be visible to the connected node.

### Error Handling

- **Invalid Address**: If the address is not a valid Ethereum address, the wallet MUST throw an `invalidParams` error with message "Invalid Ethereum address".
- **Address Not Connected**: If the address is not connected to the requesting dApp, the wallet MUST throw an `unauthorized` error with message "Address not authorized for this dApp".

## Alternatives Considered

### Fix `eth_getTransactionCount("pending")` to include local transactions

One alternative considered was modifying the existing `eth_getTransactionCount("pending")` behavior to include locally queued transactions. However, this approach has limitations:

1. **Semantic mismatch**: The `pending` block tag refers to the node's pending block (mempool state). Locally queued transactions that have not been submitted yet are not in the pending state by definition. They exist only in the wallet's local state.

2. **Incomplete solution**: Fixing `pending` to consider submitted-but-not-propagated transactions (such as smart transactions) would help some cases, but would not address queued transactions that have not been submitted yet. The new method provides a more complete and semantically correct solution.

### Add a new block parameter type (e.g., `"queued"` or `"local"`)

Another alternative was extending `eth_getTransactionCount` with a new block parameter type that includes wallet-local state. This was rejected because:

1. **Shared infrastructure**: The block parameter type is shared across many JSON-RPC methods where a "local" option may not be applicable.

2. **Cross compatibility**: A wallet-specific parameter would not be recognized as valid by other RPC processors (nodes, indexers, etc.).

3. **Process constraints**: MetaMask has a well-documented process for introducing new experimental methods, but no established process for adding experimental parameter options to stable methods.

### Why a new method is preferred

A dedicated `wallet_` namespaced method provides:

- **Clear semantics**: The `wallet_` prefix signals this returns wallet-local state, not network state
- **Explicit opt-in**: dApps consciously choose to query wallet state rather than having existing behavior change
- **Established process**: Follows MetaMask's documented approach (TODO: Include link to MM process doc) for experimental methods

### Future consideration

As MetaMask's feature set grows, there will likely be more cases where wallet-local state needs to surface through APIs. If each case requires a new method, the API surface could fragment over time. A principled approach to extending existing methods with wallet-specific behavior may be worth considering, even if this particular case is best served by a new method.

## Caveats

1. **Wallet-Specific State**: The nonce returned reflects MetaMask's local view. If the user has pending transactions from another wallet or interface using the same account, those will not be reflected.

2. **Transaction Replacement**: If a user speeds up or cancels a transaction in MetaMask, the queued nonce state changes. dApps should listen for transaction status updates.

3. **Cross-dApp Visibility**: Transactions submitted by other dApps through the same MetaMask instance ARE included in the count, as they share the same local transaction queue.

## Implementation

The MetaMask team would be responsible for implementing the `wallet_getTransactionCountIncludingQueued` method. This involves:

1. Exposing the existing internal nonce tracker's knowledge of pending transactions
2. Adding the new RPC method handler in both extension and mobile
3. Updating API documentation

Reference implementation logic (pseudocode):
```javascript
function wallet_getTransactionCountIncludingQueued(address) {
  const onChainNonce = await rpcProvider.getTransactionCount(address, 'pending');
  const localPendingTxs = nonceTracker.getPendingTransactions(address);

  const highestLocalNonce = localPendingTxs.length > 0
    ? Math.max(...localPendingTxs.map(tx => tx.nonce)) + 1
    : onChainNonce;

  return toHex(Math.max(onChainNonce, highestLocalNonce));
}
```

## Developer Adoption Considerations

1. **Backward Compatibility**: This is a new method and does not affect existing `eth_getTransactionCount` behavior. Developers can adopt it incrementally.

2. **Feature Detection**: Developers SHOULD check for method availability before use:
   ```javascript
   const supportsMethod = async () => {
     try {
       await ethereum.request({ method: 'wallet_getTransactionCountIncludingQueued', params: [address] });
       return true;
     } catch (e) {
       return e.code !== -32601; // Method not found
     }
   };
   ```

3. **Fallback Strategy**: When the method is unavailable, developers can fall back to their existing nonce management strategy or use `eth_getTransactionCount` with the understanding of its limitations.

4. **Race Condition Awareness**: Even with this method, developers SHOULD handle potential nonce conflicts gracefully, as transactions can fail for other reasons.

## User Experience Considerations

This proposal is transparent to end users - it improves the reliability of multi-transaction flows without requiring any user action or awareness. Users will experience:

- Fewer failed transactions due to nonce conflicts
- Smoother batch operations in dApps
- Reduced need to manually cancel/speed up stuck transactions

## Security Considerations

1. **Information Disclosure**: The method only exposes nonce information that the dApp could infer by tracking its own transaction submissions. It does not reveal information about transactions from other dApps beyond what affects the shared nonce sequence.

2. **Authorization**: The method MUST only return information for addresses that the requesting dApp has permission to access (i.e., connected accounts).

3. **No New Attack Vectors**: This method is read-only and does not enable any new transaction capabilities. It simply provides more accurate nonce information that MetaMask already tracks internally.

## References

- [MetaMask web3-provider-engine nonce-tracker (historical implementation)](https://github.com/MetaMask/web3-provider-engine/blob/472426ae0460e7482330d970a2a1e17c7b5b5157/subproviders/nonce-tracker.js#L34)
- [EIP-1474: Remote procedure call specification](https://eips.ethereum.org/EIPS/eip-1474)
- [eth_getTransactionCount specification](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactioncount)

### Feedback

Submit feedback in the [discussion](https://github.com/MetaMask/metamask-improvement-proposals/discussions) for this MIP.

### Committed Developers

< WHO >

## Copyright

Copyright and related rights waived via [CC0](../LICENSE).
