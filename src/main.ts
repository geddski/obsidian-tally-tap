import { Plugin } from 'obsidian';
import type { Editor } from 'obsidian';
import { parseTallySource } from './parse';
import { TallyView } from './tally-view';

export default class TallyPlugin extends Plugin {
	onload() {
		this.registerMarkdownCodeBlockProcessor('tally', (source, el, ctx) => {
			const tally = parseTallySource(source);
			if (!tally) {
				el.createDiv({
					cls: 'tally-error',
					text: 'Tally: expected a line like "Label: 4 / 20".',
				});
				return;
			}
			ctx.addChild(new TallyView(el, this.app, ctx, source, tally));
		});

		this.addCommand({
			id: 'insert',
			name: 'Insert counter',
			editorCallback: (editor: Editor) => {
				editor.replaceSelection('```tally\n0 / 10\n```\n');
			},
		});
	}
}
