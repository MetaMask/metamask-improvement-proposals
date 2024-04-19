---
MIP: X
Title: Implement JSON-RPC Request Batching
Status: Draft
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions
Author(s): Jiexi Luan (@jiexi)
Type: Maintainer
Created: 2024-03-25
---

## Summary
This proposal aims to extend the MetaMask JSON-RPC API that is accessible via `window.ethereum.request()` to include support for batching requests. MetaMask may process a batch rpc call as a set of concurrent tasks, processing them in any order and with any width of parallelism. All passthrough requests in a batch will be sent to the RPC endpoint in a batch. All requests requiring user confirmation will have results returned after user approval/rejection. Results will be returned as available and are not guaranteed to be in the same order as the respective requests. Introducing native support for request batching allows developers to improve Dapp efficiency and aligns the MetaMask JSON-RPC API closer to the [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification#batch).

## Motivation


# Usage Example
```js
// Request
await window.ethereum.request([
    {
    "id": 1,
    "method": "eth_chainId",
  },
  {
    "id": 2,
    "method": "eth_getBlockByNumber",
    "params": [
      "latest",
      null
    ]
  },
  {
    "id": 3,
    "method": "eth_getBlockByNumber",
    "params": [
      "pending",
      null
    ]
  },
  {
    "method": "eth_getBlockByNumber",
    "params": [
      "finalized",
      null
    ]
  }
]);

// Response
[
  {
    "id": 2,
    "result": {
      // latest block result for `eth_getBlockByNumber`
    }
  },
  {
    "id": 3,
    "result": {
      // pending block result for `eth_getBlockByNumber`
    }
  },
  {
    "id": 1,
    "result": '0x1'
  },
  // The finalized block result for `eth_getBlockByNumber`
  // is not returned because `id` was not set in the request.
]
```

# Proposal
Language
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" written in uppercase in this document are to be interpreted as described in RFC 2119.

## Definitions
**Passthrough Requests**: Requests that require a call to the RPC endpoint that do not require any user confirmation.

## Proposal Specification
To extend MetaMask to support request batching, we propose extending the [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193#request) `Provider.request()` interface to acccept a request object or an array of request objects.

The updated method signature will be as follows:

```
interface RequestArguments {
  readonly id?: number | string;
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

type RequestResult = {
  readonly id: number;
  readonly result: unknown;
} | {
  readonly id: number;
  readonly error: {
    code: number;
    message: string;
  }
}

type RequestResults<T> =
    T extends RequestArguments ? unknown :
    T extends RequestArguments[] ? RequestResult[] :
    never;

Provider.request<T extends RequestArguments | RequestArguments[]>(args: T): Promise<RequestResults<T>>;
```
When a request is passed, the wallet MUST return the result for the request as it currently does.

When an array of requests is passed, the wallet SHOULD return a result for each request, except that there SHOULD NOT be a result if the request is missing an `id`. The wallet MAY process the requests in any order. The wallet MAY return the results in an order different from that of the passed in array of requests.

## Caveats
The wallet SHOULD batch all passthrough requests into a single call to the RPC endpoint. Requests that require user confirmation before making a call to the RPC endpoint (e.g. `eth_sendTransaction`) will be sent to the RPC endpoint as single non-batched requests when they are approved.

## Implementation
The MetaMask team will be responsible for implementing the proposed changes to the `window.ethereum.request()` method and internal JSON-RPC pipeline. This will involve updating the inpage provider and wallet's internal logic to handle the new routing requirements.

## Developer Adoption Considerations
Developers should consider the level of effort required to migrate from submitting many single requests to submitting a batched request. It's likely that many dapps have coupled the components that display on-chain data to the individual RPC request itself. It may be non-trivial to group these requests more upstream.

## User Experience Considerations
This change will mostly be transparent to the user. The user will see the most noticeable improvement in responsiveness on request-heavy dapps that migrate from single request submissions to batched request submissions.

## Security Considerations
The proposed changes to support request batching do not introduce new security risks.

## References
[JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification)

[EIP-1193: Ethereum Provider JavaScript API](https://eips.ethereum.org/EIPS/eip-1193)

Please provide feedback on this proposal by opening an issue in the MetaMask MIPs repository.

## Committed Developers
Jiexi Luan (@jiexi)

## Copyright
Copyright and related rights waived via [CC0](../LICENSE).
