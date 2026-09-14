import { Plugin } from 'obsidian';
import type { Editor } from 'obsidian';
import { parseTallySource } from './parse';
import { DEFAULT_SETTINGS, TallySettingTab } from './settings';
import type { TallySettings } from './settings';
import { TallyView } from './tally-view';

export default class TallyPlugin extends Plugin {
	settings!: TallySettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new TallySettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor('tally', (source, el, ctx) => {
			const tally = parseTallySource(source);
			if (!tally) {
				el.createDiv({
					cls: 'tally-error',
					text: 'Tally: expected a line like "Label: 4 / 20".',
				});
				return;
			}
			ctx.addChild(new TallyView(el, this, ctx, source, tally));
		});

		this.addCommand({
			id: 'insert',
			name: 'Insert counter',
			editorCallback: (editor: Editor) => {
				editor.replaceSelection('```tally\n0 / 10\n```\n');
			},
		});
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<TallySettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
