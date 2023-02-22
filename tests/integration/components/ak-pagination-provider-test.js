import { click, findAll, render, select } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import faker from 'faker';
import { module, test } from 'qunit';
import { selectChoose } from 'ember-power-select/test-support';
import styles from 'irene/components/ak-pagination/index.scss';

module('Integration | Component | ak-pagination-provider', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a template block', async function (assert) {
    // Template block usage:
    await render(hbs`
      <AkPaginationProvider>
        <span data-test-pagination-block-text>Template block text</span>
      </AkPaginationProvider>
    `);

    assert
      .dom('[data-test-pagination-block-text]')
      .exists()
      .containsText('Template block text');
  });

  test('it returns the current page results in context', async function (assert) {
    assert.expect(3);

    this.setProperties({ tableData: ['data 1', 'data 2'] });

    await render(hbs`
      <AkPaginationProvider
        @results={{this.tableData}}
        as |context|
      >
        {{#each context.currentPageResults as |record|}}
          <span data-test-record-container>{{record}}</span>
        {{/each}}
      </AkPaginationProvider>
    `);

    assert.dom('[data-test-record-container]').exists({ count: 2 });
    const currentPageRecordElements = this.element.querySelectorAll(
      '[data-test-record-container]'
    );

    for (let i = 0; i < currentPageRecordElements.length; i++) {
      const recordElement = currentPageRecordElements[i];
      const tableDataRecord = this.tableData[i];
      assert.dom(recordElement).hasText(tableDataRecord);
    }
  });

  test('it returns page item count options and page count change handler in context', async function (assert) {
    assert.expect(6);

    this.setProperties({
      tableData: ['data 1', 'data 2'],
      itemPerPageOptions: [10, 50, 100],
      onItemPerPageChange: function (params) {
        assert.ok(params, 'onItemPerPageChange was triggered!');
      },
    });

    await render(hbs`
      <AkPaginationProvider
        @onItemPerPageChange={{this.onItemPerPageChange}}
        @itemPerPageOptions={{this.itemPerPageOptions}}
        as |context|
      >
        <select
          name='recordPerPage'
          id='recordPerPage'
          {{on 'change' context.onItemPerPageChange}}
          data-test-pagination-select
        >
          {{#each context.itemPerPageOptions as |item|}}
            <option
              selected={{item.selected}}
              value={{item.value}}
              data-test-pagination-select-option
            >
              {{item.value}}
            </option>
          {{/each}}
       </select>
      </AkPaginationProvider>
     `);

    assert.dom('[data-test-pagination-select]').exists();
    const selectOptionsList = this.element.querySelectorAll(
      '[data-test-pagination-select-option]'
    );

    assert.strictEqual(
      selectOptionsList.length,
      3,
      'Pagination context returns the right page count select options'
    );

    for (let i = 0; i < selectOptionsList.length; i++) {
      const optionElement = selectOptionsList[i];
      const itemPerPageOption = this.itemPerPageOptions[i];

      assert.strictEqual(
        Number(optionElement.value),
        itemPerPageOption,
        `data-test-pagination-select-option="${i}" has a value of ${itemPerPageOption}`
      );
    }

    await select('[data-test-pagination-select]', '50');
  });

  test('it sends the right arguments to the onItemPerPageChange callback when triggered', async function (assert) {
    this.setProperties({
      tableData: ['data 1', 'data 2'],
      itemPerPageOptions: [10, 50, 100],
      limit: 10,
      offset: 0,
      onItemPerPageChange: (params) => {
        this.limit = params.limit;
        this.offset = params.offset;
      },
      selectTriggerClass: styles['ak-pagination-select'],
    });

    await render(hbs`
      <AkPaginationProvider
        @onItemPerPageChange={{this.onItemPerPageChange}}
        @itemPerPageOptions={{this.itemPerPageOptions}}
        as |ctx|
      >
        <AkSelect
          @onChange={{ctx.onItemPerPageChange}}
          @options={{ctx.itemPerPageOptions}}
          @selected={{ctx.selectedOption}}
          @renderInPlace={{true}}
          @verticalPosition='above'
          @triggerClass={{this.selectTriggerClass}}
          data-test-pagination-select
          as |aks|
        >
          {{aks.label}}
        </AkSelect>
      </AkPaginationProvider>
     `);

    assert.dom('[data-test-pagination-select]').exists();
    await click(`.${this.selectTriggerClass}`);

    let selectListItems = findAll('.ember-power-select-option');
    const selectedIndex = 0;
    assert.dom(selectListItems[selectedIndex]).hasAria('selected', 'true');
    const nextSelectIndex = 1;
    assert.dom(selectListItems[nextSelectIndex]).hasAria('selected', 'false');

    await selectChoose(
      `.${this.selectTriggerClass}`,
      String(this.itemPerPageOptions[nextSelectIndex])
    );

    await click(`.${this.selectTriggerClass}`);
    selectListItems = findAll('.ember-power-select-option');
    assert.dom(selectListItems[nextSelectIndex]).hasAria('selected', 'true');

    assert.strictEqual(
      this.limit,
      this.itemPerPageOptions[nextSelectIndex],
      `Default limit was changed to ${this.itemPerPageOptions[nextSelectIndex]}.`
    );
  });

  test('it triggers next and previous page actions ', async function (assert) {
    assert.expect(4);

    this.setProperties({
      tableData: Array.from({ length: 14 }, faker.lorem.slug),
      totalCount: 20,
      itemPerPageOptions: [2, 4, 8],
      limit: 2,
      offset: 0,
      nextAction: (params) => {
        this.limit = params.limit;
        this.offset = params.offset;
        assert.ok(true, 'Next action was triggered');
      },
      prevAction: (params) => {
        this.limit = params.limit;
        this.offset = params.offset;
        assert.ok(true, 'Previous action was triggered');
      },
      onItemPerPageChange: (params) => {
        this.limit = params.limit;
        this.offset = params.offset;
      },
    });

    await render(hbs`
      <AkPaginationProvider
        @defaultLimit={{this.limit}}
        @offset={{this.offset}}
        @onItemPerPageChange={{this.onItemPerPageChange}}
        @itemPerPageOptions={{this.itemPerPageOptions}}
        @totalItems={{this.totalCount}}
        @nextAction={{this.nextAction}}
        @prevAction={{this.prevAction}}
        as |context|
      >
        <button
          data-test-previous-button type="button" {{on "click" context.nextAction}}
        >
          Prev
        </button>
        <button
          data-test-next-button type="button" {{on "click" context.prevAction}}
        >
          Next
        </button>
      </AkPaginationProvider>
     `);

    assert.dom('[data-test-previous-button]').exists();
    assert.dom('[data-test-next-button]').exists();

    await click('[data-test-next-button]');
    await click('[data-test-previous-button]');
  });

  test('the "disableNext" prop is true when offset is reaches total data count ', async function (assert) {
    assert.expect(3);

    this.setProperties({
      tableData: Array.from({ length: 10 }, faker.lorem.slug),
      limit: 5,
      offset: 10,
      totalCount: 20,
      itemPerPageOptions: [5, 10, 15],
      nextAction: (params) => {
        this.limit = params.limit;
        this.offset = params.offset;
        assert.ok(true, 'Next action was triggered');
      },
    });

    await render(hbs`
      <AkPaginationProvider
        @defaultLimit={{this.limit}}
        @offset={{this.offset}}
        @totalItems={{this.totalCount}}
        @nextAction={{this.nextAction}}
        as |context|
      >
        <button
          type="button"
          disabled={{context.disableNext}}
          {{on "click" context.nextAction}}
          data-test-next-button
        >
          Next
        </button>
      </AkPaginationProvider>
     `);

    assert.dom('[data-test-next-button]').exists();

    // sets OFFSET to 15
    await click('[data-test-next-button]');
    await render(hbs`
    <AkPaginationProvider
      @defaultLimit={{this.limit}}
      @offset={{this.offset}}
      @totalItems={{this.totalCount}}
      @nextAction={{this.nextAction}}
      as |context|
    >
      <button
        type="button"
        disabled={{context.disableNext}}
        {{on "click" context.nextAction}}
        data-test-next-button
      >
        Next
      </button>
    </AkPaginationProvider>
   `);

    assert.dom('[data-test-next-button]').isDisabled();
  });

  test('the "disablePrev" prop is true when offset reaches 0', async function (assert) {
    assert.expect(3);

    this.setProperties({
      tableData: Array.from({ length: 10 }, faker.lorem.slug),
      limit: 5,
      offset: 5,
      totalCount: 20,
      itemPerPageOptions: [5, 10, 15],

      prevAction: (params) => {
        this.limit = params.limit;
        this.offset = params.offset;
        assert.ok(true, 'Previous action was triggered');
      },
    });

    await render(hbs`
      <AkPaginationProvider
        @defaultLimit={{this.limit}}
        @offset={{this.offset}}
        @totalItems={{this.totalCount}}
        @prevAction={{this.prevAction}}
        as |context|
      >
        <button
          type="button"
          disabled={{context.disablePrev}}
          {{on "click" context.prevAction}}
          data-test-previous-button
        >
          Prev
        </button>
      </AkPaginationProvider>
     `);

    assert.dom('[data-test-previous-button]').exists();

    // sets OFFSET to 0
    await click('[data-test-previous-button]');
    await render(hbs`
    <AkPaginationProvider
      @defaultLimit={{this.limit}}
      @offset={{this.offset}}
      @totalItems={{this.totalCount}}
      @prevAction={{this.prevAction}}
      as |context|
    >
      <button
        type="button"
        disabled={{context.disablePrev}}
        {{on "click" context.nextAction}}
        data-test-previous-button
      >
        Prev
      </button>
    </AkPaginationProvider>
   `);

    assert.dom('[data-test-previous-button]').isDisabled();
  });
});
