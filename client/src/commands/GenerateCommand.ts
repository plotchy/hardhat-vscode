import * as vscode from 'vscode';
import { generateYamlForSolidityFiles } from "../utils/generateYaml";
import Command from "./Command";

export default class GenerateCommand extends Command {
  public name(): string {
    return "solidity.hardhat.generate";
  }

  public async execute(args: string[] | undefined) {
    let relativePaths = ["src", "lib"]
    if (args) {
      // args will be space-separated relative paths that are folders. for example: "src lib contracts"
      relativePaths = args.map((path) => path.trim()).filter((path) => path.length > 0);
      if (relativePaths.length === 0) {
        // by default we'll use "src" and "lib"
        relativePaths = ["src", "lib"];
      }
    }

    if (!(await this.beforeExecute())) return;

    // Check if a workspace is currently opened
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
      this.state.outputChannel.appendLine("No workspace folder is open.");
      return;
    }

    // Assuming the first workspace folder is the root of interest
    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;

    const paths = relativePaths.map(relativePath => vscode.Uri.joinPath(vscode.Uri.file(workspaceRoot), relativePath).fsPath);

    // generate yaml for all solidity files with absolute paths
    await generateYamlForSolidityFiles(workspaceRoot, paths);
  }

  public async beforeExecute() {
    return true;
  }

  public onStdout(data: string): void {
    this.state.outputChannel.append(data);
  }

  public onStderr(data: string): void {
    this.state.outputChannel.append(data);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onClose(_status: number): void {}
}
