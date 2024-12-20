---
mip: 6
title: Multichain API for Ethereum
status: Draft
stability: n/a
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions/53
author(s): Alex Donesky (@adonesky1), Jiexi Luan (@jiexi), Vandan Parikh(@vandan) 
type: Maintainer
created: 2024-10-28
---

## Summary
This proposal supplements [MIP-5](./mip-5.md) with additional specifications for EVM networks.

## Motivation
Current single chain EVM Wallet APIs severely limit EVM dapp development and cause a great deal of unnecessary friction for users operating in an ecosystem with rapidly growing number of chains. As such, Dapp developers and end users stand to benefit tremendously from the improved DevEx and UX that the Multichain API will provide. 

The Multichain API will enable the following benefits for developers:
- Concurrent cross chain state reading
- Elimination of chain switching
- Improved connection flows, with better interfaces for dapps to understand wallet capabilities and add missing networks on the fly.

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
        "notifications": [],
      },
      "eip155:1": {
        "methods": ["eth_sendTransaction","eth_call","eth_getBalance","eth_blockNumber","eth_getTransactionCount","wallet_watchAsset","eth_subscribe"],
        "notifications": ["eth_subscription"],
      },
      "eip155:59144": {
        "methods": ["eth_sendTransaction","eth_call","eth_getBalance","eth_blockNumber","eth_getTransactionCount","wallet_watchAsset","eth_subscribe"],
        "notifications": ["eth_subscription"],
      },
    },
    "scopedProperties": {
      "eip155:1": {
        "eip3085": [
          "chainName": "Ethereum (Infura)",
          "rpcUrls": ["https://mainnet.infura.io"],
          "nativeCurrency": {
              "name": "ETH",
              "symbol": "ETH",
              "decimals": 18,
          },
        ],
      },
      "eip155:59144": {
        "eip3085": [
          "chainName": "Linea (Infura)",
          "rpcUrls": ["https://rpc.linea.build"],
          "nativeCurrency": {
              "name": "ETH",
              "symbol": "ETH",
              "decimals": 18,
          },
        ],
      },
    },
  },
};
```

### Response
An example structure for the corresponding JSON-RPC response that an application would receive from the wallet:

```js
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "sessionScopes": { 
      "wallet:eip155": {
          "methods": ["wallet_addEthereumChain"],
          "notifications": [],
          "accounts": ["wallet:eip155:0x0910e12C68d02B561a34569E1367c9AAb42bd810"]
      },
      "eip155:1": {
        "methods": ["wallet_watchAsset","eth_sendTransaction","personal_sign","eth_signTypedData_v4","web3_clientVersion","eth_subscribe","eth_unsubscribe", "eth_blockNumber", "eth_call","eth_estimateGas","eth_feeHistory","eth_gasPrice","eth_getBalance","eth_getBlockByHash","eth_getBlockByNumber","eth_getBlockTransactionCountByHash","eth_getBlockTransactionCountByNumber","eth_getCode","eth_getFilterChanges","eth_getFilterLogs","eth_getLogs","eth_getProof","eth_getStorageAt","eth_getTransactionByBlockHashAndIndex","eth_getTransactionByBlockNumberAndIndex","eth_getTransactionByHash","eth_getTransactionCount","eth_getTransactionReceipt","eth_getUncleCountByBlockHash","eth_getUncleCountByBlockNumber","eth_newBlockFilter","eth_newFilter","eth_newPendingTransactionFilter","eth_sendRawTransaction","eth_syncing","eth_uninstallFilter"],
        "notifications": ["eth_subscription"],
        "accounts": ["eip155:1:0x0910e12C68d02B561a34569E1367c9AAb42bd810"]
      },
      "eip155:59144": {
        "methods": ["wallet_watchAsset","eth_sendTransaction","personal_sign","eth_signTypedData_v4","web3_clientVersion","eth_subscribe","eth_unsubscribe", "eth_blockNumber", "eth_call","eth_estimateGas","eth_feeHistory","eth_gasPrice","eth_getBalance","eth_getBlockByHash","eth_getBlockByNumber","eth_getBlockTransactionCountByHash","eth_getBlockTransactionCountByNumber","eth_getCode","eth_getFilterChanges","eth_getFilterLogs","eth_getLogs","eth_getProof","eth_getStorageAt","eth_getTransactionByBlockHashAndIndex","eth_getTransactionByBlockNumberAndIndex","eth_getTransactionByHash","eth_getTransactionCount","eth_getTransactionReceipt","eth_getUncleCountByBlockHash","eth_getUncleCountByBlockNumber","eth_newBlockFilter","eth_newFilter","eth_newPendingTransactionFilter","eth_sendRawTransaction","eth_syncing","eth_uninstallFilter"],
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

Valid CAIP-217 `scopeStrings` for EVM networks shall include (and will, initially, be limited to):
- `wallet` - for methods that are not specific to a network or [CASA namespace][casa-namespaces] (e.g. `wallet_scanQRCode`)
- `wallet:eip155` - for methods that are particular to EVM networks (e.g. the `eip155` namespace), but do not target a specific network (e.g. `wallet_addEthereumChain`)
- `eip155:[reference]` - for chain-specific authorizations using a [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) identifier with both an `eip155` `namespace` and `reference`

### Valid scopedProperties
A dapp may include metadata for `rpcEndpoints` in the `scopedProperties` object to suggest (and provide the required networkConfiguration for) the addition of a given network which the wallet instance does not yet have installed. MetaMask will expect the `rpcEndpoints` parameter to conform to the [EIP-3085](https://eips.ethereum.org/EIPS/eip-3085) standard interface.

> **Note:** MetaMask does not yet support network additions via the [CAIP-25](https://chainagnostic.org/CAIPs/caip-25) connection flow, but will in the future. 

### API Specification Document
An OpenRPC [specification for the Multichain API](https://github.com/MetaMask/api-specs/blob/main/multichain/openrpc.yaml) can be found in the [api-specs](https://github.com/MetaMask/api-specs) repository.

## Caveats
While most methods from the existing API will also be available on the Multichain API, the new API renders some methods and notifications redundant or incompatible. The following methods will not be supported through the Multichain API. However, they will remain accessible through the injected [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) API for backwards compatibility.

**Discontinued Methods:**
- `eth_requestAccounts`
- `eth_chainId`
- `eth_getEncryptionPublicKey`
- `eth_decrypt`
- `eth_accounts`
- `wallet_getPermissions`
- `wallet_requestPermissions`
- `wallet_revokePermissions`
- `wallet_switchEthereumChain`
- `eth_signTypedData`
- `eth_signTypedData_v3`


**Discontinued Events:**
- `connect`
- `disconnect`
- `chainChanged`
- `accountsChanged`
- `message`

## Implementation
API Maintainers will implement the multichain interface in coordination with multiple MetaMask teams.

## Developer Adoption Considerations
For EVM networks, backward compatibility will be maintained through the existing injected `window.ethereum` API (namely [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) and [EIP-3326](https://eips.ethereum.org/EIPS/eip-3326)).
Because many developers rely on third-party libraries to connect their applications with wallets, mapping logic that allows them to keep their "single chain" code as-is while actually passing calls on to an underlying Multichain API may facilitate more rapid adoption. 

Given its flexibility and advantages, developers should expect new improvements to the Wallet API to be primarily delivered though the Multichain API, as opposed to the [Ethereum Provider API](https://docs.metamask.io/wallet/reference/provider-api/).

Once there is sufficient industry adoption of the Multichain API, the injected provider may be deprecated.

### Feedback
Submit feedback in the [discussion](https://github.com/MetaMask/metamask-improvement-proposals/discussions/53) for this MIP.

### Committed Developers
MetaMask

## Copyright
Copyright and related rights waived via [CC0](../LICENSE).