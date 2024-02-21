# Solidity-Patched Changelist

## Added `Hardhat: Generate yaml file for variables` command
This command will look for `@bu-meta` tags in solidity files and gather the explorer source, any proxy that points to it, and the storage of the contract. This is aggregated across all files in the repo and written to a `hardhat_lsp_vars.yaml` file. 

This is accessible via the command palette (Cmd+Shift+P or Ctrl+Shift+P) by searching for `Hardhat: Generate yaml file for variables`.

The command takes an optional parameter of a space-separated string of directories that should be searched for solidity contracts.
- by default, "src lib" is used, but "contracts node_modules" could be provided to search those directories instead.

## Added additional Hover text for variables

If a contract contains a `@bu-meta source: <explorer_link>` and optionally `@bu-meta proxied-by: <explorer_link>`, the LSP will look for the `hardhat_lsp_vars.yaml` file and display the string located at the matching `<network>_<address>:vars[<hovered_var>]` entry.




# Solidity by Nomic Foundation

This extension adds language support for [Solidity](https://soliditylang.org/) to Visual Studio Code, and provides editor integration for [Hardhat](https://hardhat.org/) projects, and experimental support for [Foundry](https://getfoundry.sh/), [Truffle](https://trufflesuite.com/) and [Ape](https://www.apeworx.io/) projects. It supports:

- [Solidity-Patched Changelist](#solidity-patched-changelist)
  - [Added `Hardhat: Generate yaml file for variables` command](#added-hardhat-generate-yaml-file-for-variables-command)
  - [Added additional Hover text for variables](#added-additional-hover-text-for-variables)
- [Solidity by Nomic Foundation](#solidity-by-nomic-foundation)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
    - [Commands](#commands)
      - [Compile project](#compile-project)
      - [Clean artifacts](#clean-artifacts)
      - [Flatten contract](#flatten-contract)
    - [Task provider](#task-provider)
  - [Formatting](#formatting)
    - [Formatting Configuration](#formatting-configuration)
      - [Prettier](#prettier)
      - [Forge](#forge)
  - [Alternative editors](#alternative-editors)
  - [Feedback, help and news](#feedback-help-and-news)

Built by the [Nomic Foundation](https://nomic.foundation/). [We’re hiring](https://nomic.foundation/hiring).

---

## Table of Contents

- [Solidity-Patched Changelist](#solidity-patched-changelist)
  - [Added `Hardhat: Generate yaml file for variables` command](#added-hardhat-generate-yaml-file-for-variables-command)
  - [Added additional Hover text for variables](#added-additional-hover-text-for-variables)
- [Solidity by Nomic Foundation](#solidity-by-nomic-foundation)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
    - [Commands](#commands)
      - [Compile project](#compile-project)
      - [Clean artifacts](#clean-artifacts)
      - [Flatten contract](#flatten-contract)
    - [Task provider](#task-provider)
  - [Formatting](#formatting)
    - [Formatting Configuration](#formatting-configuration)
      - [Prettier](#prettier)
      - [Forge](#forge)
  - [Alternative editors](#alternative-editors)
  - [Feedback, help and news](#feedback-help-and-news)

---

## Installation

**Solidity by Nomic Foundation** can be installed by [using the Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=NomicFoundation.hardhat-solidity).

Some features (e.g. inline validation, quick fixes) are still experimental and are only enabled within a [Hardhat](https://hardhat.org/) project, this is a limitation that will be lifted with future releases.

[include '../docs/features.md']

### Commands

#### Compile project

When working on a Hardhat project, the command `Hardhat: Compile project` is available on the command palette. This will trigger a `hardhat compile` run.

![Compile command](https://raw.githubusercontent.com/NomicFoundation/hardhat-vscode/main/docs/gifs/command-compile.gif "Compile command")

#### Clean artifacts

When working on a hardhat project, the command `Hardhat: Clear cache and artifacts` is present on the command palette. This will trigger a `hardhat clean` run.

![Clean command](https://raw.githubusercontent.com/NomicFoundation/hardhat-vscode/main/docs/gifs/command-clean.gif "Clean command")

#### Flatten contract

When working on a solidity file inside a hardhat project, the command `Hardhat: Flatten this file and its dependencies` is present on the command palette and the context menu. This will trigger a `hardhat flatten $FILE` run, and will output the result in a new file tab.

![Flatten command](https://raw.githubusercontent.com/NomicFoundation/hardhat-vscode/main/docs/gifs/command-flatten.gif "Flatten command")

### Task provider

The extension is registered as a task provider for Hardhat projects, in which the `build` task is provided, running `hardhat compile`, and the `test` task, which runs `hardhat test`.

## Formatting

**Solidity by Nomic Foundation** provides formatting support for `.sol` files, by leveraging [prettier-plugin-solidity](https://github.com/prettier-solidity/prettier-plugin-solidity).

> **Note:** if you currently have other solidity extensions installed, or have had previously, they may be set as your default formatter for solidity files.

To set **Solidity by Nomic Foundation** as your default formatter for solidity files:

1. Within a Solidity file run the _Format Document With_ command, either through the **command palette**, or by right clicking and selecting through the context menu:

![Format Document With](https://raw.githubusercontent.com/NomicFoundation/hardhat-vscode/main/docs/images/format_document_with.png "Format Document With")

2. Select `Configure Default Formatter...`

![Format Document With](https://raw.githubusercontent.com/NomicFoundation/hardhat-vscode/main/docs/images/configure_default_formatter.png "Configure default formatter")

3. Select `Solidity` as the default formatter for solidity files

![Format Document With](https://raw.githubusercontent.com/NomicFoundation/hardhat-vscode/main/docs/images/select_solidity_plus_hardhat.png "Confiure default formatter")

### Formatting Configuration

Formatting can be configured to be provided by either `prettier` (the default) or `forge`.

#### Prettier

The default formatting rules that will be applied are taken from [prettier-plugin-solidity](https://github.com/prettier-solidity/prettier-plugin-solidity#configuration-file), with the exception that `explicitTypes` are preserved (rather than forced).

To override the settings, add a `prettierrc` configuration file at the root of your project. Add a `*.sol` file override to the prettier configuration file and change from the **defaults** shown:

```javascript
// .prettierrc.json
{
  "overrides": [
    {
      "files": "*.sol",
      "options": {
        "printWidth": 80,
        "tabWidth": 4,
        "useTabs": false,
        "singleQuote": false,
        "bracketSpacing": false,
        "explicitTypes": "preserve"
      }
    }
  ]
}
```

#### Forge

If `forge` is selected as the formatter under the configuration, then the `forge fmt` command is run on the open editor file to provide formatting. The `forge fmt` command determines the configuration based on the project's `foundry.toml` file.

The configuration options for `forge fmt` are [available here](https://book.getfoundry.sh/reference/config/formatter).

## Alternative editors

We currently distribute a [vim.coc](https://www.npmjs.com/package/@nomicfoundation/coc-solidity) extension and a [standalone language server](https://www.npmjs.com/package/@nomicfoundation/solidity-language-server) that you can integrate with your editor of choice to have full Solidity language support.

## Feedback, help and news

[Hardhat Support Discord server](https://hardhat.org/discord): for questions and feedback.

[Follow Hardhat on Twitter.](https://twitter.com/HardhatHQ)
