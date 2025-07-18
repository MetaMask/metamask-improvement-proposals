
---
mip: x
title: Proposal to adopt ERC-7682
status: Draft
stability: n/a
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions
author(s): Alex Donesky (@adonesky1), Jiexi Luan (@jiexi), Alex Mendonca (@wenfix), Joao Carlos (@ffmcgee725), Vandan Parikh(@vandan)
type: Maintainer
created: 2025-07-18
---

## Summary

This MetaMask Improvement Proposal (MIP) outlines MetaMask’s adoption and implementation of [EIP-7682](https://eips.ethereum.org/EIPS/eip-7682). The purpose is to provide a consistent interface and workflow for dapps to delegate prerequisite asset fulfillment (e.g., ERC-20 balances or gas fees) to MetaMask prior to executing a user-approved transaction batch.

MetaMask will advertise capabilities via `wallet_getCapabilities`, and support optional invocation-time metadata via `wallet_sendCalls` that specifies required assets. MetaMask may attempt to fulfill these prerequisites through supported swap, bridge, or abstraction mechanisms. This MIP also details implementation-specific behavior such as supported chains, asset filtering, and error codes.

## Motivation

Dapps frequently preemptively block transactions when a user lacks sufficient funds for gas or token transfers, even though the user’s wallet may be capable of sourcing those funds. Supporting EIP-7682 allows MetaMask to:

* Enable streamlined UX for users with insufficient on-chain balances.
* Leverage wallet-native knowledge of available assets as well as bridging and swapping routes or offchain funding sources.
* Let dapps offload prerequisite funding logic to the wallet.

This MIP aligns with MetaMask’s commitment to EIP-5792. It enables more sophisticated UX paths while abstracting prerequisite sourcing logic away from dapps. The proposal builds on a shared JSON-RPC interface and naturally integrates with MetaMask’s account abstraction support and secure asset movement capabilities.

## Specification

### Capabilities Advertised by MetaMask

MetaMask extends the response to `wallet_getCapabilities` with:

```json
{
  "0x1": {
    "alternateGasFees": {
      "supported": true
    },
    "auxiliaryFunds": {
      "supported": true
    },
    "atomic": {
      "status": "ready"
    }
  }
}
```

* `alternateGasFees`: Indicates MetaMask may use paymasters or sponsor flows.
* `auxiliaryFunds`: Indicates MetaMask may fulfill token prerequisites (e.g. ERC-20s) via internal funding logic.

### Extended `wallet_sendCalls` Support

MetaMask supports the use of the `capabilities.auxiliaryFunds.assets` object in `wallet_sendCalls` requests, where dapps can express prerequisites like:

```json
{
  "capabilities": {
    "auxiliaryFunds": {
      "assets": [
        {
          "address": "0x123...",
          "amount": "0x00000000001"
        }
      ]
    }
  }
}
```

If atomic execution is required (`atomicRequired: true`), MetaMask will attempt to fulfill all prerequisites before executing the call batch.

If atomic execution is not required (`atomicRequired: false`), MetaMask may attempt partial fulfillment, executing only the subset of calls that have their required asset conditions met.

### Unsupported Assets and Networks

MetaMask will only fulfill prerequisites for assets and chains it explicitly supports. If a requested asset or chain is unsupported:

* MetaMask will reject the request with an appropriate JSON-RPC error code (e.g., `5801 UNSUPPORTED_ASSET`).
* Supported assets and chains may be found in MetaMask’s public documentation: [MetaMask: Move Crypto](https://support.metamask.io/manage-crypto/move-crypto).

Wallet developers and dapp authors are encouraged to validate user intents against this list or implement fallback logic.

---

### Error Behavior

If MetaMask cannot fulfill one or more prerequisites, it may return errors such as:

| Code | Name                 | Description                                                 |
| ---- | -------------------- | ----------------------------------------------------------- |
| 5801 | `UNSUPPORTED_ASSET`  | Asset or chain is not supported by MetaMask.                |
| 5802 | `ROUTE_UNAVAILABLE`  | No viable method to source the prerequisite asset.          |
| 5803 | `ACQUISITION_FAILED` | Failed attempt to acquire asset via provider or swap logic. |

If `atomicRequired: true` is set, any failure results in no execution.

If `atomicRequired: false`, MetaMask may proceed with a partial execution strategy based on which prerequisites it successfully fulfilled.


## Implementation

MetaMask will roll out support for these features progressively on supported EVM networks (e.g., Ethereum, Base, BNB Smart Chain, Optimism) and asset pairs. Guidance regarding implementation details such as supported assets and chains will be made available via public documentation.

Smart account upgrades may be triggered as a prerequisite for enabling these capabilities. User consent is required during such upgrades.

## Developer Adoption Considerations
[Explain any considerations that developers should take into account when adopting this proposal. For example, how will it affect compatibility, and what changes may need to be made to accommodate the proposal?]

## User Experience Considerations
[Explain any user experience implications of the proposal]

## Security Considerations

MetaMask will not disclose whether a user has access to certain off-chain or private assets unless explicitly shared. Wallets must prevent information leakage about asset availability from private or hidden accounts. All prerequisite acquisition flows must be presented with explicit user confirmation before execution.

## References

Reference implementation and support materials will be provided in the MetaMask developer and customer support documentation:

* [MetaMask Docs - Batch Transactions](https://docs.metamask.io/wallet/how-to/send-transactions/send-batch-transactions/)
* [MetaMask Docs - Capabilities](https://docs.metamask.io/wallet/reference/json-rpc-methods/wallet_getcapabilities/)
* [MetaMask Support - Supported networks and assets](https://support.metamask.io/manage-crypto/move-crypto)

### Feedback
Submit feedback in the [discussion](https://github.com/MetaMask/metamask-improvement-proposals/discussions) for this MIP.

### Committed Developers
MetaMask

## Copyright
Copyright and related rights waived via [CC0](../LICENSE).