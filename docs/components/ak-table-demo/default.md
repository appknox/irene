---
order: 1
---

# Default (semi-bordered)

Uses the default **`variant`**: `semi-bordered` (only horizontal rules on body rows; see `index.hbs`).

```hbs template
<AkTable
  @dense={{false}}
  @headerColor='neutral'
  @borderColor='light'
  @hoverable={{false}}
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
  ];

  rows = [
    { name: 'Alice', role: 'Developer' },
    { name: 'Bob', role: 'Designer' },
    { name: 'Carol', role: 'Manager' },
  ];
}
```
