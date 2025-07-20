# 🌌 Phosphor Universal

A framework-agnostic, typescript port of phosphor icons that supports tree-shaking out of the box.

This package exports all 9,000+ phosphor icons and their variants as TS objects which can be rendered by a component in your preferred web framework.

- 🌐 Works with React, Svelte, Vue, Solid, Angular, Astro, anywhere you can import Typescript objects
- 🌳 Tree-shakeable. No build plugins required!
- 💃 Supports all phosphor variants: Light, Bold, Duotone etc
- 🆕 Latest version: Phosphor v2.1.0
- 💝 Maintained by: [Ferndesk](https://ferndesk.com)

## Usage

Install the package

```bash
pnpm i phosphor-universal
```

### 1. Create an Icon component

Create an `Icon` component in your preferred web framework that takes a `PhosphorIcon` and renders its content to the DOM

The SVG content is stored in `PhosphorIcon.content`.

### Example

#### React

Icon.tsx

```tsx
import type { PhosphorIcon } from "phosphor-universal";

export type IconData = PhosphorIcon;

interface IconProps {
  data: PhosphorIcon;
  size?: number;
  className?: string;
}

export function Icon({ data, size = 24, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={`${className || ""} fill-current`}
      width={size}
      height={size}
      dangerouslySetInnerHTML={{ __html: data.content }}
    />
  );
}
```

#### Svelte

Icon.svelte

```svelte
<script lang="ts">
	import type { PhosphorIcon } from 'phosphor-universal';

	const props = $props<{
		data: PhosphorIcon;
		size?: number;
		class?: string;
	}>();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 256 256"
	class="{props.class} fill-current"
	width={props.size ?? 24}
	height={props.size ?? 24}
>
	{@html props.data.content}
</svg>
```

### 2. Render icons by importing from `phosphor-universal`

Now you can use your icons by importing them from phosphor-universal:

#### React

MyPage.tx

```tsx
import { Plus } from "phosphor-universal";
import { Icon } from "shared/components/Icon";

export function ExampleComponent() {
  return <Icon data={Plus} size={20} />;
}
```

#### Svelte

```svelte
<script lang="ts">
	import { Plus } from 'phosphor-universal';
	import Icon from 'shared/components/Icon.svelte';
</script>

<Icon data={Plus} size={20} />
```

To use phosphor variants, just append the variant name to the icon.

```svelte
<script lang="ts">
	import { GlobeDuotone } from 'phosphor-universal';
	import Icon from 'shared/components/Icon.svelte';
</script>

<Icon data={GlobeDuotone} size={20} />
```
