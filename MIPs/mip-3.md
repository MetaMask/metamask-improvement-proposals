---
MIP: 3
Title: Implement `wallet_swapAsset` to support Dapps to swap
Status: Draft
Stability: Experimental
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions
Author(s): Tomás Santos (@tommasini)
Type: Community
Created: 2023-11-10
---

## Summary

This proposal introduces a new JSON RPC method `wallet_swapAsset` that allows dApps to request MetaMask to perform a token swap operation. The method accepts parameters for the source and destination tokens and initiates a token swap operation.

## Motivation

This proposal aims to solve a key pain point for dApp developers and users - the inability to easily swap tokens within the dApp interface.

Currently, if a dApp requires users to swap from token A to token B to perform a specific operation, the user has to exit the dApp, go to MetaMask or third parties, search for the token the user needs and execute the swap, then return to the dApp. This disjointed workflow results in a poor user experience.

Implementing `wallet_swapAsset` would allow the entire token swap process to occur seamlessly within the dApp without requiring external integration. This provides the following benefits:

- Improved usability - Users can get the right tokens for dApp operations in fewer steps.
- Better dApp integration - dApps can build and control the swap experience natively with just a few lines.
- Increased adoption - More intuitive swap workflow lowers barrier to dApp usage.
- Interoperability - Standard method works across different wallets.

Comparing with other alternative, implementing it using swaps, would create more friction and less adoption since the users would need to install that specific snap to be able to perform a swap action. The all goal is to reduce friction to swaps.

Overall, this proposal fills a clear gap in dApp capabilities related to swapping tokens. Implementing it would provide significant value to both developers and users in the Ethereum ecosystem.

# Usage Example

```
ethereum.request({
  method: 'wallet_swapAsset',
  params: [{
    from: [{
      token_address: '0x1234567890abcdefABCDEF1234567890ABCDEF',
      chainId: '0x1',
      amount: '0xDE0B6B3A7640000',
    }],
    to: {
      token_address: '0xabcdef1234567890ABCDEF1234567890abcdef',
      chainId: '0x1',
    },
    user_address: '0x0000000000000000000000000000000000000000'
  },
  ]
});

```

## Proposal Specification

The new JSON RPC method wallet_swapAsset should be implemented with the following parameters:

- `from`: An object containing details about the source token. It should include:

  - `token_address`: The address of the source token.
  - `chainId`: The chain ID on hexadecimal format where the source token resides.
  - `amount`: The amount on wei and hexadecimal format of source token to be swapped.

- `to`: An object containing details about the destination token. It should include:

  - `token_address`: The address of the destination token.
  - `chainId`: The chain ID on hexadecimal format where the destination token resides.

- `user_address`: An string containing the address connected to the dapp.

- `referral_code`: (Optional) An string containing a code, to create a gamify experience (sharing revenue for example) with dapps, to lead to a bigger adoption of this json rpc method, directly or throught MetaMask SDK tool.

MetaMask will interpret the method call and perform the necessary validations and operations to initiate the token swap.

## Caveats

The implementation of `wallet_swapAsset` will be new and this could have some time for adoption.

## Implementation

The MetaMask team will be responsible for implementing the JSON RPC `wallet_swapAsset` method. This will involve updating the wallet's internal logic.

## Developer Adoption Considerations

Considering that this is a new json rpc method, developers should take the following aspects into account when adopting this proposal:

1. Backward compatibility: The introduction of the `wallet_swapAsset` method does not affect existing methods or functionality. Developers can integrate this method into their dApps without needing to modify existing code.

2. Ease of adoption: The `wallet_swapAsset` method is designed to be straightforward to use. Developers simply need to provide the necessary parameters (source token details, destination token details) in the method call. The wallet handles the rest of the process, including validation, token swap operation, and error handling.

3. User Experience: By using the `wallet_swapAsset` method, developers can improve the user experience of their dApps. Users can perform token swaps without leaving the dApp, making the process more seamless and convenient.

4. Error handling: Dapp Developers should implement appropriate error handling when using the `wallet_swapAsset` method. The method can return various errors, such as invalid parameters or unsupported operations, and these should be handled gracefully in the dApp.
   On MetaMask side we intent to validate every property of the request and return an approriate answer to the dapp.
   Currently we throw this errors:

- **Undefined Parameters**: Parameters like `from`, `to`, `user_address`, etc. are essential for the `wallet_swapAsset` method to work correctly. If not provided, the `validateParams` function would throw an error saying `"${property} property of ${name} is not defined"`. (This validation will change on the future when we allow multiple swap tokens, since the architecture of this rpc method allows it.)

  ```markdown
  validateParams(from[0], ['amount', 'chainId', 'token_address'], 'from');
  validateParams(to, ['token_address', 'chainId'], 'to');
  ```

- **Invalid User Address**: If a non-existent address is provided in `user_address`, then the method will throw an error 'This address does not exist'.

  ```markdown
  if (!dappConnectedAccount) {
  throw ethErrors.rpc.invalidParams('This address does not exist');
  }
  ```

- **Unsupported Multiple Tokens Swap**: As of now, it supports only a single token swap. In case of multiple tokens provided in the `from` object, an 'Currently we de not support multiple tokens swap' error is thrown.

  ```markdown
  if (from.length > 1) {
  throw ethErrors.rpc.invalidParams(
  'Currently we de not support multiple tokens swap',
  );
  }
  ```

- **Inconsistent `chainId`**: If the `chainId` of the source and destination tokens are not the same, 'ChainId value is not consistent between from and to' error would be thrown. However, this restriction will be lifted with the support of cross-chain swaps. (We have this validation because we do not yet allow cross chain swaps. But this can change on the future since the architecture fo this rpc method have that into account.)

  ```markdown
  if (from[0].chainId !== to.chainId) {
  throw ethErrors.rpc.invalidParams(
  'ChainId value is not consistent between from and to',
  );
  }
  ```

- **Inactive or Unsupported Swaps**: If the swap is inactive or not possible on the current chain, an alert with the message 'Swap is not active or not possible on this chain' will be triggered.

  ```markdown
  const isSwappable = isSwapsAllowed(chainId) && swapsIsLive;
  if (!isSwappable) {
  Alert.alert('Swap is not active or not possible on this chain');
  return;
  }
  ```

5. Security: Dapp Developers should ensure that the token addresses and chain IDs provided in the method call are valid and secure. They should also inform users about the potential risks and considerations when performing token swaps.
   On MetaMask Mobile we only display a token that were already on our trusted token list, so we will not expose the user to new security risks. Nevertheless we have warnings in place that say to the user to be carefull when a token is not that trustworthy. We check if the number of occurrences is more than one, If not we show an alert the we obligate the user to ready and press a button to be able to swap.

6. Testing: Before deploying the `wallet_swapAsset` method in a live environment, metamask engineers should thoroughly test it to ensure it works correctly and handles errors appropriately. This includes testing with different token types, amounts, and network conditions.

7. Interoperability: The `wallet_swapAsset` method provides a standardized way for dApps to request token swaps from wallets. This can improve interoperability between different dApps and wallets, as they can all use the same method for token swaps.

## User Experience Considerations

Users will now be able to swap tokens without leaving dapps.
The `wallet_swapAsset` method might be new to some users, providing educational resources can help them understand how it works and how to use it.
If the `wallet_swapAsset` method encounters an error, the wallet/dapp should provide a clear and understandable error message to the user. This helps users understand what went wrong and how to fix it.
On metamask mobile if the chain id is different of the `from` property or the `to` property comparing to the network selected on the wallet, we will show a bottom sheet asking the user to switch to the intended network for the swaps operation.

```markdown
if (
chainId !== parseInt(from[0].chainId, 16).toString() ||
chainId !== parseInt(to.chainId, 16).toString()
) {
await RPCMethods.wallet_switchEthereumChain({
req: {
params: [{ chainId: from[0].chainId }],
},
res,
requestUserApproval,
analytics: {
request_source: getSource(),
request_platform: analytics?.platform,
},
});
}
```

On MetaMask Mobile, if the user have on the wallet an selected account but on the dapp in app browser another, when using swaps feature, MetaMask Mobile will check if the accounts are different and switch to the account selected on the dapp if they are.

## Security Considerations

While the proposed implementation of `wallet_swapAsset` do not introduce new security risks in terms of contract interactions, they do present a potential risk related to phishing.

Malicious actors may prompt users to swap fake tokens that they created and fake on the dapp that the users are doing swap to an official token.

To mitigate this risk, MetaMask have implemented the following countermeasure:

**Token Verification:** Implement a token verification process in the wallet. Before performing the swap, the wallet could verify the authenticity of the tokens involved in the swap by checking them against a list of known and trusted tokens.

The token list still will have the possibility of have a malicious token and for that we have implemented the following countermeasure:

**User Education:** Inform users about the potential risks associated with token swaps and provide guidelines for safely performing these operations. Users should be advised to verify the authenticity of the tokens they are swapping and the dApps they are using.

Developers and users should also be aware of the standard security considerations when dealing with tokens, such as verifying contract addresses and ensuring the trustworthiness of token issuers.

## References

[EIP: wallet_swapAsset JSON RPC method](https://github.com/tommasini/EIPs/blob/64090fe54761906fc9bde31ad46eb85230de5e8d/EIPS/eip-swap-rpc.md)

## Feedback

Please provide feedback on this proposal by opening an issue in the MetaMask MIPs repository.

## Committed Developers

Tomás Santos (@tommasini)

## Copyright

Copyright and related rights waived via [CC0](../LICENSE).
