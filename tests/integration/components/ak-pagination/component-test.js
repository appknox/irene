import { click, render, select } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | ak-pagination', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.setProperties({
      totalItems: 20,
      disablePrev: false,
      disableNext: false,
      startItemIdx: 1,
      endItemIdx: 2,
      itemPerPageOptions: [
        { value: '2', selected: true },
        { value: '4', selected: false },
        { value: '6', selected: false },
      ],
      limit: 2,
      offset: 0,
      tableItemLabel: 'Projects',
      perPageTranslation: 'Records Per Page',
    });
  });

  test('it renders with correct pagination context', async function (assert) {
    assert.expect(19);

    this.setProperties({
      onItemPerPageChange: () => {},
      nextAction: () => {},
      prevAction: () => {},
    });

    await render(hbs`
       <AkPagination 
          @disableNext={{this.disableNext}}
          @nextAction={{this.nextAction}}
          @disablePrev={{this.disablePrev}}
          @prevAction={{this.prevAction}}
          @endItemIdx={{this.endItemIdx}}
          @startItemIdx={{this.startItemIdx}}
          @itemPerPageOptions={{this.itemPerPageOptions}}
          @onItemPerPageChange={{this.onItemPerPageChange}}
          @perPageTranslation={{this.perPageTranslation}}
          @tableItemLabel={{this.tableItemLabel}}
          @totalItems={{this.totalItems}}
       />
    `);

    assert
      .dom('[data-test-per-page-translation]')
      .exists()
      .containsText(this.perPageTranslation);
    assert
      .dom('[data-test-page-range]')
      .exists()
      .containsText(
        this.totalItems,
        'page range has the correct total items count'
      )
      .containsText(
        this.startItemIdx,
        'page range has the correct start item index'
      )
      .containsText(
        this.endItemIdx,
        'page range has the correct end item index'
      )
      .containsText(
        this.tableItemLabel,
        'page range has the correct item label'
      );

    assert.dom('[data-test-pagination-btns-container]').exists();
    assert
      .dom('[data-test-pagination-prev-btn]')
      .exists()
      .containsText('t:previous:()');
    assert.dom('[data-test-prev-btn-icon]').exists();

    assert
      .dom('[data-test-pagination-next-btn]')
      .exists()
      .containsText('t:next:()');
    assert.dom('[data-test-next-btn-icon]').exists();

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
      const itemPerPageOption = this.itemPerPageOptions[i].value;

      assert.strictEqual(
        optionElement.value,
        itemPerPageOption,
        `data-test-pagination-select-option="${i}" has a value of ${itemPerPageOption}`
      );
    }
  });

  test('it triggers the next and previous actions when the next and previous buttons are clicked', async function (assert) {
    assert.expect(6);

    this.setProperties({
      onItemPerPageChange: () => {},
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
    });

    await render(hbs`
       <AkPagination 
          @disableNext={{this.disableNext}}
          @nextAction={{this.nextAction}}
          @disablePrev={{this.disablePrev}}
          @prevAction={{this.prevAction}}
          @endItemIdx={{this.endItemIdx}}
          @startItemIdx={{this.startItemIdx}}
          @itemPerPageOptions={{this.itemPerPageOptions}}
          @onItemPerPageChange={{this.onItemPerPageChange}}
          @perPageTranslation={{this.perPageTranslation}}
          @tableItemLabel={{this.tableItemLabel}}
          @totalItems={{this.totalItems}}
       />
    `);

    assert
      .dom('[data-test-pagination-prev-btn]')
      .exists()
      .containsText('t:previous:()');

    assert
      .dom('[data-test-pagination-next-btn]')
      .exists()
      .containsText('t:next:()');

    await click('[data-test-pagination-next-btn]');
    await click('[data-test-pagination-prev-btn]');
  });

  test('it triggers the page count change handler when triggered', async function (assert) {
    assert.expect(3);

    this.setProperties({
      onItemPerPageChange: () => {
        assert.ok(true, 'Page count change handler was triggered');
      },
      nextAction: () => {},
      prevAction: () => {},
    });

    await render(hbs`
       <AkPagination 
          @disableNext={{this.disableNext}}
          @nextAction={{this.nextAction}}
          @disablePrev={{this.disablePrev}}
          @prevAction={{this.prevAction}}
          @endItemIdx={{this.endItemIdx}}
          @startItemIdx={{this.startItemIdx}}
          @itemPerPageOptions={{this.itemPerPageOptions}}
          @onItemPerPageChange={{this.onItemPerPageChange}}
          @perPageTranslation={{this.perPageTranslation}}
          @tableItemLabel={{this.tableItemLabel}}
          @totalItems={{this.totalItems}}
       />
    `);

    /**
     * Select options
      itemPerPageOptions: [
        { value: 2, selected: true },
        { value: 4, selected: false },
        { value: 6, selected: false },
      ]
     */
    assert.dom('[data-test-pagination-select]').exists();
    // Select item 2
    await select(
      '[data-test-pagination-select]',
      this.itemPerPageOptions[1].value
    );

    // Select item 3
    await select(
      '[data-test-pagination-select]',
      this.itemPerPageOptions[2].value
    );
  });
});
