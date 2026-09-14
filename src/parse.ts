// a tally block body is a single line like `Coffee: 4 / 20 (down, good, icon: coffee)`.
// prefix and suffix are kept verbatim so a round-trip never rewrites the
// user's wording; only the two numbers are regenerated.
const OPTION = String.raw`(?:up|down|good|bad|reverse|icon:\s*\S+?)`;
const LINE_RE = new RegExp(
	String.raw`^(.*?)\s*(-?\d+)\s*\/\s*(\d+)(\s*\(?[\s,]*(?:${OPTION}[\s,]*)*\)?\s*)$`,
	'i',
);

export type Direction = 'up' | 'down';
// what reaching the max means: `bad` warms toward red (a budget being
// used up), `good` cools toward green (a goal being hit).
export type Intent = 'bad' | 'good';

export interface Tally {
	prefix: string;
	count: number;
	max: number;
	suffix: string;
	direction: Direction;
	intent: Intent;
	// per-block icon override: lucide name or emoji
	icon: string | null;
	// show a small button that steps the other way, for corrections
	hasReverse: boolean;
}

export function parseTallyLine(line: string): Tally | null {
	const m = LINE_RE.exec(line);
	if (!m) {
		return null;
	}
	const suffix = m[4] ?? '';
	const iconClause = /icon:\s*([^\s,)]+)/i.exec(suffix);
	const icon = iconClause?.[1] ?? null;
	// strip the icon clause first so a name like `arrow-down` can't flip the direction
	const rest = iconClause ? suffix.replace(iconClause[0], '') : suffix;
	const words: string[] = rest.toLowerCase().match(/\b(?:up|down|good|bad|undo)\b/g) ?? [];
	return {
		prefix: m[1] ?? '',
		count: Number(m[2]),
		max: Number(m[3]),
		suffix,
		direction: words.includes('down') ? 'down' : 'up',
		intent: words.includes('good') ? 'good' : 'bad',
		icon,
		hasUndo: words.includes('reverse'),
	};
}

export function parseTallySource(source: string): Tally | null {
	for (const line of source.split('\n')) {
		const t = parseTallyLine(line);
		if (t) {
			return t;
		}
	}
	return null;
}

export function serializeTally(t: Tally): string {
	const label = t.prefix ? `${t.prefix} ` : '';
	return `${label}${t.count} / ${t.max}${t.suffix.trimEnd()}`;
}

// display label: prefix without a trailing colon
export function displayLabel(t: Tally): string {
	return t.prefix.replace(/:\s*$/, '');
}

// where the count sits after a reset
export function startCount(t: Tally): number {
	return t.direction === 'down' ? t.max : 0;
}

// how far along the tally is, 0 at the start value, 1 at the target,
// above 1 once past it
export function progress(t: Tally): number {
	if (t.max <= 0) {
		return 0;
	}
	return t.direction === 'down' ? (t.max - t.count) / t.max : t.count / t.max;
}
