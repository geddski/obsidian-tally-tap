import { App, Modal, Setting } from 'obsidian';

export interface MaxModalResult {
	max: number;
	shouldReset: boolean;
}

export class MaxModal extends Modal {
	private max: number;
	private shouldReset = true;

	constructor(
		app: App,
		currentMax: number,
		private resetLabel: string,
		private onSubmit: (result: MaxModalResult) => void,
	) {
		super(app);
		this.max = currentMax;
	}

	onOpen() {
		const { contentEl } = this;
		this.titleEl.setText('Set max');

		new Setting(contentEl).setName('Max').addText((text) => {
			text.inputEl.type = 'number';
			text.inputEl.inputMode = 'numeric';
			text.inputEl.min = '1';
			text.setValue(String(this.max)).onChange((v) => {
				this.max = Number(v);
			});
			text.inputEl.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					this.submit();
				}
			});
			window.setTimeout(() => {
				text.inputEl.focus();
				text.inputEl.select();
			}, 0);
		});

		new Setting(contentEl).setName(this.resetLabel).addToggle((toggle) => {
			toggle.setValue(this.shouldReset).onChange((v) => {
				this.shouldReset = v;
			});
		});

		new Setting(contentEl).addButton((btn) => {
			btn.setButtonText('Save')
				.setCta()
				.onClick(() => this.submit());
		});
	}

	private submit() {
		if (!Number.isFinite(this.max) || this.max < 1) {
			return;
		}
		this.close();
		this.onSubmit({ max: Math.floor(this.max), shouldReset: this.shouldReset });
	}

	onClose() {
		this.contentEl.empty();
	}
}
