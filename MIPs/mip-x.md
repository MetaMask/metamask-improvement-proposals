---
MIP: x
Title: Implement `wallet_revokePermissions` for Flexible Permission Revocation
Status: Review
Stability: n/a
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions
Author(s): Julia Collins (@julesat22), Shane Jonas (@shanejonas)
Type: Community
Created: 2023-10-06
---

## Summary
This proposal aims to add a new JSON-RPC method, `wallet_revokePermissions`, to MetaMask. This method is designed to offer a high degree of flexibility in managing permissions. Users can either revoke all permissions for a connected dApp or selectively revoke permissions for specific accounts linked to a given dapp. This streamlines the user experience by reducing the number of steps needed to manage permissions and disconnect from dApps, thereby aligning with traditional OAuth systems for enhanced user control and privacy.

## Motivation
The existing permission system lacks a streamlined way for users and dApps to manage and revoke permissions. This proposal aims to:

1. Streamline User Experience: Currently, disconnecting a dApp requires navigating through multiple UI layers. Implementing `wallet_revokePermissions` will simplify this process and align with user expectations.

2. Close an Ergonomic Gap: Being able to request permissions but not revoke them programmatically is inconsistent and poses challenges for developers. This proposal offers a holistic solution for permission management.

3. Developer Experience: dApp developers currently might resort to mocking disconnect functionality, which is not a genuine revocation of permissions. `wallet_revokePermissions` allows for an authentic disconnect, enhancing security and user trust.

4. User Experience: Enabling users to have granular control over their permissions directly from within the dApp not only enhances UX but also aligns with best practices in data privacy and user agency.

By implementing wallet_revokePermissions, we achieve feature parity with traditional permission systems, offering a more robust, secure, and user-friendly environment.

# Usage Example
```js
// Request to revoke permissions for a single address (disconnect a user's account)
await window.ethereum.request({
  "method": "wallet_revokePermissions",
  "params": [
    {
      "eth_accounts": {
        "caveats": [
          {
            "type": "restrictReturnedAccounts",
            "value": [
              "0x36Cad5E14C0a845500E0aDA68C642d254BE8d538"
            ]
          }
          "0x36Cad5E14C0a845500E0aDA68C642d254BE8d538"
        ],
      }
    }
  ]
});

// Request to revoke all permissions for the current dapps domain
await window.ethereum.request({
  "method": "wallet_revokePermissions",
  "params": []
});

await window.ethereum.request({
  "method": "wallet_revokePermissions",
  "params": [
    {
      "eth_accounts": {
      }
    }
  ]
});
```

In these examples, all parameters are optional, enabling the dApp to revoke all permissions by default. However, the proposal also supports revoking specific permissions. For instance, by specifying the id which is the identifier returned upon a successful `wallet_requestPermission` call, you can target individual permissions for revocation.

# Proposal

## Definitions
**Revoke**: To officially cancel or withdraw specific privileges, rights, or permissions. In the context of `wallet_revokePermissions`, revoking would entail nullifying the access granted to certain dApps or operations, such as account information retrieval via `eth_accounts`.

## Proposal Specification
The `wallet_revokePermissions` method is proposed as a new JSON-RPC feature for MetaMask, aimed at giving users more granular control over permission management. With this method, users can either revoke all permissions associated with connected origins (dApps) or opt for a more targeted approach by specifying the target permission. For example, MetaMask can revoke permissions for a specific account address or for many addresses. Additionally, if all parameters are omitted, it triggers a full revocation of all permissions.

The updated method signature will be as follows:

```js
await window.ethereum.request({
  "method": "wallet_revokePermissions",
  "params": [
    {
      "eth_accounts": {
        "caveats": [
          {
            "type": "foo",
            "value": "bar"
          }
        ]
      }
    }
  ]
});
```

The proposed changes have been implemented in the following PR against the `MetaMask/api-specs` repo: https://github.com/MetaMask/api-specs/pull/145

## Caveats
The implementation of `wallet_revokePermissions` means more granular control over user permissions and, subsequently, more combinations of permissions that can be revoked. This increases the scope of testing to ensure that there are no edge cases that haven't been considered, or bugs.

## Implementation
The MetaMask team will be responsible for implementing the proposed changes to the `wallet_revokePermissions` method.

## Developer Adoption Considerations
1. Backward Compatibility: Dapps that currently manage permissions using custom logic will need to update their code to integrate this new method to keep their state in sync with metamask, however the method is backwards compatible.

2. Ease of Adoption: This method has been designed with flexibility in mind, offering both broad (revoke all permissions for a given domain at once) and specific options for permission revocation. This dual capability greatly simplifies the adoption process for both users and dApp developers.

## User Experience Considerations

#### Enhancements:

Streamlining Disconnection: Reducing the number of clicks and steps needed to disconnect from a dApp, making the experience more user-friendly.

Consistency in Connection Management: Providing a disconnect feature directly within the dApp aligns with user expectations and creates a consistent experience since the dapp can both request and revoke permissions.

Improved User-Dapp Communication: Clear, in-app options for managing permissions improve user confidence and control.

User Empowerment: The proposed method aligns with best practices in data privacy, giving users the agency to manage their data and connections effectively.

Synchronized Actions and Security: Ensuring that the dApp is aware of a user's intent to disconnect prevents potential security loopholes and reflects the user’s action accurately in the dApp’s state.

## Security Considerations
The introduction of the `wallet_revokePermissions` method bolsters security by providing users with more control over permission revocation, reducing the potential attack surface. By allowing users to revoke permissions either partially or entirely, it minimizes the risk of unauthorized or malicious activity.

However, the security model depends on users actively managing these permissions, and there's a minor risk that poorly implemented dApps could confuse users about what they're revoking, potentially leading to unwanted outcomes. Ex. If an attacker had XSS access to a site, it could revoke permissions without the users consent.

To mitigate this risk, MetaMask could implement the following countermeasures:

**User Education**: MetaMask could inform users about the importance of managing permissions and the risks associated with not revoking outdated or unused permissions. Offer guidelines for making informed decisions about when and how to revoke permissions for different dApps.

**Warning and Consent**: Before executing a revoke operation, MetaMask could display an inormative alert message to users. This message could inform them of the consequences of revoking permissions and/or the specific permission(s) they are attempting to revoke.

## References
[wallet_revokePermissions](https://github.com/MetaMask/api-specs/pull/145)

## Feedback
Please provide feedback on this proposal by opening an issue in the MetaMask MIPs repository.

## Committed Developers
Julia Collins (@julesat22), Shane Jonas (@shanejonas)

## Copyright
Copyright and related rights waived via [CC0](../LICENSE).