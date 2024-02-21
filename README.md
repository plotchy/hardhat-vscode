# Solidity-Patched 

## To Install

```sh
code --install-extension hardhat-solidity-patched-0.7.2.vsix
```
or:
- right click `hardhat-solidity-patched-0.7.2.vsix` in project tree
- Choose "Install Extension VSIX" in context menu

You should disable the original `Solidity` extension provided by NomicFoundation in the extensions tab.

## How To Use
1. Do a bu-rs pull with the storage enabled.
2. Open command palette (Cmd+Shift+P or Ctrl+Shift+P) and run `Hardhat: Generate yaml file for variables`
   1. it'll prompt for directories to look for solidity files in. By default it uses "src lib".
   2. this will add a `hardhat_lsp_vars.yaml` file to the root of your project
3. Hover over variables to show the values associated with it.

## Changelist

### Added `Hardhat: Generate yaml file for variables` command
This command will look for `@bu-meta` tags in solidity files and gather the explorer source, any proxy that points to it, and the storage of the contract. This is aggregated across all files in the repo and written to a `hardhat_lsp_vars.yaml` file. 

This is accessible via the command palette (Cmd+Shift+P or Ctrl+Shift+P) by searching for `Hardhat: Generate yaml file for variables`.

The command takes an optional parameter of a space-separated string of directories that should be searched for solidity contracts.
- by default, "src lib" is used, but "contracts node_modules" could be provided to search those directories instead.

## Added additional Hover text for variables

If a contract contains a `@bu-meta source: <explorer_link>` and optionally `@bu-meta proxied-by: <explorer_link>`, the LSP will look for the `hardhat_lsp_vars.yaml` file and display the string located at the matching `<network>_<address>:vars[<hovered_var>]` entry.

# Solidity for Visual Studio Code by Nomic Foundation

**Solidity for VS Code by Nomic Foundation** is a [Visual Studio Code](https://code.visualstudio.com/) extension that provides enhanced [Solidity language](https://soliditylang.org/) features.

Built by the [Nomic Foundation](https://nomic.foundation/) for the Ethereum community.

Join our [Hardhat Support Discord server](https://hardhat.org/discord) to stay up to date on new releases, plugins and tutorials.

## Packages

Please refer to one of these packages to find detailed documentation relevant to your use case:

- [Solidity language server](./server/README.md)
- [VSCode extension](./client/README.md)
- [coc.nvim extension](./coc/README.md)

## Contributing

Contributions are always welcome! Feel free to [open any issue](https://github.com/NomicFoundation/hardhat-vscode/issues) or send a pull request.

Go to [CONTRIBUTING.md](./CONTRIBUTING.md) to learn about how to set up the extension's development environment.

## Feedback, help and news

[Hardhat Support Discord server](https://hardhat.org/discord): for questions and feedback.

[Follow Hardhat on Twitter.](https://twitter.com/HardhatHQ)
