---
mip: 4
title: Implement `wallet_openDeepLink` for deep linking within MetaMask
status: Draft
stability: Experimental
discussions-to: 
author(s): Hassan Malik (@hmalik88)
type: Community
created: 2024-09-18
---

## Summary
This proposal aims to add a new JSON-RPC method, `wallet_openDeepLink`, to MetaMask. This method is designed to offer programmatic navigation within MetaMask to the API consumer, in particular, to dapps and snaps.

## Motivation
Currently, there isn't a way for developers to navigate to specific portions of MetaMask. With the introduction of (MetaMask schemed URLs)[https://github.com/MetaMask/SIPs/pull/134] and the ability to navigate to them through snaps link components, we wanted to utilize the full power of the new scheme through allowing a RPC method that would allow consumers to navigate to selected portions of MetaMask.

# Proposal
The `wallet_openDeepLink` method is proposed as a new JSON-RPC feature for MetaMask, aimed at giving users navigation ability to exposed routes within the client or a snap. For a list of the routes currently exposed, please see (SIP-22)[https://github.com/MetaMask/SIPs/pull/134]. In the future, MetaMask URLs will also accept fragments to navigate to a specific portion of a page. This API can also be extended to accept params that can pre-populate fields on a certain page. The authority would be responsible for choosing to accept certain params. In the case of the client authority, MetaMask is responsible for keeping a record of the params for each exposed route. In the case of the snap authority, the snap itself is responsible for params handling and communication of route parameters.

# Usage Example
```js
await window.ethereum.request({
  "method": "wallet_openDeepLink",
  "params": {
    "link": "metamask://client/"
  }
});
```

```js
await window.ethereum.request({
  "method": "wallet_openDeepLink",
  "params": {
    "link": "metamask://snap/@metamask/examplesnap/home"
  }
});
```

## Implementation
The Snaps team will be responsible for implementing the `wallet_openDeepLink` method and for future improvements to it.

## Feedback
Please provide feedback on this proposal by opening an issue in the MetaMask MIPs repository.

## Committed Developers
Hassan Malik (@hmalik88)

## Copyright
Copyright and related rights waived via [CC0](../LICENSE).
