import { click, render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { selectChoose } from 'ember-power-select/test-support';
import styles from 'irene/components/ak-pagination/index.scss';

const selectOptions = [
  { value: 2, selected: true, label: 2 },
  { value: 4, selected: false, label: 4 },
  { value: 6, selected: false, label: 6 },
];

module('Integration | Component | ak-pagination', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.setProperties({
      totalItems: 20,
      disablePrev: false,
      disableNext: false,
      startItemIdx: 1,
      endItemIdx: 2,
      itemPerPageOptions: selectOptions,
      selectedOption: selectOptions[0],
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
      selectTriggerClass: styles['ak-pagination-select'],
    });

    await render(hbs`
       <AkPagination 
          @disableNext={{this.disableNext}}
          @nextAction={{this.nextAction}}
          @disablePrev={{this.disablePrev}}
          @selectedOption={{this.selectedOption}}
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
      .containsText(t('previous'));
    assert.dom('[data-test-prev-btn-icon]').exists();

    assert
      .dom('[data-test-pagination-next-btn]')
      .exists()
      .containsText(t('next'));
    assert.dom('[data-test-next-btn-icon]').exists();
    assert.dom('[data-test-pagination-select]').exists();

    await click(`.${this.selectTriggerClass}`);

    const selectListItems = findAll('.ember-power-select-option');
    assert.strictEqual(
      selectListItems.length,
      3,
      'Pagination context returns the right page count select options'
    );

    for (let i = 0; i < selectListItems.length; i++) {
      const optionElement = selectListItems[i];
      const itemPerPageOption = this.itemPerPageOptions[i].value;

      assert.strictEqual(
        optionElement.textContent?.trim(),
        String(itemPerPageOption),
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
      .containsText(t('previous'));

    assert
      .dom('[data-test-pagination-next-btn]')
      .exists()
      .containsText(t('next'));

    await click('[data-test-pagination-next-btn]');
    await click('[data-test-pagination-prev-btn]');
  });

  test('it triggers the page count change handler when select item changes', async function (assert) {
    assert.expect(2);

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
    const selectedOption = 1;

    // Select item 2
    await selectChoose(
      '[data-test-pagination-select]',
      this.itemPerPageOptions[selectedOption].value
    );
  });
  test('it hides button labels in compact variant', async function (assert) {
    this.setProperties({
      onItemPerPageChange: () => {},
      nextAction: () => {},
      prevAction: () => {},
      prevBtnLabel: 'Previous button label',
      nextBtnLabel: 'Next button label',
    });

    // When no labels for the next and previous buttons were provided
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
          @variant="compact"
       />
    `);

    assert
      .dom('[data-test-pagination-prev-btn]')
      .exists()
      .doesNotContainText(t('previous'));
    assert
      .dom('[data-test-pagination-next-btn]')
      .exists()
      .doesNotContainText(t('next'));

    // When labels for the next and previous buttons were provided
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
         @variant="compact"
         @prevBtnLabel={{this.prevBtnLabel}}
         @nextBtnLabel={{this.nextBtnLabel}}
      />
   `);

    assert
      .dom('[data-test-pagination-prev-btn]')
      .exists()
      .doesNotContainText(this.prevBtnLabel);

    assert
      .dom('[data-test-pagination-next-btn]')
      .exists()
      .doesNotContainText(this.nextBtnLabel);
  });
});
