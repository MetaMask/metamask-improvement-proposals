---
mip: x
title: Adopt chain agnostic standards for a Multichain API
status: Draft
stability: n/a
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions/53
Authors: Alex Donesky (@adonesky1), Jiexi Luan (@jiexi), Vandan Parikh(@vandan) 
type: Maintainer
created: 2024-10-28
---

## Summary
This proposal recommends that MetaMask adopt a set of Chain Agnostic Improvement Proposals (CAIPs) to guide the design of a new Wallet API that is generalized for interactions between dapps and wallets in a multichain environment. A "Multichain API". Implementing these standards encourages broad adoption while enhancing interoperability, improving user experiences, and significantly streamlining development for multichain dapps.

### Goals
- Consistent Structure: Provide common patterns while separating namespaces of each ecosystem or network.
- Interoperability: Employ standards to encourage the development of powerful libraries with support for multiple wallets and networks
- Unlock the Design Space: Enable dapps to negotiate an interface with wallets for optimal multichain experiences.
- Security: Enhance security and privacy associated with wallets delived through Browser Extensions.

## Motivation
Valuable lessons have been learned from scaling the Ethereum dapp and wallet ecosystem. Now, a subset of [CAIPs](https://github.com/ChainAgnostic/CAIPs) offer a path to dramatically improve upon the prevailing patterns that had been established through [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) and [EIP-3326](https://eips.ethereum.org/EIPS/eip-3326) with chain-agnostic patterns that address long-standing issues. Furthermore, as decentralized networks continue to diversify, these patterns can be applied to non-EVM ecosystems so they can scale more efficiently and avoid common pain points associated with the demands of a growing dapp ecosystem that may require rapid evolution of Wallet APIs.

The Multichain API and associated CAIP standards promise to enable the following benefits for developers:
- Ability to interact with non-EVM decentralized networks through a consistent interface
- Ability to use interface negotiation to adopt innovative wallet features, while gracefully degrading for wallets that may not yet support them
- Ability to simultaneously interact with multiple networks
- Be notified of updates across multiple networks
- Elimination of excessive error handling involved with chain-switching across EVM networks

This proposal also generally encourages a privacy preserving and more secure alternative to provider injection (ex. `window.<provider>`) to establish communication between sites and browser extension wallets. 

## Usage Example

### Request
An example structure for a JSON-RPC request that an application would send to request authorization(s) from MetaMask:

```js
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "wallet_createSession",
  "params": {
    "optionalScopes": {
      "wallet:eip155": {
        "methods": ["wallet_addEthereumChain"],
      },
      "eip155:1": {
        "methods": ["eth_sendTransaction","eth_call","eth_getBalance","eth_blockNumber","eth_getTransactionCount","wallet_watchAsset","eth_subscribe"],
        "notifications": ["message"],
      },
      "eip155:59144": {
        "methods": ["eth_sendTransaction","eth_call","eth_getBalance","eth_blockNumber","eth_getTransactionCount","wallet_watchAsset","eth_subscribe"],
        "notifications": ["message"],
      },
      "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": {
        "methods": ["signAndSendTransaction","signAllTransactions","signMessage"],
        "notifications": ["accountChanged"],
      }
      "bip122:000000000019d6689c085ae165831e93": {
        ...
      }
    },
    "scopedProperties": {
      "eip155:1": {
        "rpcEndpoints": [{ 
          "chainName": "Ethereum (Infura)",
          "rpcUrls": ["https://mainnet.infura.io"],
          "nativeCurrency": {
              "name": "ETH",
              "symbol": "ETH",
              "decimals": 18,
          },
          "iconURLs": ["https://example.com/ethereum.svg"] 
        }],  
      },
      "eip155:59144": {
        "rpcEndpoints": [{ 
          "chainName": "Linea (Infura)",
          "rpcUrls": ["https://rpc.linea.build"],
          "nativeCurrency": {
              "name": "ETH",
              "symbol": "ETH",
              "decimals": 18,
          },
          "iconURLs": ["https://example.com/linea.svg"] 
        }],
      },
    },
  },
}
```

### Response
An example structure for the corresponding JSON-RPC response that an application would receive from the wallet:

```js
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "sessionScopes": { 
      "eip155:wallet": {
          "methods": ["wallet_addEthereumChain"],
          "accounts": ["eip155:wallet:0x0910e12C68d02B561a34569E1367c9AAb42bd810"]
      },
      "eip155:1": {
        "methods": ["eth_sendTransaction","eth_call","eth_getBalance","eth_blockNumber","eth_getTransactionCount","wallet_watchAsset","eth_subscribe"],
        "notifications": ["message"],
        "accounts": ["eip155:1:0x0910e12C68d02B561a34569E1367c9AAb42bd810"]
      },
      "eip155:59144": {
        "methods": ["eth_sendTransaction","eth_call","eth_getBalance","eth_blockNumber","eth_getTransactionCount","wallet_watchAsset","eth_subscribe"],
        "notifications": ["message"],
        "accounts": ["eip155:59144:0x0910e12C68d02B561a34569E1367c9AAb42bd810"]
      },
      "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": {
        "methods": ["signAndSendTransaction","signAllTransactions","signMessage"],
        "notifications": ["accountChanged"],
        "accounts": ["solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv"]
      }
    },      
  }
}
```

# Proposal

## Language
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" written in uppercase in this document are to be interpreted as described in RFC 2119.

## Definitions

**Multichain API**: a new [Wallet API](https://docs.metamask.io/wallet/concepts/wallet-api/) that is generalized for interactions between dapps and wallets in a multichain environment

**network**: Decentralized networks where control, validation, and decision-making processes are distributed across multiple nodes rather than centralized in a single entity. The term will refer to a specific decentralized network that has a single unique identifier. Networks may be implemented as a blockchain or another distributed ledger technology. 

**node**: An RPC node that facilitates interactions with a decentralized network.

**Wallet API**: [The JSON-RPC interface](https://docs.metamask.io/wallet/concepts/apis/) that applications can use to programmatically interact with MetaMask wallet clients.

**authorization**: A permission to access a resource over JSON-RPC.

**scope**: A uniquely identified domain for which authorizations can be applied (see [CAIP-217](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-217.md) for further definition). 

**authorization scopes**: A set of objects that specify authorizations for each scope.

## Proposal Specification

As part of MetaMask's Multichain API implementation, MetaMask will adopt the following standards noting implementation-specific guidelines or differences:

### CAIP-2 - Network Identifiers
The network identifiers used in the routing of Multichain API calls will generally follow [CAIP-2](https://chainagnostic.org/CAIPs/caip-2) conventions and [namespaces](https://github.com/ChainAgnostic/namespaces). However, network identifiers may be extended directly through Snaps and may not be limited to [Chain Agnostic Namespaces](https://namespaces.chainagnostic.org/).

> **Note:** Supported namespaces may be limited. Consult the [MetaMask documentation](https://docs.metamask.io/wallet/reference/multichain-api) for the most up-to-date information.

### CAIP-25 - Negotiate Multichain Authorization Scopes
Multichain API connections will be established and updated through [CAIP-25](https://chainagnostic.org/CAIPs/caip-25) `wallet_createSession` calls.

> **Note:** A `sessionId` will not be returned in the initial response. Instead, the API will adopt session lifecycle management methods outlined in [CAIP-316](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-316.md)

> **Note:**  MetaMask treats `requiredScopes` as `optionalScopes`. We only recommend using `optionalScopes`, though `requiredScopes` can be used to signal that your dapp will not be usable if certain [CAIP-217](https://chainagnostic.org/CAIPs/caip-217) `scopeStrings` are not authorized.

### CAIP-312 - Retrieve Authorization Scopes
An app can retrieve a [CAIP-312](https://chainagnostic.org/CAIPs/caip-312) multichain session object by calling `wallet_getSession` to request its authorization scopes at any time.

> **Note:** a `sessionId` parameter is not supported and will be ignored, if included.

### CAIP-311 - Notification of Changes to Authorization Scopes
An app can listen for [CAIP-311](https://chainagnostic.org/CAIPs/caip-311) `wallet_sessionChanged` events in order to get notified when there are changes to its authorization scopes.

> **Note:** A `sessionId` will not be included as part of the event.

### CAIP-285 - Revoke Authorization Scopes
An app can make a [CAIP-285](https://chainagnostic.org/CAIPs/caip-285) `wallet_revokeSession` request to revoke all of its authorization scopes.

> **Note:** a `sessionId` parameter is not supported and will be ignored, if included.

### API Specification Document
An OpenRPC [specification for the Multichain API](https://github.com/MetaMask/api-specs/blob/main/multichain/openrpc.yaml) can be found in the [api-specs](https://github.com/MetaMask/api-specs) repository.

## Caveats
The CAIPs referenced in this proposal are still in Draft or Review status with CASA and may be subject to material changes.

## Implementation
API Maintainers will implement the multichain interface in coordination with multiple MetaMask teams.
The Multichain API is intended to interoperate with MetaMask Snaps. See [SIP-26](https://github.com/MetaMask/SIPs/blob/ed17dd33713e6c2203f11b85ba655ae4acbcca7a/SIPS/sip-26.md) for a high-level overview of the associated architectural approach.

## Developer Adoption Considerations
Backward compatibility will be maintained through the existing Ethereum Provider API (namely [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) and [EIP-3326](https://eips.ethereum.org/EIPS/eip-3326)). However, the Multichain API WILL NOT be available through the existing Ethereum Provider API. Because many developers rely on third-party libraries to connect their applications with wallets, mapping logic that allows them to keep their "single chain" code as-is while actually passing calls on to an underlying Multichain API may facilitate more rapid adoption. 

Given its flexibility and advantages, developers should expect new improvements to the Wallet API to be primarily delivered though the Multichain API, as opposed to the [Ethereum Provider API](https://docs.metamask.io/wallet/reference/provider-api/).

Once there is sufficient industry adoption of the Multichain API, backward-compatibility may be gradually deprecated and discontinued.

## User Experience Considerations
Initial calls to the `wallet_authorize` method with `optionalScopes` that include any eip155:[reference] scopes will trigger a flow with this sequence:

```mermaid
    app->>+MetaMask: wallet_createSession Request
    actor User
    MetaMask->>User: Review Default Authorizations
    activate User
    User->>MetaMask: Edit Authorizations (optional)
    User-->>MetaMask: Confirm
    deactivate User
    MetaMask-->>-app: wallet_createSession Response
```

> **Note:** There is no guarantee that an authorization request is surfaced in the wallet as **required**. Your application should gracefully handle situations where some authorizations submitted are denied even though the app is considered connected to MetaMask.

## Privacy Considerations
This proposal raises important privacy considerations, including the need to avoid data leaking and the challenge of obtaining genuine user consent. It underscores the importance of preserving user anonymity and the sensitivites involved in determining authorizations. Identifying and mitigating these issues is crucial for protecting user privacy during multichain interactions, prompting a careful evaluation of how best to balance functionality with privacy concerns.

## Security Considerations
This proposal is an opportunity to further incorporate the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege) in MetaMask at least at the API-level.

The proposal also brings to light some security considerations critical to multichain interactions. These include the challenges of ensuring robust authentication and authorization and the importance that users understand the network with which they are interacting. Identifying and addressing these issues is vital for safeguarding users against the evolving landscape of security threats.

## References
- [CAIP-25](https://chainagnostic.org/CAIPs/caip-25)
- [CAIP-2](https://chainagnostic.org/CAIPs/caip-2)
- [CAIP-10](https://chainagnostic.org/CAIPs/caip-10)
- [CAIP-217](https://chainagnostic.org/CAIPs/caip-217)
- [CAIP-316](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-316.md)
- [CAIP-312](https://chainagnostic.org/CAIPs/caip-312)
- [CAIP-311](https://chainagnostic.org/CAIPs/caip-311)
- [CAIP-285](https://chainagnostic.org/CAIPs/caip-285)

### Feedback
[Provide a way for interested parties to give feedback or make suggestions, such as a GitHub issue or discussion thread]

### Committed Developers
[List the names of developers who have committed to using this proposal in an experimental state. This will help gauge community interest and adoption.]

Note: This proposal template is meant to be adapted for different contexts and may require additional sections or information depending on the specific proposal.

## Copyright
Copyright and related rights waived via [CC0](../LICENSE).