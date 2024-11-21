---
mip: x
title: Multichain API for Ethereum
status: Draft
stability: n/a
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions/53
author(s): Alex Donesky (@adonesky1), Jiexi Luan (@jiexi), Vandan Parikh(@vandan) 
type: Maintainer
created: 2024-10-28
---

## Summary
This proposal supplements [MIP-x](./mip-x-multichainapi.md) with additional specifications for Ethereum-compatible networks.

## Motivation
Developers building against Ethereum-compatible networks stand to benefit the most from the simplified developer experience associated with the Multichain API. 

The Multichain API and associated CAIP standards promise to enable the following benefits for these developers:
- Elimination of excessive error handling involved with chain-switching across EVM networks
- Employ interface negotiation patterns to adopt novel wallet features, while gracefully degrading for wallets that may not yet support them
- Ability to simultaneously interact with multiple networks
- Be notified of updates across multiple networks

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
        "notifications": ["eth_subscription"],
        "accounts": ["eip155:1:0x0910e12C68d02B561a34569E1367c9AAb42bd810"]
      },
      "eip155:59144": {
        "methods": ["eth_sendTransaction","eth_call","eth_getBalance","eth_blockNumber","eth_getTransactionCount","wallet_watchAsset","eth_subscribe"],
        "notifications": ["eth_subscription"],
        "accounts": ["eip155:59144:0x0910e12C68d02B561a34569E1367c9AAb42bd810"]
      },
    },      
  }
}
```

# Proposal

## Language
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" written in uppercase in this document are to be interpreted as described in RFC 2119.

## Definitions

## Proposal Specification

### Valid scopeStrings

`scopeObjects` must conform to [CAIP-217](https://chainagnostic.org/CAIPs/caip-217)

Valid CAIP-217 `scopeStrings` for Ethereum-compatible networks shall include and will initially be limited to:
- `wallet` - for general authorizations that are unrelated to a specific network or `namespace`
- `wallet:eip155` - for authorizations that are particular to the `eip155` `namespace`, but involve a function that is not specific to a particular network
- `eip155:[reference]` - for chain-specific authorizations using a [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) identifier with both an `eip155` `namespace` and `reference`

### Valid scopedProperties
When a MetaMask user does not have an existing network configured for a given `eip155[reference]` scope, including metadata for `rpcEndpoints` in the `scopedProperties` serves as a suggestion for the user to add the RPC network. MetaMask will expect the `rpcEndpoints` parameter to conform with the [EIP-3085](https://eips.ethereum.org/EIPS/eip-3085) standard.

> **Note:** MetaMask does not yet support prompting for RPC additions as part of the [CAIP-25](https://chainagnostic.org/CAIPs/caip-25) connection flow, but may do so in the future. 

### API Specification Document
An OpenRPC [specification for the Multichain API](https://github.com/MetaMask/api-specs/blob/main/multichain/openrpc.yaml) can be found in the [api-specs](https://github.com/MetaMask/api-specs) repository.

## Caveats
While most existing Ethereum methods will be familiar under the Multichain API, the new API renders some standard methods and events either redundant or incompatible with the new interaction patterns. The following Ethereum standards will not be supported through the Multichain API. However, they will remain accessible through the EIP-1193 interface for backward compatibility.

**Discontinued Methods:**
eth_requestAccounts
eth_accounts
wallet_getPermissions
wallet_requestPermissions
wallet_revokePermissions
wallet_switchEthereumChain
eth_signTypedData
eth_signTypedData_v3

**Discontinued Events:**
- connect
- disconnect
- chainChanged
- accountsChanged

## Implementation
API Maintainers will implement the multichain interface in coordination with multiple MetaMask teams.

## Developer Adoption Considerations
For Ethereum networks, backward compatibility will be maintained through the existing Ethereum Provider API (namely [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) and [EIP-3326](https://eips.ethereum.org/EIPS/eip-3326)).
Because many developers rely on third-party libraries to connect their applications with wallets, mapping logic that allows them to keep their "single chain" code as-is while actually passing calls on to an underlying Multichain API may facilitate more rapid adoption. 

Given its flexibility and advantages, developers should expect new improvements to the Wallet API to be primarily delivered though the Multichain API, as opposed to the [Ethereum Provider API](https://docs.metamask.io/wallet/reference/provider-api/).

Once there is sufficient industry adoption of the Multichain API, backward-compatibility may be gradually deprecated and discontinued.

### Feedback
Submit feedback in the [discussion](https://github.com/MetaMask/metamask-improvement-proposals/discussions/53) for this MIP.

### Committed Developers
MetaMask

## Copyright
Copyright and related rights waived via [CC0](../LICENSE).