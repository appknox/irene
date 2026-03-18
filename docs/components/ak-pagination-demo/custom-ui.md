---
order: 3
---

# Custom UI (provider only)

**`AkPaginationProvider`** only—you build your own toolbar with `AkSelect`, buttons, and copy. Uses the same `pgc` hash as the default `AkPagination` wiring.

```hbs template
<div style='display: flex; flex-direction: column; margin-top: 8px;'>
  <AkPaginationProvider
    @results={{this.tableData}}
    @onItemPerPageChange={{this.onItemPerPageChange}}
    @totalItems={{this.totalCount}}
    @nextAction={{this.nextAction}}
    @prevAction={{this.prevAction}}
    @itemPerPageOptions={{this.itemPerPageOptions}}
    @defaultLimit={{this.limit}}
    @offset={{this.offset}}
    as |pgc|
  >
    <div
      style='display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; max-width: 640px;'
    >
      <AkSelect
        @onChange={{pgc.onItemPerPageChange}}
        @options={{pgc.itemPerPageOptions}}
        @selected={{pgc.selectedOption}}
        @renderInPlace={{true}}
        @verticalPosition='below'
        {{style width='50px'}}
        as |aks|
      >
        {{aks.label}}
      </AkSelect>
      <span style='display: flex; align-items: center;'>{{this.perPageTranslation}}</span>
      <div style='display: flex; flex-direction: row; gap: 8px;'>
        <button
          type='button'
          disabled={{pgc.disablePrev}}
          {{on 'click' pgc.prevAction}}
        >
          Previous
        </button>
        <button
          type='button'
          disabled={{pgc.disableNext}}
          {{on 'click' pgc.nextAction}}
        >
          Next
        </button>
      </div>
      <span style='display: flex; align-items: center;'>
        {{pgc.startItemIdx}}
        -
        {{pgc.endItemIdx}}
        of
        {{pgc.totalItems}}
        Items
      </span>
    </div>

    {{#each pgc.currentPageResults as |item idx|}}
      <span style='display: flex; flex-direction: column;'>{{add idx pgc.startItemIdx}} - {{item}}</span>
    {{/each}}
  </AkPaginationProvider>
</div>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  totalCount = 50;

  allItems = Array.from({ length: 50 }, (_, i) => `Row ${i + 1}`);

  itemPerPageOptions = [5, 10, 15];

  @tracked limit = 5;

  @tracked offset = 0;

  perPageTranslation = 'Items Per Page';

  get tableData() {
    return this.allItems.slice(this.offset, this.offset + this.limit);
  }

  @action
  onItemPerPageChange(args) {
    this.limit = args.limit;
    this.offset = args.offset;
  }

  @action
  nextAction(args) {
    this.limit = args.limit;
    this.offset = args.offset;
  }

  @action
  prevAction(args) {
    this.limit = args.limit;
    this.offset = args.offset;
  }
}
```
