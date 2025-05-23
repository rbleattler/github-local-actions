import { ThemeIcon, TreeItem, TreeItemCollapsibleState, Uri, WorkspaceFolder } from "vscode";
import { act } from "../../extension";
import { CustomSetting, Setting } from "../../settingsManager";
import { StorageKey } from "../../storageManager";
import { GithubLocalActionsTreeItem } from "../githubLocalActionsTreeItem";
import SettingTreeItem from "./setting";
import SettingFileTreeItem from "./settingFile";

export default class VariablesTreeItem extends TreeItem implements GithubLocalActionsTreeItem {
    static contextValue = 'githubLocalActions.variables';
    storageKey = StorageKey.VariableFiles;

    constructor(public workspaceFolder: WorkspaceFolder, variables: Setting[], variableFiles: CustomSetting[]) {
        super('Variables', TreeItemCollapsibleState.Collapsed);
        const selectedVariableFiles = variableFiles.filter(variableFile => variableFile.selected);
        this.description = `${variables.filter(variable => variable.selected).length}/${variables.length}` +
            (selectedVariableFiles.length > 0 ? ` + ${selectedVariableFiles[0].name}` : ``);
        this.contextValue = VariablesTreeItem.contextValue;
        this.iconPath = new ThemeIcon('symbol-key');
        const hasAllValues = variables.filter(variable => variable.selected && variable.value === '').length === 0;
        this.resourceUri = Uri.parse(`${VariablesTreeItem.contextValue}:Variables?hasAllValues=${hasAllValues}`, true);
    }

    async getChildren(): Promise<GithubLocalActionsTreeItem[]> {
        const items: GithubLocalActionsTreeItem[] = [];

        const settings = await act.settingsManager.getSettings(this.workspaceFolder, false);

        const variableTreeItems: GithubLocalActionsTreeItem[] = [];
        for (const variable of settings.variables) {
            variableTreeItems.push(SettingTreeItem.getVariableTreeItem(this.workspaceFolder, variable));
        }
        items.push(...variableTreeItems.sort((a, b) => a.label!.toString().localeCompare(b.label!.toString())));

        const variableFileTreeItems: GithubLocalActionsTreeItem[] = [];
        for (const variableFile of settings.variableFiles) {
            variableFileTreeItems.push(SettingFileTreeItem.getVariableTreeItem(this.workspaceFolder, variableFile));
        }
        items.push(...variableFileTreeItems.sort((a, b) => a.label!.toString().localeCompare(b.label!.toString())));

        return items;
    }
}