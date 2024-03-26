---
MIP: 1
Title: Implement JSON-RPC Request Batching
Status: Draft
Stability: Experimental
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions
Author(s): Jiexi Luan (@jiexi)
Type: Maintainer
Created: 2024-03-25
---

## Summary
This proposal aims to extend the MetaMask JSON-RPC API that is accessible via `window.ethereum.request()` to include support for batching requests. Batched requests would be processed in parallel by the wallet. All passthrough requests in a batch will be sent to the RPC endpoint in a batch. All requests requiring user confirmation will have results returned after the user takes action. Results will be returned as available and are not guaranteed to be in the same order as the respective passed requests. Introducing native support for request batching allows developers to improve Dapp efficiency and aligns the MetaMask JSON-RPC API closer to the [JSON-RPC batch specification](https://www.jsonrpc.org/specification#batch).

## Motivation


# Usage Example
```js
await window.ethereum.request([
  {
    "id": 1,
    "method": "wallet_requestPermissions",
    "params": [
      {
        "eth_accounts": {}
      }
    ]
  },
  {
    "id": 2,
    "method": "wallet_switchEthereumChain",
    "params": [
      {
        "chainId": "0x1"
      }
    ]
  },
  {
    "id": 3,
    "method": "eth_getBlockByNumber",
    "params": [
      "latest",
      null
    ]
  },
  {
    "id": 4,
    "method": "eth_getBlockByNumber",
    "params": [
      "pending",
      null
    ]
  },
  {
    "id": 5,
    "method": "eth_getBlockByNumber",
    "params": [
      "finalized",
      null
    ]
  },
  {
    "id": 6,
    "method": "eth_sendTransaction",
    "params": [
      {
        /* transaction parameters */
      },
    ],
  }
]);
```

In these examples, TODO

# Proposal
Language
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" written in uppercase in this document are to be interpreted as described in RFC 2119.

## Definitions
**ERC-721**: TODO

**ERC-1155**: TODO

## Proposal Specification
To extend MetaMask to support request batching, we propose extending the [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193#request) `Provider.request()` interface to acccept a request object or an array of request objects.

The updated method signature will be as follows:

```
interface RequestArguments {
  readonly id: number;
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
    T extends RequestArguments ? RequestResult :
    T extends RequestArguments[] ? RequestResult[] :
    never;

Provider.request<T extends RequestArguments | RequestArguments[]>(args: T): Promise<RequestResults<T>>;
```
When a request is passed, the wallet MUST continue to return the result for the request as it currently does.

When an array of requests is passed, the wallet MUST return an array of results with a result for each request. A result SHOULD exist for each request. The wallet MAY return the results in an order different from that of the passed in array of requests. Each request in the array of requests MUST

## Caveats
The proposed request batching will process requests and return results sequentially, in the order received. Additionally, a failed request will also result in any subequest requests in the batch to be returned as failed. This behavior is contrary to the [JSON-RPC batch specification](https://www.jsonrpc.org/specification#batch) which does not guarantee the execution order of requests nor the return order of results and does not abort execution early if any request fails.

## Implementation
The MetaMask team will be responsible for implementing the proposed changes to the `window.ethereum.request()` method. This will involve updating the wallet's internal logic to handle the new routing requirements.

## Developer Adoption Considerations

Considering that the only additional parameter being proposed is the optional `tokenId` argument, developers should take the following aspects into account when adopting this proposal:

1. Backward compatibility: The existing implementation of `wallet_watchAsset` for ERC-20 tokens remains unchanged. Developers working with ERC-20 tokens will not need to make any modifications to their current code.

2. Ease of adoption: Developers working with ERC-721 and ERC-1155 tokens can simply include the optional `tokenId` parameter in the options object when sending a request to add an NFT MetaMask will fetch the image, name, symbol, and any other metadata directly from the token contract using the tokenId and contract address, meaning developers can rely on this secure and reliable method of obtaining the necessary token information.


## User Experience Considerations
Users will now be able to add and interact with ERC-721 and ERC-1155 tokens within MetaMask, providing a more seamless and comprehensive experience. However, the expanded functionality may result in a more complex user interface, and users should be educated about the differences between ERC-20, ERC-721, and ERC-1155 tokens.

## Security Considerations
While the proposed changes to support ERC-721 and ERC-1155 tokens do not introduce new security risks in terms of contract interactions, they do present a potential risk related to the use of externally hosted images for token representations.

Malicious actors may prompt users to add NFTs with images or other resources linked in the token URI field that are hosted on servers controlled by the attacker. When the user's client fetches the image to display it within the wallet, the attacker can potentially log the user's IP address and gather information about the user's device and location. This can be a privacy concern and may lead to targeted attacks against the user.

To mitigate this risk, MetaMask could implement the following countermeasures:

**Proxy Image Requests:** Route image requests through a trusted proxy server to obfuscate the user's IP address. This can help maintain user privacy, but may introduce additional latency and complexity.

**Content Verification:** Perform checks on image URLs embedded in the `tokenUri` to ensure they originate from trusted sources. This may involve maintaining a whitelist of approved domains, but may not cover all legitimate use cases.

**User Education:** Inform users of the potential risks associated with externally hosted images and provide guidelines for safely adding NFTs to their wallet.

**Warning and consent:** Provide a clear warning to users: Before fetching images or any resources referenced by the tokenUri, MetaMask should display a warning message to users, informing them of the potential risks associated with IP address leakage and require their consent. This message should also include recommendations, such as using a VPN or Tor, to enhance privacy while interacting with external resources.


Developers and users should also be aware of the standard security considerations when dealing with tokens, such as verifying contract addresses and ensuring the trustworthiness of token issuers.

## References
[wallet_WatchAsset](https://github.com/MetaMask/api-specs/blob/ec70a1dcb7730ae567094e319704bbad755ce1a8/openrpc.json#L320p)

[ERC-721: Non-Fungible Token Standard](https://eips.ethereum.org/EIPS/eip-721)

[ERC-1155: Multi Token Standard](https://eips.ethereum.org/EIPS/eip-1155)

## Feedback
Please provide feedback on this proposal by opening an issue in the MetaMask MIPs repository.

## Committed Developers
Alex Donesky (@adonesky1)

## Copyright
Copyright and related rights waived via [CC0](../LICENSE).
