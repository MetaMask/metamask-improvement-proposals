---
MIP: X
Title: Support for CAIP-27 with Versioning in MetaMask
Status: Draft
Stability: n/a
discussions-to: https://github.com/MetaMask/metamask-improvement-proposals/discussions
Author(s): Shane Jonas (jonas.shane@gmail.com)
Type: Maintainer
Created: 2023-05-31

---

## Summary
This proposal aims to enhance MetaMask's support for the CAIP-27 (Crypto Asset Identifier Protocol) standard by introducing versioning capabilities. By adding support for versioned CAIP-27 requests, MetaMask can provide a more flexible and future-proof solution for identifying and interacting with crypto assets across different chains and networks.

## Motivation
The CAIP-27 standard is widely used for identifying crypto assets and provides a standardized way to represent asset identifiers. However, the current implementation in MetaMask lacks support for versioning, which limits its ability to adapt, change, and fix  the Metamask API.

Introducing versioning support in MetaMask's CAIP-27 implementation will enable better compatibility with different versions of the API. 

By supporting versioned CAIP-27, MetaMask ensures that users can seamlessly interact with crypto assets across various networks and chains, even as asset identifier standards and the wallet evolve.

## Proposal Specification
To support versioning in MetaMask's CAIP-27 implementation, the following changes are proposed:

1. Update the existing CAIP-27 API to accept a version parameter.

2. Modify the CAIP-27 resolution logic in MetaMask to handle versioned appropriately. The resolution process should take into account the specified version.

The updated CAIP-27 API in MetaMask will have the following structure:

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "provider_request",
  "params": {
    "version": "0.0.1",
    "scope": "eip155:1",
    "request": {
      "method": "personal_sign",
      "params": [
        "0x68656c6c6f20776f726c642c207369676e2074657374206d65737361676521",
        "0xa89Df33a6f26c29ea23A9Ff582E865C03132b140"
      ]
    }
  }
}
```

The proposed changes will enhance MetaMask's CAIP-27 implementation to support versioned requests, providing a more flexible and future-proof solution for identifying and interacting with crypto assets.

## Caveats
Introducing versioning support for CAIP-27 in MetaMask may require additional storage and computational resources to handle the resolution and retrieval of version-specific asset metadata. Careful consideration should be given to optimize the implementation to minimize any potential impact on performance.

## Implementation
The MetaMask team will be responsible for implementing the proposed changes to support versioned CAIP-27 requests. This will involve updating the CAIP-27 resolution logic, modifying the API, and ensuring compatibility with different versions of requests.

## Developer Adoption Considerations
Developers integrating MetaMask's CAIP-27 functionality should consider the following aspects when adopting versioned asset identifiers:

1. Handling Versioned Requests: Developers should update their dapp logic to consider the specified version parameter when calling the MetaMask API.

2. Handling Deprecation: Developers should update their dapp to use the a newer version when versions are considered deprecated.

This ensures compatibility with the corresponding version-specific specifications.
 
### Deprecation of Versions
To ensure the ongoing maintenance and efficiency of MetaMask's CAIP-27 API implementation, a deprecation policy for versions should be established. After a certain number of versions or a specified period, older versions may be deprecated to streamline development efforts and optimize resource allocation, especially in the context of our multichain efforts.

The deprecation policy may include the following considerations:

1.  Deprecation Timeline: Specify the duration or number of versions after which a version will be marked as deprecated.
    
2.  Deprecation Notice: Provide a recommended timeframe for announcing the deprecation of a version to give developers and users sufficient notice.
    
3.  Communication Strategy: Outline the channels and methods through which the deprecation notice will be communicated, such as release notes, documentation updates, or developer newsletters.
    
4.  Sunset Period: Define a grace period during which the deprecated version will still be supported but not actively maintained. This period allows users and developers to transition to newer versions.
    
5.  Removal and Cleanup: Describe the process for removing deprecated versions from MetaMask's CAIP-27 implementation, including any necessary cleanup steps.
    

By establishing a clear deprecation policy, MetaMask can effectively manage the lifecycle of versioned CAIP-27 implementations, balancing the need for innovation with the stability and support of existing versions.

### Errors
In order to provide a seamless user experience and improve developer integration with MetaMask's CAIP-27 implementation, it is essential to define error handling mechanisms. One common error that can occur when working with versioned requests is "Version Not Supported." This error indicates that the requested version of the CAIP-27 request is not supported by MetaMask.

When encountering a "Version Not Supported" error, MetaMask should provide informative and actionable error messages to users and developers. The error message should clearly communicate that the specified version is not supported and suggest potential solutions. These may include:

1.  Upgrade MetaMask: Users should be encouraged to update their MetaMask extension or application to the latest version that supports the desired CAIP-27 version. Providing guidance on how to update MetaMask will help users access the required functionality.
    
2.  Use a Compatible Version: Developers should consider using a supported version of the CAIP-27 request that is compatible with MetaMask. The error message should recommend checking the list of supported versions or consulting MetaMask's documentation for guidance.
    
3.  Contact Support: If users or developers have questions or encounter difficulties related to versioned requests, they should be directed to MetaMask's support channels for assistance. Clear instructions on how to reach out to support, such as submitting a support ticket or joining a community forum, should be provided.
    

By implementing comprehensive error handling, including specific error messages for "Version Not Supported," MetaMask can assist users and developers in troubleshooting issues related to unsupported versions of CAIP-27 requests. This approach ensures a better user experience and fosters successful integration with MetaMask's CAIP-27 implementation.

### Semantic Versioning (SemVer)
To ensure clear and consistent versioning practices, MetaMask's CAIP-27 implementation should follow Semantic Versioning (SemVer) guidelines. SemVer provides a standard way to communicate changes in software versions and helps developers understand the compatibility and impact of updates.

The following principles of SemVer should be adhered to:

1.  **Major Version** (X.0.0): Increment the major version when making incompatible changes to the CAIP-27 implementation. These changes may include breaking changes to the API, significant updates to functionality, or modifications that require users and developers to make code adjustments.
    
2.  **Minor Version** (X.Y.0): Increase the minor version when adding new features or functionality to the CAIP-27 implementation. These updates should be backward-compatible with previous versions, allowing existing integrations to continue working without modifications.
    
3.  **Patch Version** (X.Y.Z): Update the patch version for backward-compatible bug fixes, performance improvements, or other changes that do not introduce new features or breaking changes. Patch updates should provide enhancements and bug fixes while maintaining compatibility with existing code.

By adopting Semantic Versioning for MetaMask's CAIP-27 implementation, developers can easily understand the implications of version updates and make informed decisions about integration and compatibility. This approach promotes transparency, consistency, and stability in the evolution of the CAIP-27 standard within MetaMask.

## User Experience Considerations
The support for versioned CAIP-27 asset identifiers in MetaMask will enhance the user experience by enabling seamless interaction with assets across different networks and chains. Users can specify the desired version when resolving asset identifiers, ensuring compatibility with specific version-specific specifications.

## Security Considerations
The introduction of versioning support for CAIP-27 in MetaMask should consider the following security considerations:

1. Request Validation: MetaMask should validate the format and integrity of requests to prevent potential malicious or malformed inputs.

2. Trusted Metadata Sources: MetaMask should rely on trusted sources when retrieving version-specific asset metadata to mitigate the risk of unauthorized or tampered data.

3. User Education: Users should be educated about the importance of using trusted versions and the potential risks associated with interacting with unsupported or unknown versions of CAIP-27 request.

## References
[CAIP-27: Crypto Asset Identifier Protocol](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-27.md)

## Feedback
Please provide feedback on this proposal by opening an issue in the MetaMask MIPs repository.

## Committed Developers
Shane Jonas (@shanejonas)

## Copyright
Copyright and related rights waived via [CC0](../LICENSE).
