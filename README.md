# w9x

<!-- prettier-ignore -->
> [!WARNING]
> I am releasing this in an unfinished state because I do not want to be seen as a gatekeeper.
> I do not have the consistent motivation to be able to work on this because roadblocks tend to kill my motivation with anything.
> PRs are welcome if you wish to contribute.

<!-- prettier-ignore -->
> [!CAUTION]
> **This theme will not work properly on the Discord desktop client yet!** This theme heavily relies on [CSS nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting), which Discord's Electron version (22, Chromium 108) does not support.
> Electron 28 (Chromium 120) is currently being tested on the development client branch, so it won't be too long until it works.
> [Vesktop](https://github.com/Vencord/Vesktop) users do not have to worry.
>
> **Older browsers may also not work**, so you should check [Can I use](https://caniuse.com/css-nesting) to see if your browser version supports nesting.

A customizable (via UserStyles) Discord theme based on the style of Windows Classic theme.

TODO: Setup CI to automatically build the userstyle and host it on pages

## Manually Building

```bash
node build.mjs
```

## But what if I don't want to use the userstyle? (or my chosen mod doesn't support it)

Copy raw links from the `src` folder and use `@import url("<raw link>")`.

`light_scheme`, `dark_scheme`, and `font` are required.
Any other choice option in a folder is up to you.

<!-- prettier-ignore -->
> [!NOTE]
> `raw.githubusercontent.com` does **not** send a `Content-Type` header and might not be recognized as a stylesheet.
> Vencord fixes this, but other mods might not.
>
> You can use a service like [raw.githack.com](https://raw.githack.com/) to work around this.
> (use the "Use this URL in production" box)
