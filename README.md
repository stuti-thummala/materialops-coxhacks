# cai-code-checker-runner-template

CAI-Code-Checker runner and profiles for <YOUR_RUNNER_LANGUAGE> projects

This repostory generates a Docker image with the necessary tools and profiles to use [pre-commit](https://pre-commit.com/)
to *format* and *lint* files in repositories for repositories with <YOUR_RUNNER_LANGUAGE>  code.

This image is used by `cai-code-checker`.

## Making changes to this repository

Regular CAI-Code-Checker users should edit this repository in the following situations:

- to add new lint and format templates under the `profiles` directory
- to add more linters and formatters to existing profiles

Please note that changes should ideally happen first in profiles other than the default profile,
allowing a restricted group of users to test and evaluate the change before it can be propagated
to the default profile.
