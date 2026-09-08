---
name: add-notifications
description: Add a new in-app notification type to the notifications page. Creates the context class, shell component, template, registers it in the notification map, and adds translation keys to en.json and ja.json.
---

# Add Notification

Adds a new notification message component and wires it into the notification system.

## Files involved

- `app/components/notifications-page/messages/<nf-key>/context.ts` — typed context class
- `app/components/notifications-page/messages/<nf-key>/index.ts` — Glimmer shell component
- `app/components/notifications-page/messages/<nf-key>/index.hbs` — notification template
- `app/components/notifications-page/notification_map.ts` — registration
- `translations/en.json` + `translations/ja.json` — message strings

## Step 1 — Identify the notification key and context

The notification key is a SCREAMING_SNAKE_CASE string like `NF_OVRREQ_APPROVED_REQSTR`.
The folder name uses the lowercase-kebab-case equivalent: `nf-ovrreq-approved-reqstr`.

Gather from the Postman collection or backend spec:
- The exact `message_code` string the backend sends
- All context fields the backend includes in the notification payload

## Step 2 — Create `context.ts`

Explicitly assign each field from `input_json` — never use spread or `Object.assign`:

```ts
export class Nf<PascalKey>Context {
  field_one: string;
  field_two: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.field_one = input_json.field_one;
    this.field_two = input_json.field_two;
  }
}
```

## Step 3 — Create `index.ts`

Shell component — no logic needed:

```ts
import Component from '@glimmer/component';
import { type Nf<PascalKey>Context } from './context';

export interface NotificationsPageMessagesNf<PascalKey>ComponentArgs {
  Args: {
    context: Nf<PascalKey>Context;
  };
}

export default class NotificationsPageMessagesNf<PascalKey>Component extends Component<NotificationsPageMessagesNf<PascalKey>ComponentArgs> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'notifications-page/messages/nf-<kebab-key>': typeof NotificationsPageMessagesNf<PascalKey>Component;
  }
}
```

## Step 4 — Create `index.hbs`

Wrap everything in `<AkStack @direction='column' @spacing='1'>`.

### Primary message (simple — translation only)

```hbs
<span data-test-nf-<kebab-key>-primary-message>
  {{t 'notificationModule.messages.nf-<kebab-key>' htmlSafe=true param=@context.param}}
</span>
```

### Primary message with a link

```hbs
<AkStack @direction='column' @spacing='1'>
  <span data-test-nf-<kebab-key>-primary-message>
    {{t 'notificationModule.messages.nf-<kebab-key>' htmlSafe=true reviewer_username=@context.reviewer_username}}
  </span>

  <div data-test-nf-<kebab-key>-link>
    <AkLink
      @color='primary'
      @route='authenticated.dashboard.file.analysis'
      @models={{array @context.file_id @context.analysis_id}}
      @underline='always'
      @title={{t 'viewVulnerabilityDetails'}}
    >
      {{t 'viewVulnerabilityDetails'}}
    </AkLink>
  </div>
</AkStack>
```

For a single-model route (file): `@model={{@context.file_id}}`.
For multi-model routes (file + analysis): `@models={{array @context.file_id @context.analysis_id}}`.

### With a detail section (e.g. rejection reason)

```hbs
<AkStack @direction='column' @spacing='0.5'>
  <AkTypography data-test-nf-<kebab-key>-<section>-label @variant='body2' @fontWeight='medium'>
    {{t 'sectionLabelKey'}}:
  </AkTypography>
  <AkTypography data-test-nf-<kebab-key>-<section> @variant='body2'>
    {{@context.field}}
  </AkTypography>
</AkStack>
```

## Step 5 — Register in `notification_map.ts`

Add the import at the top of the file alongside the other context imports:

```ts
import { Nf<PascalKey>Context } from './messages/nf-<kebab-key>/context';
```

Add the entry to `NotificationMap` before the closing `} satisfies ...`:

```ts
NF_<SCREAMING_KEY>: {
  component: 'notifications-page/messages/nf-<kebab-key>' as const,
  context: Nf<PascalKey>Context,
},
```

## Step 6 — Add translations

### `translations/en.json`

Add the notification message under `notificationModule.messages`:

```json
"nf-<kebab-key>": "<strong>{param}</strong> message text here."
```

Add any standalone keys (e.g. link labels) near alphabetically similar keys at the root.

### `translations/ja.json`

Mirror every key added to `en.json` with an accurate Japanese translation. Never add to one file without the other.

## Step 7 — Verify

```bash
jq -e . translations/en.json > /dev/null && jq -e . translations/ja.json > /dev/null && echo json-ok
npx ember-template-lint app/components/notifications-page/messages/nf-<kebab-key>/index.hbs
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "nf-<kebab-key>"
```
