---
order: 2
---

# Compact

Same setup as **Basic**, with `@variant='compact'` so only the arrow icons show on prev/next (no long labels).

```hbs template
<div style='display: flex; flex-direction: column; margin-top: 8px; padding: 8px;'>
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
    <AkPagination
      @disableNext={{pgc.disableNext}}
      @nextAction={{pgc.nextAction}}
      @disablePrev={{pgc.disablePrev}}
      @prevAction={{pgc.prevAction}}
      @endItemIdx={{pgc.endItemIdx}}
      @startItemIdx={{pgc.startItemIdx}}
      @itemPerPageOptions={{pgc.itemPerPageOptions}}
      @onItemPerPageChange={{pgc.onItemPerPageChange}}
      @selectedOption={{pgc.selectedOption}}
      @perPageTranslation={{this.perPageTranslation}}
      @tableItemLabel={{this.tableItemLabel}}
      @totalItems={{pgc.totalItems}}
      @nextBtnLabel={{this.nextBtnLabel}}
      @prevBtnLabel={{this.prevBtnLabel}}
      @variant='compact'
      @paginationSelectOptionsVertPosition={{this.paginationSelectOptionsVertPosition}}
      {{style marginBottom='15px'}}
    />
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

  prevBtnLabel = 'Previous';

  nextBtnLabel = 'Next';

  tableItemLabel = 'Projects';

  perPageTranslation = 'Items Per Page';

  paginationSelectOptionsVertPosition = 'below';

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
