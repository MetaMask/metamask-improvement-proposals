---
MIP: X
Title: Multichain Provider Request Routing
Status: Draft
Stability: n/a
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions
Author(s): Vandan Parikh (@vandan), Alex Donesky (@adonesky1)
Type: Maintainer
Created: 2024-01-25
---

## Summary
The proposal aims to specify the implementation of the [CAIP-27](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-27.md) standard for multi-chain wallet API calls in MetaMask, providing a clear and standardized way for dApps to make JSON-RPC requests that can be scoped to a specific chain. By wrapping typical JSON-RPC calls within a "provider_request" that includes a "scope," developers can specify which chain the request is intended for.

## Motivation
Both users and dapp builders are increasingly interested in experiences that involve multiple chains. MetaMask shouldn't get in their way.

This proposal is intended to support the following objectives:
- Unlocking user experiences that involve minimal friction when interacting across different chains (both in dApps and MetaMask).
- Simplifying development for dapp builders.
- Aligning MetaMask with community standards to simplify integrations and tooling in the ecosystem.
- Increasing MetaMask's utility as a universal wallet solution.

Improved conversion rates on current activities that involve multiple chains can be realized through the Multichain API. More importantly, the implementation of a multichain API will serve as a significant enabler of permissionless innovation in the community. We anticipate that it will drive dramatic growth in existing and entirely new categories of dApps.

# Proposal

## Language
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" written in uppercase in this document are to be interpreted as described in RFC 2119.

## Definitions

Add a note about how we use the terms `chain` and `network` interchangeably
Establish what we mean by `Multichain API`
Make reference to CAIPs for further definitions that may be referenced here.

[Provide detailed definitions for any new terms or concepts introduced in the proposal]

## Proposal Specification

### JSON-RPC Provider Request

According to the CAIP-27 standard, a JSON-RPC request scoped to a particular chain should be made by wrapping the original JSON-RPC request inside a `provider_request` JSON-RPC method. This `provider_request` method should contain a `scope` (indicating the chain ID) and a `request` (indicating the original JSON-RPC request).

#### Example of a CAIP-27 compliant request

##### Single Request
Here's an example of how a single JSON-RPC request targeted to Ethereum Mainnet would be wrapped in a provider_request when attempting to query a balance on Ethereum Mainnnet:

```javascript
ethereum.request({
    "jsonrpc": "2.0",
    "method": "provider_request",
    "params":[{
        "version": "0.0.1",
        "scope": "eip155:1",
        "request":{
            "method": "eth_getBalance",
            "params": ["0xabc...","latest"]
        }
    }]
    "id": 1
});
```

In this example, the `scope` field is populated with the chain ID corresponding to Ethereum Mainnet (as per CAIP-10), and the `request` field contains the typical JSON-RPC request for getting an Ethereum balance.

##### Batch Request for Multiple Chains
Here's an example of how JSON-RPC batch requests to get balances from both Ethereum Mainnet and Binance Smart Chain would be called by wrapping the requests in a `provider_request`:

```javascript
ethereum.request([
  {
    "jsonrpc": "2.0",
    "method": "provider_request",
    "params": {
        "scope": "eip155:1",
        "request": {
            "method": "eth_getBalance",
            "params": ["0xabc...", "latest"]
      }
    }
    "id": 1
  },
  {
    "jsonrpc": "2.0",
    "method": "provider_request",
    "params": {
        "scope": "eip155:59144",
        "request": {
            "method": "eth_getBalance",
            "params": ["0xabc...", "latest"]
      }
    }
    "id": 2
  }
]);
```

In this example, the `provider_request` wraps each JSON-RPC `eth_getBalance` request with a separate CAIP-27 request, one explicitly scoped to Ethereum Mainnet (`eip155:1`) and another to Linea (`eip155:59144`).

For consistency and excepting [provider_authorization](mip-mc-handshake.md), all MetaMask JSON-RPC requests will be made through a `provider_request` including those that are `wallet` scoped. See [provider_authorization](mip-mc-handshake.md) for information about supported scopes.

#### Reference Spec
The proposed changes have been specified in a machine-readable format in the following PR against the `MetaMask/api-specs` repo: [add URL here]()

### Error Handling
If MetaMask is not connected to the chain specified in the `scope`, an error should be returned. The error message should guide the dapp to request the addition of the appropriate network.

If an invalid `scope` is specified, then an error should be returned.

## Backwards Compatibility
The `provider_request` method is introduced through the [Multichain API](mip-mc-delivery.md), which is completely separate from the existing JSON-RPC methods. Existing JSON-RPC that are called without the `provider_request` wrapper would continue to work as they currently do.

## Test Cases
General test cases should cover:
- Successful request with correct `scope`
- Error handling when `scope` is not provided
- Error handling when an unsupported `scope` is provided

Test cases for specific JSON-RPC `method` calls are outside the scope of this proposal.

## Caveats
[List any potential drawbacks, limitations, or risks associated with the proposal]

## Implementation
MetaMask's JSON-RPC request-handling code needs to be updated to support this new `provider_request` method. Appropriate UI updates are also needed to ensure that users are sufficiently informed and aware of what they are interacting with or being asked to confirm.

A new suite of tests will be added to comprehensively cover key test cases.
Technical documentation and developer tools will have to be updated to include the Multichain API.

API Maintainers will be implementing the Multichain API in coordination with other MetaMask team members.

## Developer Adoption Considerations
[Explain any considerations that developers should take into account when adopting this proposal. For example, how will it affect compatibility, and what changes may need to be made to accommodate the proposal?]

The implementation would be designed to be fully backward-compatible. Existing methods for changing networks and executing transactions would remain unaffected. Once there is sufficient industry adoption of the Multichain API, backward-compatibility may be reconsidered and gradually deprecated. 

## User Experience Considerations
[Explain any user experience implications of the proposal]

## Security Considerations
The `scope` field adds an extra layer of security by explicitly defining the chain for which the JSON-RPC request is intended, reducing the risk of misrouting.

## References
References to relevant CAIPs or EIPs to be added.
[List any relevant resources, documentation, or prior art]

### Feedback
[Provide a way for interested parties to give feedback or make suggestions, such as a GitHub issue or discussion thread]

### Committed Developers
MetaMask

## Copyright
Copyright and related rights waived via [CC0](../LICENSE).
