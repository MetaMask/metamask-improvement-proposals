---
MIP: X
Title: Fix Error Handling in API Responses
Status: Draft
Stability: Experimental
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions/37
Author(s): Shane Jonas (@shanejonas)
Type: Maintaner
Created: 2024-03-04
---

#### Abstract
This proposal aims to refine MetaMask's API error handling by eliminating the practice of stringifying or wrapping errors. The current edge cases obscure underlying issues, complicating debugging and resolution for developers.

#### Motivation
Issue https://github.com/MetaMask/metamask-extension/issues/19697, https://github.com/MetaMask/metamask-extension/issues/15250 and https://github.com/MetaMask/metamask-extension/pull/15205#issuecomment-1199953855 highlighted difficulties faced by developers due to the API's error handling mechanism, where some errors are wrapped and stringified. This change proposes to break some existing error cases to facilitate clearer understanding and quicker resolution of issues.

#### Specification
- **Current Behaviour:** Errors returned by the API are wrapped and stringified, leading to terribly formatted error messages in some cases.
- **Proposed Change:** Modify the error handling process to return original error messages directly without wrapping or stringification. This would introduce a breaking change to developers who have wrote code to parse those errors and handle them.


#### Examples
There are some edge cases with sendTransaction where a node may have formatted the error message in a way that is not expected.

```javascript
window.ethereum.request({ method: 'eth_sendTransaction', params: [tx] })
  .catch((error) => {
    console.error(error);
  });
```

##### Current Behaviour
```json
{
  "jsonrpc": "2.0",
  "error": "[ethjs-query] while formatting outputs from RPC '{\"value\":{\"code\":-32603,\"message\":\"Internal Server Error\"}}'",
  "id": 4653223632683671
}
```
```json
{
  "jsonrpc": "2.0",
  "error": "[ethjs-query] while formatting outputs from RPC '{\"value\":{\"code\":-32603,\"data\":{\"message\":\"Internal Server Error\"}}}'",
}
```
```json
{
  "id": 0,
  "error": {
    "code": -32603,
    "message": "[ethjs-query] while formatting outputs from RPC '{\"value\":{\"code\":-32603,\"data\":{\"message\":\"VM Exception while processing transaction: invalid opcode\",\"code\":-32000,\"data\":{\"0x877c456d0b406f0706f405b0d2eb4e0ebc69629a539503e7ad94a7f9b6ba36af\":{\"error\":\"invalid opcode\",\"program_counter\":13,\"return\":\"0x\"},\"stack\":\"c: VM Exception while processing transaction: invalid opcode\\n    at Function.c.fromResults (/home/x/code/x/smart-contracts/node_modules/ganache-cli/build/ganache-core.node.cli.js:4:192416)\\n    at w.processBlock (/home/x/code/x/smart-contracts/node_modules/ganache-cli/build/ganache-core.node.cli.js:42:50915)\\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\",\"name\":\"c\"}}}}'"
  }
}

##### Proposed Behaviour
```json
{ 
  "jsonrpc":"2.0",
  "error": {
    "message": "Internal Server Error",
    "code": -32603,
  },
  "id": 4653223632683671
}
```

#### Rationale
Directly presenting errors enhances developer experience by providing clear, actionable insights into issues encountered during development, thereby reducing troubleshooting time and effort. This change would also align MetaMask's error handling with the broader Ethereum ecosystem, making it easier for developers to work with MetaMask.

#### Backwards Compatibility
This change is expected to **NOT** be backwards compatible, as it involves changing the error message formatting for some cases. Developers accustomed to the existing error handling mechanism for those cases may need to adjust their code.

#### Test Cases
- Test scenarios where API errors are triggered to ensure that the error messages are returned as expected without any wrapping or stringifying.
- Compatibility testing with MetaMask extension, mobile and existing dApps to ensure no adverse effects on functionality.

#### Implementation
The proposed changes would probably be implemented in the `ethjs-query` library (and possibly other `ethjs-*` libraries, following a review and testing process to ensure accuracy and reliability of error messages.

This proposal seeks feedback from the MetaMask developer community to refine and finalize the approach for fixing error handling.