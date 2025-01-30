---
mip: 7
title: Implement 7715 Permissions API
status: Draft
stability: n/a
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions
author(s): Idris Bowman (@V00D00-child)
type: Community
created: 2025-01-30
---

## Summary
This proposal aims to add two new JSON-RPC methods, `wallet_grantPermissions` and `wallet_revokePermissions`, to MetaMask as defined by [ERC-7715](https://eip.tools/eip/7715). These methods provide an interface for granting granular permissions as cryptographic capabilities that allow dApps to execute transactions on the users' behalf. This significantly reduces user friction without compromising security. Thus, it offers an Oauth2 connection pattern that feels familiar and safe to users.

## Motivation
Today, a user comes to a site and clicks a connect button, granting the site access to see all the assets the user holds and their balances(show me what you got). The site can then suggest an arbitrary transaction to spend some of a user's assets with user consent(give me what I want). This connection pattern has some hurdles preventing developers from building an ecosystem of dApps that can challenge traditional apps while ensuring user safety at a scale of mass adoption. These hurdles are:
1. Too many prompts: Prompting for user consent on every action is necessary to maintain security but is unfamiliar to users from traditional Oauth2 permission systems.
2. Phishing attacks: Malicious sites that abuse the permissions system can cherry-pick a user's assets since they can see all the assets the user holds and suggest any transactions.

Wallets can alleviate some of today's connection hurdles by providing a non-breaking alternative connection model built on 7715 permissions to support a new ecosystem of web3 primitives. The ERC-7715 Permissions API will enable the following benefits for developers:
- Native access to smart contract account in MetaMask.
- Improved dApp connection flows with the least privilege permissions pattern.
- Human-readable permissions with a single consent screen(session cookie flow) that improve UX without comprised security.
- Access to new primitives to build dApps that allow executing user transactions outside the context of a wallet in a safe manner.
- High level of security without adding cognitive load so users can feel safe without needing excessive amounts of technical knowledge.

The MetaMask Wallet API currently lacks a way for users to grant granular permissions as capabilities to sites. This proposal aims to implement:
- Attenuated–adjusted permissions: Implementing 7715 `wallet_grantPermissions` will allow sites to provide a set of chain agnostic permissions as defined by 7715, each of which could be individually rejected(i.e., if not strictly required by the site) or attenuated-adjusted to meet the user terms.
- Revoking permissions: Implementing 7715 `wallet_revokePermissions` allows users to revoke 7715 permissions granted to sites.
- New dApp communication protocol: Updating today's `wallet_requestPermission` introduced by [EIP-2255](https://eips.ethereum.org/EIPS/eip-2255) to support an alternative connection model that allows dApps to execute transactions on the user's behalf with permissions grant from new 7715 JSON-RPC methods.

Introducing an alternative dApp communication protocol rooted in the least private principles, MetaMask further aligns with traditional permission systems, strengthening the long-term offering of a permissionless, secure ecosystem.

## Usage Example
[Provide an illustrative example of the proposed API or feature in use]

### Request
An example structure for a JSON-RPC request that an application would send to request authorization(s) from MetaMask:

```js
provider.request({
  method: 'wallet_grantPermissions',
  params: [
    {
      chainId: '0x1',
      expiry: 1577840461,
      signer: {
        type: 'account',
        data: {
          address: '0xA8626B46993E94FfAc95f00ec6A5e250E6dc31E2',
        },
      },
      permission: {
        type: 'native-token-transfer',
        data: {
          justification: 'shh...',
          allowance: '0x1DCD6500',
        },
      },
    },
    {
      chainId: '0x1',
      expiry: 1577840461,
      signer: {
        type: 'account',
        data: {
          address: '0xA8626B46993E94FfAc95f00ec6A5e250E6dc31E2',
        },
      },
      permission: {
        type: 'erc20-token-transfer',
        data: {
          justification: 'Give me some Pepe',
          address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
          allowance: '0x1DCD6500',
        },
      },
    },
  ],
});
```

### Response
An example structure for the corresponding JSON-RPC response that an application would receive from the wallet:

```json
[
  {
    "address": "0x490926eD8Db90947Fe04581cE4673677D5422aa9",
    "chainId": "0x1",
    "expiry": 1577840461,
    "signer": {
      "type": "account",
      "data": {
        "address": "0xA8626B46993E94FfAc95f00ec6A5e250E6dc31E2"
      }
    },
    "permission": {
      "type": "native-token-transfer",
      "data": {
        "justification": "shh...",
        "allowance": "0x1DCD6500"
      }
    },
    "context": "0x0000000000",
    "accountMeta": {
      "factory": "0xfF9E4F0e6975fbB85b08796129f3378A9B7DBcb9",
      "factoryData": "0x0000000000"
    },
    "signerMeta": {
      "delegationManager": "0x0a52b3dF0b92825F01F9570D587b6e43062B2810"
    }
  },
  {
    "address": "0x490926eD8Db90947Fe04581cE4673677D5422aa9",
    "chainId": "0x1",
    "expiry": 1577840461,
    "signer": {
      "type": "account",
      "data": {
        "address": "0xA8626B46993E94FfAc95f00ec6A5e250E6dc31E2"
      }
    },
    "permission": {
      "type": "erc20-token-transfer",
      "data": {
        "justification": "Give me some Pepe",
        "allowance": "0x1DCD6500",
        "address": "0x6982508145454Ce325dDbE47a25d4ec3d2311933"
      }
    },
    "context": "0x0000000000",
    "accountMeta": {
      "factory": "0xfF9E4F0e6975fbB85b08796129f3378A9B7DBcb9",
      "factoryData": "0x0000000000"
    },
    "signerMeta": {
      "delegationManager": "0x0a52b3dF0b92825F01F9570D587b6e43062B2810"
    }
  }
]
```

# Proposal

## Language
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" written in uppercase in this document are to be interpreted as described in RFC 2119.

## Proposal Specification
[Provide a detailed description of the proposed changes, including any relevant technical specifications or examples]

[Include a reference to the OpenRPC specification for any JSON-RPC APIs being proposed - this should be done by opening a PR on the [api-specs](https://github.com/MetaMask/api-specs) repository]

## Caveats
While the `wallet_grantPermissions` is not a supported method in the MetaMask Wallet API, a `wallet_revokePermissions` method was introduced by [MIP-2](https://github.com/MetaMask/metamask-improvement-proposals/blob/main/MIPs/mip-2.md). The `wallet_revokePermissions` method of MIP-2 and ERC-7715 both provide different functionalities. Exposing a separate rpc method(e.g., wallet_revokeGrantedPermissions) that routes to an internal 7715 `wallet_revokePermissions` may be required to avoid collisions.

**Permissions**
In the context of this proposal, 'permissions' is a bit overloaded and can refer to the native permissions system that exists today in MetaMask Wallet API or the proposed introduction of the 7715 permissions system. 

To avoid confusion with developers when merging these two systems, the usage of `wallet-permissions` could refer to permissions introduced by [EIP-2255](https://eips.ethereum.org/EIPS/eip-2255), while the usage of `asset-permissions` refers to permissions introduced by [ERC-7715](https://eip.tools/eip/7715).

## Implementation
API Maintainers will implement the 7715 permission interface in coordination with multiple MetaMask teams.

## Developer Adoption Considerations
This proposal introduces a non-breaking optional opt-in alternative connection path, so exiting dApps slow to adopt it will not need to make changes at release.

Developers who choose early adoption should carefully consider the UX of managing today's connection models alongside the proposed alternate connection model. Developers building new apps may choose to only support the alternate connection model, given the massive UX gains.

A granular permissions system using ERC-7715 as a foundation offers flexibility and extensibility. Developers should expect additional backward-compatible features that build on this proposal.

Once the 7715 Permissions API reaches mass adoption in the industry, today's connection models may be deprecated.

## User Experience Considerations
The proposed JSON-RPC methods offer users a significantly different experience with dApps that will require education.

## References
- [EIP-1102](https://eips.ethereum.org/EIPS/eip-1102)
- [EIP-2255](https://eips.ethereum.org/EIPS/eip-2255)
- [ERC-7710](https://eip.tools/eip/7710)
- [ERC-7715](https://eip.tools/eip/7715)
- [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337)

### Feedback
Submit feedback in the [discussion](https://github.com/MetaMask/metamask-improvement-proposals/discussions) for this MIP.

### Committed Developers
MetaMask

## Copyright
Copyright and related rights waived via [CC0](../LICENSE).