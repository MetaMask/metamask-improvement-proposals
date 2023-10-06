---
MIP: 1
Title: Implement `wallet_revokePermissions` for Flexible Permission Revocation
Status: Review
Stability: n/a
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions
Author(s): Julia Collins (@julesat22)
Type: Community
Created: 2023-10-06
---

## Summary
This proposal aims to add a new JSON-RPC method, `wallet_revokePermissions`, to MetaMask. This method is designed to offer a high degree of flexibility in managing permissions. Specifically, it allows for the revocation of an entire permission object, thereby removing all accounts linked to a given invoker. Alternatively, it can selectively revoke permissions for a specific account or a set of accounts connected to that invoker. In doing so, this method bolsters user control and privacy by providing a more granular way to manage permissions for connected dApps and accounts.

## Motivation
Revoking permissions is a crucial part of any permission-based system. This feature would bring MetaMask's permission model closer to feature-parity with traditional OAuth-based systems, allowing users and dApps to manage permissions more effectively. Allowing users to revoke permissions (e.g. disconnecting accounts) would cater to the needs of both users and dApp developers, ensuring a more robust and secure environment.

# Usage Example
```
// Request to revoke permissions for a single address (disconnect a user's account)
await window.ethereum.request({
  "method": "wallet_revokePermissions",
  "params": {
    "permission": {
      "caveatValue": [
        "0x36Cad5E14C0a845500E0aDA68C642d254BE8d538"
      ],
      "target": "eth_accounts",
      "caveatType": "restrictReturnedAccounts"
    }
  }
});

// Request to revoke all permissions
await window.ethereum.request({
  "method": "wallet_revokePermissions",
  "params": {}
});

```

In these examples, all parameters are optional, enabling the invoker to revoke all permissions by default. However, the proposal also supports revoking specific permissions. For instance, by specifying the id which is the identifier returned upon a successful `wallet_requestPermission` call, you can target individual permissions for revocation.

# Proposal

## Definitions
**Revoke**: To officially cancel or withdraw specific privileges, rights, or permissions. In the context of `wallet_revokePermissions`, revoking would entail nullifying the access granted to certain dApps or operations, such as account information retrieval via `eth_accounts`.

**Invoker**: This refers to the entity that initiates or "calls" a specific method or function. In the case of `wallet_revokePermissions`, the invoker might be the user or the user's wallet software that initiates the revocation of permissions for specific dApps.


## Proposal Specification
The `wallet_revokePermissions` method is proposed as a new JSON-RPC feature for MetaMask, aimed at giving users more granular control over permission management. With this method, users can either revoke all permissions associated with connected origins (dApps) or opt for a more targeted approach by specifying the target permission. For example, MetaMask can revoke permissions for a specific account address or for many addresses. Additionally, if all parameters are omitted, it triggers a full revocation of all permissions.

The updated method signature will be as follows:

```
await window.ethereum.request({
  "method": "wallet_revokePermissions",
  "params": {
    "permission": {
      "caveatValue": string[], // value of the caveat to be revoked from the target permission
      "target": "eth_accounts" | "wallet_snap" | "snap_dialog" | "snap_notify" | "snap_manageState"
      "caveatType": string // type of the caveat to update,
      "id": string // id of permission to be revoked
    }
  }
});
```

The proposed changes have been implemented in the following PR against the `MetaMask/api-specs` repo: https://github.com/MetaMask/api-specs/pull/145

## Caveats
The implementation of `wallet_revokePermissions` means more granular control over user permissions and, subsequently, more combinations of permissions that can be revoked. This increases the scope of testing to ensure that there are no edge cases that haven't been considered, or bugs.

## Implementation
The MetaMask team will be responsible for implementing the proposed changes to the `wallet_revokePermissions` method.

## Developer Adoption Considerations
1. Backward Compatibility: Dapps that currently manage permissions using custom logic will need to update their code to integrate this new method, however the method is backwards compatible.

2. Ease of Adoption: This method has been designed with flexibility in mind, offering both broad and specific options for permission revocation. This dual capability greatly simplifies the adoption process for both users and dApp developers.

## User Experience Considerations
The proposed `wallet_revokePermissions` method enhances user experience by easily revoking specific or general permissions from dApps, aligning with traditional security models for increased accessibility.

## Security Considerations
The introduction of the `wallet_revokePermissions` method bolsters security by providing users with more control over permission revocation, reducing the potential attack surface. By allowing users to revoke permissions either partially or entirely, it minimizes the risk of unauthorized or malicious activity.

However, the security model depends on users actively managing these permissions, and there's a minor risk that poorly implemented dApps could confuse users about what they're revoking, potentially leading to unwanted outcomes.

To mitigate this risk, MetaMask could implement the following countermeasures:

**User Education**: MetaMask could inform users about the importance of managing permissions and the risks associated with not revoking outdated or unused permissions. Offer guidelines for making informed decisions about when and how to revoke permissions for different dApps.

**Warning and Consent**: Before executing a revoke operation, MetaMask could display an inormative alert message to users. This message could inform them of the consequences of revoking permissions and/or the specific permission(s) they are attempting to revoke.

## References
[wallet_revokePermissions](https://github.com/MetaMask/api-specs/pull/145)

## Feedback
Please provide feedback on this proposal by opening an issue in the MetaMask MIPs repository.

## Committed Developers
Julia Collins (@julesat22)

## Copyright
Copyright and related rights waived via [CC0](../LICENSE).