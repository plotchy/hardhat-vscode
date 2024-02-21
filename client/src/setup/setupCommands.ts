import * as vscode from "vscode";
import { ExtensionState } from "../types";

import CompileCommand from "../commands/CompileCommand";
import FlattenCurrentFileCommand from "../commands/FlattenCurrentFileCommand";
import CleanCommand from "../commands/CleanCommand";
import Command from "../commands/Command";
import GenerateCommand from "../commands/GenerateCommand";

type ICommandClass = new (state: ExtensionState) => Command;

const commandClasses: ICommandClass[] = [
  CompileCommand,
  FlattenCurrentFileCommand,
  CleanCommand,
  GenerateCommand,
];

export async function setupCommands(state: ExtensionState) {
  for (const commandClass of commandClasses) {
    if (commandClass === GenerateCommand) {
      const command = new commandClass(state);

      const disposable = vscode.commands.registerCommand(command.name(), async () => {
        const userInput = await vscode.window.showInputBox({
          prompt: "Enter directories to find solidity contracts within. Default 'src lib'",
          placeHolder: "",
        });
        
        let args: string[] = []
        if (userInput !== null && userInput !== undefined) {
          args = userInput.split(" ")
        }

        await command.execute(args)
      });

      state.context.subscriptions.push(disposable);

    } else {
      const command = new commandClass(state);

      const disposable = vscode.commands.registerCommand(
        command.name(),
        (...args) => command.execute(...args)
      );

      state.context.subscriptions.push(disposable);
    }
  }
}
