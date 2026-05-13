---
title: Text input
---
<example height='200'>

## A text input with an error
<example name='error' height='200'>

## Text area
<example name='textarea' height='300'>

## Nunjucks Macro parameters

| Name | Type | Description |
| :-- | :-- | :-- |
| `title` | string | Required. The title of the question. |
| `id` | string | Required. A unique identifier. |
| `hint` | string | A helpful hint to help the user answer the question. |
| `value` | string | A predefined value. |
| `error` | string | An error message. |
| `isTextarea` | bool | Render a textarea, rather than an input. |
| `inputmode` | string | Pass an [inputmode attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode). Doesn’t apply to a textarea. |
| `isHoneypot` | bool | Make this field a [honeypot](https://en.wikipedia.org/wiki/Honeypot_(computing)). |
