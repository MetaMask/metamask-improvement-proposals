---
mip: 2
title: Implement `wallet_revokePermissions` for Flexible Permission Revocation
status: Implemented
stability: Experimental
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions/28
author(s): Julia Collins (@julesat22), Shane Jonas (@shanejonas)
type: Community
created: 2023-10-06
---

## Summary
This proposal aims to add a new JSON-RPC method, `wallet_revokePermissions`, to MetaMask as a counterpart to `wallet_requestPermissions`. This method is designed to offer a high degree of flexibility in managing permissions. This streamlines the user experience by reducing the number of steps needed to manage permissions and disconnect from dApps, thereby aligning with traditional OAuth systems for enhanced user control and privacy.

## Motivation
The MetaMask Wallet API currently lacks a streamlined way for users and dApps to revoke permissions. This proposal aims to:

1. Streamline User Experience: Currently, disconnecting a dApp requires navigating through multiple UI layers. Implementing `wallet_revokePermissions` will simplify this process and align with user expectations. Also enabling users to have granular control over their permissions directly from within the dApp not only enhances UX but also aligns with best practices in data privacy and user agency.

2. Close an Ergonomic Gap: Being able to request permissions but not revoke them programmatically is inconsistent and poses challenges for developers. This proposal offers a holistic solution for permission management.

3. Developer Experience: dApp developers currently might resort to mocking disconnect functionality, which is not a genuine revocation of permissions. `wallet_revokePermissions` allows for an authentic disconnect, enhancing security and user trust.

By implementing wallet_revokePermissions, we achieve feature parity with traditional permission systems, offering a more robust, secure, and user-friendly environment.


# Proposal
The `wallet_revokePermissions` method is proposed as a new JSON-RPC feature for MetaMask, aimed at giving users more granular control over permission management. With this method, users can can revoke permissions for the specified permission(s).

The method signature will be as follows:

```js
await window.ethereum.request({
  "method": "wallet_revokePermissions",
  "params": [
    {
      "<permission>": {}
    }
  ]
});
```

# Usage Example
```js
// revoke eth_account permission for the dApp
await window.ethereum.request({
  "method": "wallet_revokePermissions",
  "params": [
    {
      "eth_accounts": {}
    }
  ]
});

// revoke snap_dialog permission for the dApp
await window.ethereum.request({
  "method": "wallet_revokePermissions",
  "params": [
    {
      "snap_dialog": {}
    }
  ]
});
```

The proposed changes have been implemented in the following PR against the `MetaMask/api-specs` repo: https://github.com/MetaMask/api-specs/pull/145

## Caveats
Adding Caveats to the implementation of `wallet_revokePermissions` means more granular control over user permissions and, subsequently, more combinations of permissions that can be revoked. This increases the scope of implementation so it will not be supported in the initial implementation.

## Implementation
There is a [PR](https://github.com/MetaMask/core/pull/1889) open against the `MetaMask/core` repo that implements the proposed changes.

## User Experience Considerations

#### Enhancements:

Streamlining Disconnection: Reducing the number of clicks and steps needed to disconnect from a dApp, making the experience more user-friendly.

Consistency in Connection Management: Providing a disconnect feature directly within the dApp aligns with user expectations and creates a consistent experience since the dApp can both request and revoke permissions.

Improved User-Dapp Communication: Clear, in-app options for managing permissions improve user confidence and control.

User Empowerment: The proposed method aligns with best practices in data privacy, giving users the agency to manage their data and connections effectively.

Synchronized Actions and Security: Ensuring that the dApp is aware of a user's intent to disconnect prevents potential security loopholes and reflects the user’s action accurately in the dApp’s state.

## Security Considerations
The introduction of the `wallet_revokePermissions` method bolsters security by providing users with more control over permission revocation, reducing the potential attack surface. By allowing users to revoke permissions either partially or entirely, it minimizes the risk of unauthorized or malicious activity.

However, the security model depends on users actively managing these permissions, and there's a minor risk that poorly implemented dApps could confuse users about what they're revoking, potentially leading to unwanted outcomes. Ex. If an attacker had XSS access to a site, it could revoke permissions without the users consent.

To mitigate this risk, MetaMask could implement the following countermeasures:

**User Education**: MetaMask could inform users about the importance of managing permissions and the risks associated with not revoking outdated or unused permissions. Offer guidelines for making informed decisions about when and how to revoke permissions for different dApps.

**Warning and Consent**: Before executing a revoke operation, MetaMask could display an inormative alert message to users. This message could inform them of the consequences of revoking permissions and/or the specific permission(s) they are attempting to revoke.

## Definitions
**Revoke**: To officially cancel or withdraw specific privileges, rights, or permissions. In the context of `wallet_revokePermissions`, revoking would entail nullifying the access granted to certain dApps or operations, such as account information retrieval via `eth_accounts`.

## References
[wallet_revokePermissions](https://github.com/MetaMask/api-specs/pull/145)

## Feedback
Please provide feedback on this proposal by opening an issue in the MetaMask MIPs repository.

## Committed Developers
Julia Collins (@julesat22), Shane Jonas (@shanejonas)

## Copyright
Copyright and related rights waived via [CC0](../LICENSE).
