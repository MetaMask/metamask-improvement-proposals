---
MIP: 1
Title: Implement `wallet_swap` to support Dapps to swap
Status: Draft
Stability: Experimental
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions
Author(s): Tomás Santos (@tommasini)
Type: Maintainer
Created: 2023-11-10
---

## Summary

This proposal introduces a new JSON RPC method `wallet_swap`` that allows dApps to request MetaMask to perform a token swap operation. The method accepts parameters for the source and destination tokens and initiates a token swap operation.

## Motivation

The motivation behind this MIP is to provide a standardized way for dApps to request token swaps from MetaMask, improving interoperability and user experience.

# Usage Example

```
ethereum.request({
  method: 'wallet_swap',
  params: {
    from: {
      token_address: '0x1234567890abcdefABCDEF1234567890ABCDEF',
      chainId: '0x1',
      amount: '0xDE0B6B3A7640000',
    },
    to: {
      token_address: '0xabcdef1234567890ABCDEF1234567890abcdef',
      chainId: '0x1',
    },
  },
});

```

## Proposal Specification

The new JSON RPC method wallet_swap should be implemented with the following parameters:

- `from`: An object containing details about the source token. It should include:

  - `token_address`: The address of the source token.
  - `chainId`: The chain ID on hexadecimal format where the source token resides.
  - `amount`: The amount on wei and hexadecimal format of source token to be swapped.

- `to`: An object containing details about the destination token. It should include:

  - `token_address`: The address of the destination token.
  - `chainId`: The chain ID on hexadecimal format where the destination token resides.

MetaMask will interpret the method call and perform the necessary validations and operations to initiate the token swap.

## Caveats

The implementation of `wallet_swap` will be new and this could have some time for adoption.

## Implementation

The MetaMask team will be responsible for implementing the JSON RPC `wallet_swap` method. This will involve updating the wallet's internal logic.

## Developer Adoption Considerations

Considering that this is a new json rpc method, developers should take the following aspects into account when adopting this proposal:

1. Backward compatibility: The introduction of the `wallet_swap` method does not affect existing methods or functionality. Developers can integrate this method into their dApps without needing to modify existing code.

2. Ease of adoption: The `wallet_swap` method is designed to be straightforward to use. Developers simply need to provide the necessary parameters (source token details, destination token details) in the method call. The wallet handles the rest of the process, including validation, token swap operation, and error handling.

3. User Experience: By using the `wallet_swap` method, developers can improve the user experience of their dApps. Users can perform token swaps without leaving the dApp, making the process more seamless and convenient.

4. Developers should implement appropriate error handling when using the `wallet_swap` method. The method can return various errors, such as invalid parameters or unsupported operations, and these should be handled gracefully in the dApp.

5. Security: Developers should ensure that the token addresses and chain IDs provided in the method call are valid and secure. They should also inform users about the potential risks and considerations when performing token swaps.

6. Testing: Before deploying the `wallet_swap` method in a live environment, developers should thoroughly test it to ensure it works correctly and handles errors appropriately. This includes testing with different token types, amounts, and network conditions.

7. Interoperability: The `wallet_swap` method provides a standardized way for dApps to request token swaps from wallets. This can improve interoperability between different dApps and wallets, as they can all use the same method for token swaps.

## User Experience Considerations

Users will now be able to swap tokens without leaving dapps.
The `wallet_swap` method might be new to some users, providing educational resources can help them understand how it works and how to use it.
If the `wallet_swap` method encounters an error, the wallet/dapp should provide a clear and understandable error message to the user. This helps users understand what went wrong and how to fix it.

## Security Considerations

While the proposed implementation of `wallet_swap` do not introduce new security risks in terms of contract interactions, they do present a potential risk related to phishing.

Malicious actors may prompt users to swap fake tokens that they created and fake on the dapp that the users are doing swap to an official token.

To mitigate this risk, MetaMask could implement the following countermeasures:

**Token Verification:** Implement a token verification process in the wallet. Before performing the swap, the wallet could verify the authenticity of the tokens involved in the swap by checking them against a list of known and trusted tokens.

**User Education:** Inform users about the potential risks associated with token swaps and provide guidelines for safely performing these operations. Users should be advised to verify the authenticity of the tokens they are swapping and the dApps they are using.

Developers and users should also be aware of the standard security considerations when dealing with tokens, such as verifying contract addresses and ensuring the trustworthiness of token issuers.

## References

[EIP: wallet_swap JSON RPC method](https://github.com/tommasini/EIPs/blob/64090fe54761906fc9bde31ad46eb85230de5e8d/EIPS/eip-swap-rpc.md)

## Feedback

Please provide feedback on this proposal by opening an issue in the MetaMask MIPs repository.

## Committed Developers

Tomás Santos (@tommasini)

## Copyright

Copyright and related rights waived via [CC0](../LICENSE).
