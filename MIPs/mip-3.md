---
MIP: x
Title: Implement `wallet_swapAsset` to support Dapps to swap
Status: Draft
Stability: Experimental
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions/46
Author(s): Tomás Santos (@tommasini)
Type: Community
Created: 2023-11-10
---

## Summary

This proposal introduces a new JSON-RPC method `wallet_swapAsset` that allows dApps to request MetaMask to perform a token swap operation. The method accepts parameters for the source and destination tokens and initiates a token swap operation.

## Motivation

This proposal aims to solve a key pain point for dApp developers and users - the inability to initiate swap tokens from the dApp interface.

Currently, if a dApp requires users to swap from token A to token B to perform a specific operation, the user has to exit the dApp, go to MetaMask or third parties, search for the token the user needs and execute the swap, then return to the dApp. This disjointed workflow results in a poor user experience.

Implementing `wallet_swapAsset` would allow the entire token swap process to occur seamlessly by navigating from the dApp to MetaMask wallet with the tokens information without requiring external integration. This provides the following benefits:

- Improved usability - Users can get the right tokens for dApp operations in fewer steps and with less context switching.
- Better dApp integration - dApps can build and control the swap experience natively with just a few lines.
- Increased adoption - More intuitive swap workflow lowers barrier to dApp usage.
- Interoperability - Standard method works across different wallets.
- Increase revenue - Easier adoption means more users will use MetaMask swaps.

Introducing this API directly in the wallet is preferable when compared with the alternative of using snaps, as the latter would create more friction and less adoption since users would need to install that specific snap to be able to perform a swap action. The goal is to reduce friction to swaps.

Overall, this proposal fills a clear gap in dApp capabilities related to swapping tokens. Implementing it would provide significant value to both developers and users in the Ethereum ecosystem.

# Usage Example

```
ethereum.request({
  method: 'wallet_swapAsset',
  params: [{
    from: [{
      tokenAddress: '0x1234567890abcdefABCDEF1234567890ABCDEF',
      value: '0xDE0B6B3A7640000',
    }],
    to: {
      tokenAddress: '0xabcdef1234567890ABCDEF1234567890abcdef',
    },
    userAddress: '0x0000000000000000000000000000000000000000'
  },
  ]
});

```

## Proposal Specification

The new JSON-RPC method wallet_swapAsset should be implemented with the following parameters:

- `from`: An object containing details about the source token. It should include:

  - `tokenAddress`: The address of the source token.
  - `value`: The amount of wei in hexadecimal format of the source token to be swapped.

- `to`: An object containing details about the destination token. It should include:

  - `tokenAddress`: The address of the destination token.

- `userAddress`: Account address connected to the dapp.

- `sendTo`: (Optional) Allows integration with Swap's `send to` feature.

MetaMask will interpret the method call and perform the necessary validations and operations to initiate the token swap.

## Implementation

The MetaMask team will be responsible for implementing the JSON-RPC `wallet_swapAsset` method. This will involve updating the wallet's internal logic.

- PR for MetaMask mobile: https://github.com/MetaMask/metamask-mobile/pull/7509

## Developer Adoption Considerations

Considering that this is a new json-rpc method, developers should take the following aspects into account when adopting this proposal:

1. Backward compatibility: The introduction of the `wallet_swapAsset` method does not affect existing methods or functionality. Developers can integrate this method into their dApps without needing to modify existing code.

2. Ease of adoption: The `wallet_swapAsset` method is designed to be straightforward to use. Developers simply need to provide the necessary parameters (source token details, destination token details) in the method call. The wallet handles the rest of the process, including validation, token swap operation, and error handling.

3. User Experience: By using the `wallet_swapAsset` method, developers can improve the user experience of their dApps. Users can perform token swaps without leaving the dApp, making the process more seamless and convenient.

4. Error handling: Dapp Developers should implement appropriate error handling when using the `wallet_swapAsset` method. The method can return various errors, such as invalid parameters or unsupported operations, and these should be handled gracefully in the dApp.
   On MetaMask side we intent to validate every property of the request and return an approriate answer to the dapp.
   Currently we throw these errors:

5. Ensuring Correct Chain Context for `wallet_swapAsset`: Before initiating a swap, it's crucial to ensure that the user's wallet is connected to the expected blockchain network. Developers should use the [eth_chainId](https://docs.metamask.io/wallet/reference/eth_chainid/) method to verify the current chain, [wallet_switchEthereumChain](https://docs.metamask.io/wallet/reference/wallet_switchethereumchain/) to switch to the desired chain if necessary, and [wallet_addEthereumChain](https://docs.metamask.io/wallet/reference/wallet_addethereumchain/) to add a new chain if it's not known to the wallet. This ensures that token swaps are performed on the intended network, enhancing security and user experience.

- **Required Parameters**: Parameters like `from`, `to`, `userAddress`, etc. are essential for the `wallet_swapAsset` method to work correctly. If not provided, the `validateParams` function would throw an error saying `"${property} property of ${name} is not defined"`. (This validation will change on the future when we allow multiple swap tokens, since the architecture of this rpc method allows it). See more details about error codes in the api-spec: https://github.com/MetaMask/api-specs/pull/201

  ```markdown
  validateParams(from[0], [tokenAddress], 'from');
  validateParams(to, [tokenAddress], 'to');
  ```

- **Invalid User Address**: If a non-existent address is provided in `userAddress`, then the method will throw an error 'This address does not exist'. See more details about error codes in the api-spec: https://github.com/MetaMask/api-specs/pull/201

  ```markdown
  if (!dappConnectedAccount) {
  throw rpcErrors.invalidParams('This address does not exist');
  }
  ```

- **Unsupported Multiple Tokens Swap**: As of now, it supports only a single token swap. In case of multiple tokens provided in the `from` object, an 'Currently we do not support multiple tokens swap' error is thrown. See more details about error codes in the api-spec: https://github.com/MetaMask/api-specs/pull/201

  ```markdown
  if (from.length > 1) {
  throw rpcErrors.invalidParams(
  'Currently we do not support multiple tokens swap',
  );
  }
  ```

- **Inactive or Unsupported Swaps**: If the swap is inactive or is not possible on the current chain, an alert with the message 'Swap is not active or is not possible on this chain' will be triggered. See more details about error codes in the api-spec: https://github.com/MetaMask/api-specs/pull/201

  ```markdown
  const isSwappable = isSwapsAllowed(chainId) && swapsIsLive;
  if (!isSwappable) {
  Alert.alert(`Swap is not available on this chain ${networkName}`);
  throw rpcErrors.methodNotSupported(
  `Swap is not available on this chain ${networkName}`,
  );
  }
  ```

5. Security: In MetaMask we have warnings in place to alert the user when a token is not trustworthy and add an additional confirmation step. Despite this, dApp developers should still ensure that the token addresses provided in the method call are secure and valid for the current chain ID. They should also inform users about the potential risks and considerations when performing token swaps.

6. Testing: Before deploying the `wallet_swapAsset` method in a live environment, MetaMask engineers should thoroughly test it to ensure it works correctly and handles errors appropriately. This includes testing with different token types, amounts, and network conditions.

7. Interoperability: The `wallet_swapAsset` method provides a standardized way for dApps to request token swaps from wallets. This can improve interoperability between different dApps and wallets, as they can all use the same method for token swaps.

## User Experience Considerations

Users will now be able to swap tokens without leaving dapps.
Since `wallet_swapAsset` method will be new to some users, providing educational resources may help in understand how the method works as well as how to use it.
If the `wallet_swapAsset` method encounters an error, the wallet/dapp should provide a clear and understandable error message to the user. This helps users understand what went wrong and how to fix it.

While using MetaMask Mobile with this method, the mobile app will first check if selected account is different between the wallet and the dApp. If it is different, the mobile app will switch to the matching account before continuing with the swap.

```markdown
if (
safeToChecksumAddress(selectedAddress) !==
checksummedDappConnectedAccount
) {
Engine.context.PreferencesController.setSelectedAddress(
checksummedDappConnectedAccount,
);
}
```

## Security Considerations

While the proposed implementation of `wallet_swapAsset` does not introduce new security risks in terms of contract interactions, they do present a potential risk related to phishing.

Malicious actors may prompt users to swap fake tokens and convince users that they are performing a swap with an official token.

To mitigate this risk, MetaMask has implemented the following countermeasure:

**User Education:** Inform users about the potential risks associated with token swaps and provide guidelines for safely performing these operations. Users should be advised to verify the authenticity of the tokens they are swapping and the dApps they are using.

Developers and users should also be aware of the standard security considerations when dealing with tokens, such as verifying contract addresses and ensuring the trustworthiness of token issuers.

## References

[EIP: wallet_swapAsset JSON-RPC method](https://github.com/tommasini/EIPs/blob/64090fe54761906fc9bde31ad46eb85230de5e8d/EIPS/eip-swap-rpc.md)

## Feedback

Please provide feedback on this proposal by opening an issue in the MetaMask MIPs repository.

## Committed Developers

Tomás Santos (@tommasini)

## Copyright

Copyright and related rights waived via [CC0](../LICENSE).
