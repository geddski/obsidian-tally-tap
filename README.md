# Tally

Big tappable counters for Obsidian, desktop and mobile.

````
```tally
Coffee: 0 / 4
```
````

One line: optional label, `count / max`, optional trailing words in parentheses.

| Word   | Meaning                                                         |
| ------ | --------------------------------------------------------------- |
| `up`   | count climbs from 0 toward max (default)                        |
| `down` | count descends from max toward 0; reset returns it to max       |
| `bad`  | reaching max is a limit: neutral → yellow → orange, red past it (default) |
| `good` | reaching max is a goal: neutral → green                         |
| `undo` | also show a small button that steps the other way, for corrections |
| `icon: <name>` | button icon for this block: a [Lucide](https://lucide.dev) name or an emoji |

````
```tally
Pushups left: 40 / 40 (down, good)
```
````

- One big button moves the count toward the target. Its icon is an up/down arrow by default (Settings → Tally), overridable per block.
- Tap the max to change it. The dialog resets the count by default (to 0, or to max for `down`).
- Colour stays neutral for the first half, then tints over the second half.
- The block is rewritten in place, so the note stays plain markdown.
- Command: **Insert counter** drops a block at the cursor.

## Dev

```
bun install
bun run dev      # watch build → main.js
bun run build    # typecheck + minified build
bun run lint
```

Symlink the repo into a vault's `.obsidian/plugins/tally` to run it live.
