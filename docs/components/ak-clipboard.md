---
title: AkClipboard
order: 8
---

# AkClipboard

Copy text to clipboard. Wraps [Clipboard.js](https://clipboardjs.com/). Yields `triggerId` – the trigger element must have this id.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string | auto | ID for the trigger element |
| `options` | object | - | ClipboardJS options (e.g. target selector) |
| `onSuccess` | function | - | Callback on successful copy |
| `onError` | function | - | Callback on copy error |

## Examples

### Basic Copy

```hbs preview-template
<AkClipboard as |cb|>
  <AkButton data-clipboard-text="I am copied!" id={{cb.triggerId}}>
    Copy Me
  </AkButton>
</AkClipboard>
```

### Copy from Target Element

```hbs preview-template
<AkTextField id="copy-input" @value="I will be copied!" />

<AkClipboard as |cb|>
  <AkButton class="mt-2" data-clipboard-target="#copy-input" id={{cb.triggerId}}>
    Copy Input text
  </AkButton>
</AkClipboard>
```
