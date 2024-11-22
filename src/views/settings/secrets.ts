import { ThemeIcon, TreeItem, TreeItemCollapsibleState, WorkspaceFolder } from "vscode";
import { act } from "../../extension";
import { Setting } from "../../settingsManager";
import { StorageKey } from "../../storageManager";
import { GithubLocalActionsTreeItem } from "../githubLocalActionsTreeItem";
import SettingTreeItem from "./setting";
import SettingFileTreeItem from "./settingFile";

export default class SecretsTreeItem extends TreeItem implements GithubLocalActionsTreeItem {
    static contextValue = 'githubLocalActions.secrets';
    storageKey = StorageKey.SecretFiles;

    constructor(public workspaceFolder: WorkspaceFolder, secrets: Setting[]) {
        super('Secrets', TreeItemCollapsibleState.Collapsed);
        this.description = `${secrets.filter(secret => secret.selected).length}/${secrets.length}`;
        this.contextValue = SecretsTreeItem.contextValue;
        this.iconPath = new ThemeIcon('lock');
    }

    async getChildren(): Promise<GithubLocalActionsTreeItem[]> {
        const items: GithubLocalActionsTreeItem[] = [];

        const settings = await act.settingsManager.getSettings(this.workspaceFolder, false);

        const secretTreeItems: GithubLocalActionsTreeItem[] = [];
        for (const secret of settings.secrets) {
            secretTreeItems.push(SettingTreeItem.getSecretTreeItem(this.workspaceFolder, secret));
        }
        items.push(...secretTreeItems.sort((a, b) => a.label!.toString().localeCompare(b.label!.toString())));

        const secretFileTreeItems: GithubLocalActionsTreeItem[] = [];
        for (const secretFile of settings.secretFiles) {
            secretFileTreeItems.push(SettingFileTreeItem.getSecretTreeItem(this.workspaceFolder, secretFile));
        }
        items.push(...secretFileTreeItems.sort((a, b) => a.label!.toString().localeCompare(b.label!.toString())));

        return items;
    }
}