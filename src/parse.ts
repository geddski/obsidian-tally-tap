// a tally block body is a single line like `Coffee: 4 / 20`. the prefix (label)
// is kept verbatim so a round-trip never rewrites the user's wording.
const LINE_RE = /^(.*?)\s*(-?\d+)\s*\/\s*(\d+)\s*$/;

export interface Tally {
	prefix: string;
	count: number;
	max: number;
}

export function parseTallyLine(line: string): Tally | null {
	const m = LINE_RE.exec(line);
	if (!m) {
		return null;
	}
	return {
		prefix: m[1] ?? '',
		count: Number(m[2]),
		max: Number(m[3]),
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
	return `${label}${t.count} / ${t.max}`;
}

// display label: prefix without a trailing colon
export function displayLabel(t: Tally): string {
	return t.prefix.replace(/:\s*$/, '');
}
