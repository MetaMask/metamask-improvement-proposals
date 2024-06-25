---
mip: x
title: Multinetwork Wallet Method Calls
status: Draft
stability: n/a
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions
author(s): Alex Donesky (@adonesky1), Jiexi Luan (@jiexi), Shane Jonas (@shanejonas), Vandan Parikh (@vandan)
type: Maintainer
created: 2024-01-25
---

## Summary
The proposal aims to specify the implementation of the [CAIP-27](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-27.md) standard for Multinetwork API calls in MetaMask, providing a clear and standardized way for applications to make JSON-RPC requests that can be scoped to a specific network. By wrapping network-specific JSON-RPC calls and supplying a routing parameter, developers can submit requests for multiple distinct networks without setting a global network context.

This method is intended to be part of a new version of the MetaMask Wallet API that is optimized for multinetwork interactions.

## Motivation
Both users and application builders are increasingly interested in experiences that involve multiple chains. MetaMask shouldn't get in their way.

This proposal is intended to support the following objectives:
- Unlocking user experiences that involve minimal friction when interacting across different chains (both in apps and MetaMask)
- Simplifying development for app builders
- Aligning MetaMask with community standards to simplify integrations and tooling in the ecosystem
- Increasing MetaMask's utility as a mulitnetwork wallet

The `wallet_invokeMethod` call structure is design to retain the native method signature of each network to support optimal compability and minimize integration overhead for existing apps. Current activities that involve multiple netowrks may realize improved conversion rates through the Multinetwork API. 

Generally, the implementation of a Multinetwork API will serve as a significant enabler of permissionless innovation in the community. We anticipate that it will drive  significant growth in existing and entirely new categories of apps.

# Proposal

## Language
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" written in uppercase in this document are to be interpreted as described in RFC 2119.

## Definitions

See the definitions outlined in [MIP-X](./mip-x-authorize.md)

**routing parameter**: A parameter that is exclusively used for routing requests to a subsystem in MetaMask. The term `scope` may be used interchangably with "routing parameter" for the purpose of this MIP.

## Proposal Specification

### Multinetwork Wallet Request

According to the CAIP-27 standard, a JSON-RPC request scoped to a particular chain should be made by wrapping JSON-RPC requests inside a `wallet_invokeMethod` JSON-RPC method. This `wallet_invokeMethod` method should contain an additional `scope` parameter that indicates where the request will be routed and a `request` parameter for the scope-specific JSON-RPC request.

#### Example of a CAIP-27 compliant request

##### Single Request
Here is an example of how a method to query an Ethereum Mainnet balance would be wrapped in a `wallet_request`:

```javascript
provider.request({
  "jsonrpc": "2.0",
  "method": "wallet_invokeMethod",
  "params":{
    "version": "0.0.1",
    "scope": "eip155:1",
    "request":{
      "method": "eth_getBalance",
      "params": ["0xabc...","latest"]
    },
  },
  "id": 1,
});
```

In this example, the `scope` field is populated with the [CAIP-2](https://chainagnostic.org/CAIPs/caip-2) identifier for Ethereum Mainnet, and the `request` field contains the typical JSON-RPC request for getting an Ethereum balance.

##### Batch Request for Multiple Chains
Here's an example of how JSON-RPC batch requests to get balances from both Ethereum Mainnet and Binance Smart Chain would be called by wrapping the requests in a `provider_request`:

```javascript
provider.request([
  {
    "jsonrpc": "2.0",
    "method": "wallet_invokeMethod",
    "params": {
      "scope": "eip155:1",
      "request": {
        "method": "eth_getBalance",
        "params": ["0xabc...", "latest"],
      },
    },
    "id": 1,
  },
  {
    "jsonrpc": "2.0",
    "method": "wallet_invokeMethod",
    "params": {
      "scope": "eip155:59144",
      "request": {
        "method": "eth_getBalance",
        "params": ["0xabc...", "latest"],
      },
    },
    "id": 2,
  }
]);
```

In this example, the `wallet_invokeMethod` wraps each JSON-RPC `eth_getBalance` request with a separate CAIP-27 request, one explicitly scoped to Ethereum Mainnet (`eip155:1`) and another to Linea Mainnet (`eip155:59144`).

#### Valid `scope` Routing Parameter

The `scope` routing parameter is meant to be a [CAIP-217](https://chainagnostic.org/CAIPs/caip-217) `scopeString` 

Valid CAIP-217 `scopeStrings` SHALL include and will initially be limited to:
- `wallet` - reserved for requests that are unrelated to any particular `namespace` or network
- `eip155:wallet` - for requests that are particular to the `eip155` `namespace`, but involve a function that is not specific to a particular network
- `eip155:[reference]` a [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) identifier with both an `eip155` namespace and `reference`

> **Note:** In the future, these scopes may be extended to support a broad range of [CAIP-2 Namespaces](https://namespaces.chainagnostic.org/) as well as Snap managed namespaces or identifiers.

#### Reference Spec
The proposed changes have been specified in a machine-readable format in the following PR against the `MetaMask/api-specs` repo: [add URL here]()

### Error Handling
If MetaMask is not connected to the network specified in the `scope`, an error should be returned. The error message should guide the app to request the addition of the appropriate network.

If an invalid `scope` is specified, then an error should be returned.

## Backwards Compatibility
The `wallet_request` method is introduced through the [Multichain API](./mip-x-authorize.md), which is completely separate from the existing JSON-RPC methods. Existing JSON-RPC that are called without the `wallet_request` wrapper would remain available for backward compatibility.

## Test Cases
General test cases should cover:
- Successful request with correct `scope`
- Error handling when `scope` is not provided
- Error handling when an unsupported `scope` is provided

Test cases for scope-specific JSON-RPC method calls are beyond the scope of this proposal.

## Caveats
[List any potential drawbacks, limitations, or risks associated with the proposal]

## Implementation
MetaMask's JSON-RPC request-handling code needs to be updated to support `wallet_invokeMethod`. Appropriate UI updates are also needed to ensure that users are sufficiently informed and aware of what they are interacting with or being asked to confirm.

A new suite of tests will be added to comprehensively cover key test cases.
Technical documentation and developer tools will have to be updated to include the Multinetwork API.

API Maintainers will be implementing the Multichain API in coordination with other MetaMask teams.

## Developer Adoption Considerations
The implementation would be designed to be fully backward-compatible. Existing methods for changing networks and executing transactions would remain unaffected. Once there is sufficient industry adoption of the Multichain API, backward-compatibility may be reconsidered and gradually deprecated. 

The advantage of [CAIP-27](https://chainagnostic.org/CAIPs/caip-27) is that it allows for routing of method calls across networks that may have completely different method signatures and call patterns. CAIP-27 calls requie no alteration to method signatures that are native to a network or ecosystem.

## User Experience Considerations
MetaMask must handle simultaneous API calls that may involve different networks.
MetaMask should ensure that users understand the chain with which they are interacting.

## Security Considerations
The `scope` field adds an extra layer of security by explicitly defining the network for which the JSON-RPC request is intended, reducing the risk of misrouting.

## References
[CAIP-27](https://chainagnostic.org/CAIPs/caip-27)

### Committed Developers
MetaMask

## Open Issues
List of significant open issues that require resolution in order for this MIP to be ready to be moved to the `Review` stage:
- Add OpenRPC specs for `wallet_invokeMethod`
- Determine whether API versioning should be incorporated into this MIP
- Elaborate on user experience, error messages, security, and privacy considerations

## Copyright
Copyright and related rights waived via [CC0](../LICENSE).
