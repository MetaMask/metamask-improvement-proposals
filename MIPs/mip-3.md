---
mip: 3
title: Discontinuing the eth_sign signature method
status: Accepted
stability: Deprecated
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions/41
author(s): Vandan Parikh(@vandan), Shane Jonas (@shanejonas), Alex Donesky (@adonesky1)
type: Maintainer
created: 2024-05-15
---

## Summary
This proposal seeks to fully discontinue the `eth_sign` signature method in MetaMask due to its inherent security risks. The `eth_sign` method allows blind signing of arbitrary data without the `\x19Ethereum Signed Message` prefix, posing a significant phishing risk. As of last year, `eth_sign` was disabled by default, but could be re-enabled in MetaMask's settings. This proposal aims to discontinue support entirely.

## Motivation
The primary motivation for discontinuing this method is to enhance user security. The `eth_sign` method's capability to sign arbitrary data makes it vulnerable to phishing attacks, where malicious actors can deceive users into blindly signing harmful transactions or data since the hex data being signed can't be decoded and made readable to the signer. Even with `eth_sign` being disabled by default, there is still a risk that users are enticed to re-enable it when they should not. By removing support for this method entirely, we aim to reduce the attack surface and protect MetaMask users from potential threats.

### Security Concerns
- **Phishing Risk**: The `eth_sign` method can be used to sign arbitrary hashes, making it possible for attackers to trick users into signing malicious transactions or messages.
- **User Protection**: Discontinuing support for `eth_sign` will prevent inadvertent misuse and enhance overall user safety.
- **Future Risks**: The `eth_sign` method can be used to sign arbitrary hashes, making it possible for attackers to trick users into signing current/future transaction types or other additions to ethereum

# Proposal

## Language
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" written in uppercase in this document are to be interpreted as described in RFC 2119.

## Errors
Requests for the `eth_sign` method will return a standard "Method not found" error with code = `-32601`. See [JSON-RPC 2.0 Error Spec](https://www.jsonrpc.org/specification#error_object).

## Implementation
API Maintainers will remove support for `eth_sign` including all related MetaMask settings to enable it.

## Backward Compatibility
`eth_sign` discontinuation is a breaking API change.
- **Previous Default Settings**: However, `eth_sign` has been disabled by default for the past year. Therefore, its complete discontinuation should be minimally disruptive.
- **Alternative Methods**: Developers have been encouraged to use more secure alternatives such as `eth_signTypedData_v4` which provides better security by explicitly defining the data being signed. Further coverage of alternative methods for [Signing Data](https://docs.metamask.io/wallet/how-to/sign-data/).


## User Experience Considerations
- **Previous Default Settings**: Users will no longer have the option to enable `eth_sign`. Because `eth_sign` has been disabled by default for the past year, its complete discontinuation is expected to have minimal impact on the majority of users.
- **Alternatives**: Using older versions of MetaMask, alternative wallets, or command-line tools may provide an alternative for any remaining uses that truly require `eth_sign`.

## References
[A history of eth_sign in MetaMask](https://blog.danfinlay.com/a-history-of-eth_sign-in-metamask/)

## Copyright
Copyright and related rights waived via [CC0](../LICENSE).