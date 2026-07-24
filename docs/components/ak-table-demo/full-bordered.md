---
order: 2
---

# Full bordered

Set **`@variant='full-bordered'`** for a grid: borders on every cell (matches the Storybook **FullBordered** story).

```hbs template
<AkTable
  @dense={{false}}
  @headerColor='neutral'
  @variant='full-bordered'
  @borderColor='light'
  as |t|
>
  <t.head @columns={{this.columns}} as |h|>
    <h.row as |r|>
      <r.cell as |column|>{{column.name}}</r.cell>
    </h.row>
  </t.head>
  <t.body @rows={{this.rows}} as |b|>
    <b.row as |r|>
      <r.cell as |value|>{{value}}</r.cell>
    </b.row>
  </t.body>
</AkTable>
```

```js component
import Component from '@glimmer/component';

export default class extends Component {
  columns = [
    { name: 'Name', valuePath: 'name' },
    { name: 'Role', valuePath: 'role' },
    { name: 'Office', valuePath: 'office' },
  ];

  rows = [
    { name: 'Alice', role: 'Developer', office: 'Berlin' },
    { name: 'Bob', role: 'Designer', office: 'Paris' },
    { name: 'Carol', role: 'Manager', office: 'London' },
  ];
}
```
