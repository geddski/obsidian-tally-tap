import { PluginSettingTab } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';

export interface TallySettings {
	// also show a small button for the opposite direction, for corrections
	showCorrectionButton: boolean;
	// lucide icon name or emoji for the primary button, by direction
	upIcon: string;
	downIcon: string;
}

export const DEFAULT_SETTINGS: TallySettings = {
	showCorrectionButton: false,
	upIcon: 'arrow-up',
	downIcon: 'arrow-down',
};

// declarative tab: obsidian reads and persists `plugin.settings` by key
export class TallySettingTab extends PluginSettingTab {
	getSettingDefinitions(): SettingDefinitionItem<keyof TallySettings>[] {
		return [
			{
				name: 'Show correction button',
				desc: 'Also show a small button that moves the count the other way.',
				control: { type: 'toggle', key: 'showCorrectionButton' },
			},
			{
				name: 'Up icon',
				desc: 'Lucide icon name or emoji for counters that count up. A block can override it with (icon: coffee).',
				control: { type: 'text', key: 'upIcon', placeholder: DEFAULT_SETTINGS.upIcon },
			},
			{
				name: 'Down icon',
				desc: 'Lucide icon name or emoji for counters that count down.',
				control: { type: 'text', key: 'downIcon', placeholder: DEFAULT_SETTINGS.downIcon },
			},
		];
	}
}
