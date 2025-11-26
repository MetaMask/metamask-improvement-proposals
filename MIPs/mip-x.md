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

This proposal introduces a new JSON-RPC method `wallet_getTransactionCountIncludingQueued` that returns the next available nonce for an account, including transactions that are pending locally in MetaMask but not yet confirmed on-chain. This enables dApps to reliably submit multiple sequential transactions without waiting for each to be mined.

## Motivation

The current `eth_getTransactionCount` method, when called with the `pending` block tag, queries the node for the pending nonce but does not account for transactions that are pending locally within MetaMask. This creates a significant limitation for dApps that need to submit multiple transactions in rapid succession.

### The Problem

When a dApp submits transaction N and immediately queries `eth_getTransactionCount("pending")`, MetaMask returns the nonce from the connected node. If transaction N hasn't propagated to the node's mempool yet, the returned nonce will be N (not N+1), causing the next transaction to fail with a "nonce too low" error or to replace the pending transaction.

### Use Case: Transaction Orchestration

Consider TXTX, a runbook orchestrator for blockchain deployments that manages multi-step contract deployments, migrations, and batch operations. Runbooks are declarative specs analyzed to produce a DAG of transactions where the full dependency graph is known upfront.

A typical workflow:
1. User connects wallet via wagmi/Web3Modal
2. DAG executor traverses the graph, prompting signatures as dependencies resolve
3. User signs rapidly through the sequence (5-20+ transactions)

Because the orchestrator knows the complete transaction graph upfront, it can assign nonces immediately: deploy a factory (nonce N) -> deploy 3 contracts in parallel (nonces N+1, N+2, N+3) -> wire them together (nonce N+4). The current "submit, wait for confirmation, query next nonce" model forces serialization of what could be parallelized.

### Current Workaround

Developers must implement a local NonceManager that tracks `max(cached_nonce, on_chain_nonce)` after each send. This duplicates functionality that MetaMask's internal nonce tracker already maintains, adding complexity and potential for bugs.

### Historical Context

MetaMask previously included local pending transactions in `eth_getTransactionCount` responses when the `pending` block tag was used (see [old implementation](https://github.com/MetaMask/web3-provider-engine/blob/472426ae0460e7482330d970a2a1e17c7b5b5157/subproviders/nonce-tracker.js#L34)). This behavior was changed around 2019 on extension, and more recently on mobile.

Introducing a new method rather than reverting the old behavior avoids breaking dApps that may depend on the current `eth_getTransactionCount` semantics and provides a clear, explicit API for this functionality.

## Usage Example

```javascript
// Get the next available nonce including locally pending transactions
const nonce = await ethereum.request({
  method: 'wallet_getTransactionCountIncludingQueued',
  params: ['0x1234567890abcdef1234567890abcdef12345678']
});

// Use the nonce for the next transaction
await ethereum.request({
  method: 'eth_sendTransaction',
  params: [{
    from: '0x1234567890abcdef1234567890abcdef12345678',
    to: '0xabcdef1234567890abcdef1234567890abcdef12',
    nonce: nonce,
    // ... other transaction parameters
  }]
});
```

### Batch Transaction Submission

```javascript
// Submit multiple transactions with sequential nonces
const baseNonce = await ethereum.request({
  method: 'wallet_getTransactionCountIncludingQueued',
  params: [userAddress]
});

// Queue transactions with known nonces
const txPromises = transactions.map((tx, index) =>
  ethereum.request({
    method: 'eth_sendTransaction',
    params: [{ ...tx, nonce: `0x${(parseInt(baseNonce) + index).toString(16)}` }]
  })
);
```

# Proposal

## Language

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" written in uppercase in this document are to be interpreted as described in RFC 2119.

## Definitions

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
