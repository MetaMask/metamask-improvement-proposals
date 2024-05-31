---
mip: 1
title: Extend `wallet_watchAsset` to Support ERC-721 and ERC-1155 Tokens (NFTs)
status: Implemented
stability: Experimental
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions/22
author(s): Alex Donesky (@adonesky1)
type: Maintainer
created: 2023-04-11
---

## Summary
This proposal aims to extend the support of `wallet_watchAsset` in MetaMask to include ERC-721 and ERC-1155 tokens (NFTs) enabling better integration of NFTs within the wallet. By broadening the scope of supported tokens, we can provide users with a more seamless experience when interacting with NFTs through MetaMask and overcome the existing constraints of `wallet_watchAsset`, which currently only supports ERC-20 tokens.

## Motivation
[wallet_WatchAsset](https://github.com/MetaMask/api-specs/blob/ec70a1dcb7730ae567094e319704bbad755ce1a8/openrpc.json#L320) currently allows users to add custom ERC-20 tokens to their MetaMask wallet. However, it does not support ERC-721 or ERC-1155 tokens, the current primary standards for non-fungible tokens (NFTs). With the increasing popularity and adoption of NFTs, it is essential to expand `wallet_watchAsset` to accommodate these token standards and provide a more comprehensive and seamless user experience.

While MetaMask does offer NFT auto-detection currently it is only supported on Ethereum Mainnet. In addition, many users may have NFT auto-detection services disabled due to concerns with potential security and privacy tradeoffs. By expanding `wallet_watchAsset` to support ERC-721 and ERC-1155 tokens, app developers can give their users the ability to view and interact with any of their NFTs directly within MetaMask, without relying on third-party indexers or APIs. This enhancement empowers users to manage their NFT assets directly, increases the usability of MetaMask for NFT-related activities, and ultimately strengthens user trust in the wallet.

By allowing users to add and manage NFTs directly within MetaMask, we can better cater to the growing NFT community and expand the wallet's functionality to meet the evolving needs of the broader Ethereum ecosystem.

# Usage Example
```
// Request to add an ERC-721 token (NFT)
ethereum.request({
  method: 'wallet_watchAsset',
  params: {
    type: 'ERC721',
    options: {
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      tokenId: '1' // Added optional parameter for ERC-721 and ERC-1155 tokens
    },
  },
});

// Request to add an ERC-1155 token (NFT)
ethereum.request({
  method: 'wallet_watchAsset',
  params: {
    type: 'ERC1155',
    options: {
      address: '0x1234567890abcdefABCDEF1234567890ABCDEF',
      tokenId: '2' // Added optional parameter for ERC-721 and ERC-1155 tokens
    },
  },
});

```

In these examples, the optional `tokenId` parameter is provided for ERC-721 and ERC-1155 tokens. MetaMask will use the tokenId and contract address to fetch the image, name, symbol, and any other metadata directly from the token contract, ensuring a more secure and reliable user experience.

# Proposal
Language
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" written in uppercase in this document are to be interpreted as described in RFC 2119.

## Definitions
**ERC-721**: A standard for representing non-fungible tokens (NFTs) on the Ethereum blockchain. Each token has a unique ID and cannot be divided or merged.

**ERC-1155**: A standard for representing both fungible and non-fungible tokens on the Ethereum blockchain. It allows for batch operations and efficient transfers, supporting multiple token types within a single contract.

## Proposal Specification
To extend `wallet_WatchAsset` support to include ERC-721 and ERC-1155 tokens while enhancing security, we propose the following changes:

Introduce an optional `tokenId` parameter to the existing options object. This parameter will be used to specify the unique identifier of the NFT when sending a request to add the token.
The updated method signature will be as follows:

```
ethereum.request({
  method: 'wallet_watchAsset',
  params: {
    type: 'ERC20' | 'ERC721' | 'ERC1155',
    options: {
      address: string, // required parameter for all types.
      symbol: string, // optional parameter for ERC-20 tokens
      name: string, // optional parameter for ERC-20 tokens
      image: string, // optional parameter for ERC-20 tokens
      tokenId: string, // required parameter for ERC-721 and ERC-1155 tokens.
    },
  },
});
```
MetaMask SHOULD use the `tokenId` in conjunction with the contract `address` to fetch the image, name, symbol, and any other metadata that might exist for the token. This fetched metadata will be displayed in the request confirmation.

When type 'ERC721' is passed, the wallet MUST pass the `tokenId` parameter to the `tokenUri()` method on the contract address provided to fetch the metadata.

When type 'ERC1155' is passed, the wallet MUST pass the `tokenId` parameter to the `uri()` method on the contract address provided to fetch the metadata.


By retrieving the metadata directly from the token contract using the `tokenId` and contract `address`, we ensure a higher level of security compared to allowing the dApp to provide the image and other metadata directly in the request. This approach mitigates the risk of dApps providing invalid or malicious metadata, as the data is fetched from the original source (the token contract) rather than being supplied by potentially untrustworthy third parties. This results in a more secure and reliable user experience when adding ERC-721 and ERC-1155 tokens to MetaMask.

The proposed changes have been implemented in the following PR against the `MetaMask/api-specs` repo: https://github.com/MetaMask/api-specs/pull/138

## Caveats
The expansion of `wallet_watchAsset` to include ERC-721 and ERC-1155 tokens may result in a more complex user interface and increased storage requirements for MetaMask.

## Implementation
The MetaMask team will be responsible for implementing the proposed changes to the `wallet_watchAsset` method. This will involve updating the wallet's internal logic and user interface to accommodate the additional token types and parameters.

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