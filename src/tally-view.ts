import { App, MarkdownPostProcessorContext, MarkdownRenderChild, Notice } from 'obsidian';
import { MaxModal } from './max-modal';
import { displayLabel, parseTallyLine, progress, serializeTally, startCount } from './parse';
import type { Tally } from './parse';

export class TallyView extends MarkdownRenderChild {
	private countEl!: HTMLElement;
	private maxEl!: HTMLElement;
	private cardEl!: HTMLElement;

	constructor(
		containerEl: HTMLElement,
		private app: App,
		private ctx: MarkdownPostProcessorContext,
		private source: string,
		private tally: Tally,
	) {
		super(containerEl);
	}

	onload() {
		const card = this.containerEl.createDiv({ cls: 'tally' });
		this.cardEl = card;

		const main = card.createDiv({ cls: 'tally-main' });
		const label = displayLabel(this.tally);
		if (label) {
			main.createDiv({ cls: 'tally-label', text: label });
		}
		const numbers = main.createDiv({ cls: 'tally-numbers' });
		this.countEl = numbers.createSpan({ cls: 'tally-count' });
		numbers.createSpan({ cls: 'tally-sep', text: '/' });
		this.maxEl = numbers.createEl('button', {
			cls: 'tally-max clickable-icon',
			attr: { 'aria-label': 'Set max' },
		});
		this.maxEl.addEventListener('click', () => this.openMaxModal());

		// the button that moves the count toward the target is the big one;
		// the other direction stays available for corrections but recedes.
		const isDown = this.tally.direction === 'down';
		const actions = card.createDiv({ cls: 'tally-actions' });
		const secondary = actions.createEl('button', {
			cls: 'tally-btn tally-secondary',
			text: isDown ? '+' : '−',
			attr: { 'aria-label': isDown ? 'Increase' : 'Decrease' },
		});
		secondary.addEventListener('click', () => this.bump(isDown ? 1 : -1));
		const primary = actions.createEl('button', {
			cls: 'tally-btn tally-primary',
			text: isDown ? '−' : '+',
			attr: { 'aria-label': isDown ? 'Decrease' : 'Increase' },
		});
		primary.addEventListener('click', () => this.bump(isDown ? -1 : 1));

		card.createDiv({ cls: 'tally-bar' }).createDiv({ cls: 'tally-bar-fill' });

		this.render();
	}

	private render() {
		const { count, max, intent } = this.tally;
		this.countEl.setText(String(count));
		this.maxEl.setText(String(max));

		const ratio = progress(this.tally);
		const isOver = max > 0 && ratio > 1;
		const isFull = max > 0 && ratio === 1;
		this.cardEl.toggleClass('is-over', isOver);
		this.cardEl.toggleClass('is-full', isFull);
		this.cardEl.toggleClass('is-good', intent === 'good');

		// colour stays neutral for the first half, then warms in two legs:
		// neutral → first tint over 50–80%, first → second tint over 80–100%.
		// `bad` runs yellow → orange (red once past the max); `good` runs
		// straight to green.
		const [tintA, tintB] =
			intent === 'good'
				? ['var(--color-green)', 'var(--color-green)']
				: ['var(--color-yellow)', 'var(--color-orange)'];
		let from = 'var(--text-normal)';
		let to = tintA;
		let mix = 0;
		if (ratio > 0.8) {
			from = tintA;
			to = tintB;
			mix = Math.min((ratio - 0.8) / 0.2, 1);
		} else if (ratio > 0.5) {
			mix = (ratio - 0.5) / 0.3;
		}
		this.cardEl.setCssProps({
			'--tally-from': from,
			'--tally-to': to,
			'--tally-mix': `${Math.round(mix * 100)}%`,
			'--tally-progress': `${Math.round(Math.min(Math.max(ratio, 0), 1) * 100)}%`,
		});
	}

	private bump(delta: number) {
		this.tally.count += delta;
		this.render();
		void this.persist();
	}

	private openMaxModal() {
		const resetLabel =
			this.tally.direction === 'down' ? 'Reset count to max' : 'Reset count to 0';
		new MaxModal(this.app, this.tally.max, resetLabel, ({ max, shouldReset }) => {
			this.tally.max = max;
			if (shouldReset) {
				this.tally.count = startCount(this.tally);
			}
			this.render();
			void this.persist();
		}).open();
	}

	// write the current state back into the code block. absolute values are
	// written (not deltas) so rapid taps converge on the widget's state even
	// though each vault.process call sees a different snapshot of the file.
	private async persist() {
		const file = this.app.vault.getFileByPath(this.ctx.sourcePath);
		if (!file) {
			new Notice('Tally: could not find the note to update.');
			return;
		}
		const nextLine = serializeTally(this.tally);
		const info = this.ctx.getSectionInfo(this.containerEl);

		await this.app.vault.process(file, (data) => {
			const lines = data.split('\n');
			const range = info
				? { start: info.lineStart + 1, end: info.lineEnd - 1 }
				: findBlockBySource(lines, this.source);
			if (!range) {
				new Notice('Tally: could not find the block to update.');
				return data;
			}
			for (let i = range.start; i <= range.end; i++) {
				const line = lines[i];
				if (line !== undefined && parseTallyLine(line)) {
					lines[i] = nextLine;
					break;
				}
			}
			return lines.join('\n');
		});
		this.source = nextLine;
	}
}

// fallback when getSectionInfo() is unavailable (embeds, some canvas cases):
// locate the first ```tally fence whose body matches what we rendered.
function findBlockBySource(
	lines: string[],
	source: string,
): { start: number; end: number } | null {
	const body = source.trimEnd();
	for (let i = 0; i < lines.length; i++) {
		if (!/^\s*(`{3,}|~{3,})\s*tally\b/.test(lines[i] ?? '')) {
			continue;
		}
		const start = i + 1;
		let end = start;
		while (end < lines.length && !/^\s*(`{3,}|~{3,})\s*$/.test(lines[end] ?? '')) {
			end++;
		}
		if (lines.slice(start, end).join('\n').trimEnd() === body) {
			return { start, end: end - 1 };
		}
	}
	return null;
}
