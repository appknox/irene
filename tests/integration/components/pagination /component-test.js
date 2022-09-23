/* eslint-disable qunit/no-commented-tests */
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | pagination', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  // hooks.beforeEach(async function () {
  //   this.project = this.server.create('project');
  //   this.amApp = this.server.create('app-monitoring/am-app', 1, {
  //     project: this.project,
  //   });
  // });

  test('it renders a passed block template', async function (assert) {
    await render(hbs`
      <Pagination>
        <div data-test-template>I am a template</div>
      </Pagination>
    `);

    assert.dom('[data-test-template]').exists();
    assert.dom('[data-test-template]').hasText('I am a template');

    // await render(hbs`
    //     <Pagination>
    //         <AppMonitoring::Table::Row @amApp={{this.amApp}} />
    //     </Pagination>
    // `);

    // assert.dom('[data-test-table-row]').exists();
  });

  // // This suite is tested with the post production table component
  // test('it renders an n-number of template based on an n-supplied list of data ', async function (assert) {
  //   this.set(
  //     'tableData',
  //     this.server.createList('app-monitoring/am-app', 5, {
  //       project: this.project,
  //     })
  //   );

  //   await render(hbs`
  //     <Pagination
  //       @results={{this.tableData}}
  //       as |context|
  //    >
  //       {{#each context.currentPage as |project|}}
  //         <AppMonitoring::Table::Row @amApp={{project}} />
  //       {{/each}}
  //    </Pagination>
  //   `);

  //   assert.dom('[data-test-table-row]').exists();

  //   assert.strictEqual(
  //     this.element.querySelectorAll('[data-test-table-row]').length,
  //     5,
  //     'Should show five (5) table rows'
  //   );

  //   this.set(
  //     'tableData',
  //     this.server.createList('app-monitoring/am-app', 10, {
  //       project: this.project,
  //     })
  //   );

  //   assert.strictEqual(
  //     this.element.querySelectorAll('[data-test-table-row]').length,
  //     10,
  //     'Should show ten (10) table rows'
  //   );
  // });

  // // This suite is tested with the post production table component
  // test('It renders the correct custom select options list', async function (assert) {
  //   assert.expect(9);
  //   this.set('customSelectOptions', [2, 4, 6, 8, 10, 12]);

  //   // Creates a mocked production scan data
  //   this.set(
  //     'tableData',
  //     this.server.createList('app-monitoring/am-app', 5, {
  //       project: this.project,
  //     })
  //   );

  //   await render(hbs`
  //       <Pagination
  //         @itemPerPageOptions={{this.customSelectOptions}}
  //         as |context|
  //      >
  //         {{#each context.currentPage as |project|}}
  //           <AppMonitoring::Table::Row @amApp={{project}} />
  //         {{/each}}
  //      </Pagination>
  //     `);

  //   assert.dom(`[data-test-pagination-select]`).exists();

  //   // The default values of select options are [5, 10, 20, 30, 40]
  //   const selectOptions = findAll(`[data-test-pagination-select-option]`);
  //   assert.strictEqual(
  //     selectOptions.length,
  //     6,
  //     'Should equal six (6) select options'
  //   );
  //   assert.true(
  //     selectOptions[0].selected,
  //     'Default selected option should be first item on list'
  //   );

  //   for (let idx = 0; idx < this.customSelectOptions.length; idx++) {
  //     let option = Number(selectOptions[idx].value);
  //     assert.strictEqual(
  //       option,
  //       this.customSelectOptions[idx],
  //       `cutom-option [${idx}] === select-option [${idx}] === ${option}`
  //     );
  //   }
  // });

  // // This suite is tested with the post production table component
  // test('The selected records per page initializes to first item on custom options list', async function (assert) {
  //   this.set('customSelectOptions', [2, 4, 6, 8, 10]);

  //   // Creates a mocked production scan data
  //   this.set(
  //     'tableData',
  //     this.server.createList('app-monitoring/am-app', 5, {
  //       project: this.project,
  //     })
  //   );

  //   await render(hbs`
  //       <Pagination
  //         @itemPerPageOptions={{this.customSelectOptions}}
  //         as |context|
  //      >
  //         {{#each context.currentPage as |project|}}
  //           <AppMonitoring::Table::Row @amApp={{project}} />
  //         {{/each}}
  //      </Pagination>
  //     `);

  //   assert.dom(`[data-test-pagination-select]`).exists();

  //   const selectOptions = findAll(`[data-test-pagination-select-option]`);
  //   assert.strictEqual(
  //     selectOptions.length,
  //     5,
  //     'Should equal five (5) select options'
  //   );

  //   for (let option of selectOptions) {
  //     if (option.selected) {
  //       this.set('selectedOptionValue', Number(option.value));
  //     }
  //   }

  //   assert.strictEqual(
  //     this.selectedOptionValue,
  //     this.customSelectOptions[0],
  //     `Default selected records per page should be ${this.customSelectOptions[0]}`
  //   );
  // });

  // // This suite is tested with the post production table component
  // test('The selected records per page initializes to the pagination "defaultLimit" prop if provided and valid', async function (assert) {
  //   this.set('customSelectOptions', [2, 4, 6, 8, 10]);
  //   this.set('defaultLimit', 4);

  //   // Creates a mocked production scan data
  //   this.set(
  //     'tableData',
  //     this.server.createList('app-monitoring/am-app', 5, {
  //       project: this.project,
  //     })
  //   );

  //   await render(hbs`
  //       <Pagination
  //         @defaultLimit={{this.defaultLimit}}
  //         @itemPerPageOptions={{this.customSelectOptions}}
  //         as |context|
  //      >
  //         {{#each context.currentPage as |project|}}
  //           <AppMonitoring::Table::Row @amApp={{project}} />
  //         {{/each}}
  //      </Pagination>
  //     `);

  //   assert.dom(`[data-test-pagination-select]`).exists();

  //   const selectOptions = findAll(`[data-test-pagination-select-option]`);
  //   assert.strictEqual(
  //     selectOptions.length,
  //     5,
  //     'Should equal five (5) select options'
  //   );

  //   for (let option of selectOptions) {
  //     if (option.selected) {
  //       this.set('selectedOptionValue', Number(option.value));
  //     }
  //   }

  //   assert.strictEqual(
  //     this.selectedOptionValue,
  //     this.defaultLimit,
  //     `Default selected records per page should be ${this.defaultLimit}`
  //   );
  // });

  // // This suite is tested with the post production table component
  // test('It renders the correct total items count', async function (assert) {
  //   this.set(
  //     'tableData',
  //     this.server.createList('app-monitoring/am-app', 5, {
  //       project: this.project,
  //     })
  //   );

  //   this.set('totalItems', this.tableData.length);

  //   await render(hbs`
  //       <Pagination
  //         @totalItems={{this.totalItems}}
  //         @results={{this.tableData}}
  //         as |context|
  //      >
  //         {{#each context.currentPage as |project|}}
  //           <AppMonitoring::Table::Row @amApp={{project}} />
  //         {{/each}}
  //      </Pagination>
  //     `);

  //   assert.dom(`[data-test-page-range]`).exists();
  //   assert.dom(`[data-test-page-range]`).containsText(`${this.totalItems}`);

  //   this.set('totalItems', this.tableData.length * 20);

  //   assert.dom(`[data-test-page-range]`).exists();
  //   assert.dom(`[data-test-page-range]`).containsText(`${this.totalItems}`);
  // });

  // // This suite is tested with the post production table component
  // test('It renders the correct pagination items label', async function (assert) {
  //   this.set(
  //     'tableData',
  //     this.server.createList('app-monitoring/am-app', 5, {
  //       project: this.project,
  //     })
  //   );

  //   this.set('label', 'Projects');

  //   await render(hbs`
  //       <Pagination
  //         @tableItemLabel={{this.label}}
  //         @totalItems={{this.tableData.length}}
  //         @results={{this.tableData}}
  //         as |context|
  //      >
  //         {{#each context.currentPage as |project|}}
  //           <AppMonitoring::Table::Row @amApp={{project}} />
  //         {{/each}}
  //      </Pagination>
  //     `);

  //   assert.dom(`[data-test-page-range]`).exists();
  //   assert.dom(`[data-test-page-range]`).containsText(`${this.label}`);
  // });

  // // This suite is tested with the post production table component
  // test('It triggers the page items count change callback whenever the no. of items per page changes', async function (assert) {
  //   this.set(
  //     'tableData',
  //     this.server.createList('app-monitoring/am-app', 5, {
  //       project: this.project,
  //     })
  //   );

  //   this.set('onPageItemsChange', (args) => {
  //     this.set('callBackTriggered', true);

  //     // If this block is executed the expected value is in the format {limit: STRING}
  //     this.set('callBackValue', args);
  //   });

  //   await render(hbs`
  //       <Pagination
  //         @results={{this.tableData}}
  //         @onPageItemsCountChange={{this.onPageItemsChange}}
  //         as |context|
  //      >
  //         {{#each context.currentPage as |project|}}
  //           <AppMonitoring::Table::Row @amApp={{project}} />
  //         {{/each}}
  //      </Pagination>
  //     `);

  //   assert.dom(`[data-test-pagination-select]`).exists();

  //   // These values should not exist until the 'onPageItemsChange' callback is called
  //   assert.notOk(this.callBackTriggered, 'callBackTriggered is undefined');
  //   assert.notOk(this.callBackTriggered, 'callBackValue is undefined');

  //   // The default values of select options are [5, 10, 20, 30, 40]
  //   const selectOptions = findAll(`[data-test-pagination-select-option]`);
  //   const newSelectValue = selectOptions[2].value;

  //   await fillIn(`[data-test-pagination-select]`, newSelectValue);

  //   // These values should exist if the callback was triggered by the select change
  //   assert.true(this.callBackTriggered, 'Callback was triggered');
  //   assert.ok(this.callBackValue, 'callBackValue is defined');

  //   // The value passed to the callback is in the format {limit: STRING}
  //   assert.propContains(
  //     this.callBackValue,
  //     {
  //       limit: Number(newSelectValue),
  //     },
  //     'callBackValue contains the right properties'
  //   );
  // });

  // // This suite is tested with the post production table component
  // test('It triggers the next action callback whenever the next button (if enabled) is clicked', async function (assert) {
  //   this.set(
  //     'tableData',
  //     this.server.createList('app-monitoring/am-app', 9, {
  //       project: this.project,
  //     })
  //   );

  //   this.set('totalItems', this.tableData.length);
  //   this.set('offset', 2);
  //   this.set('customSelectOptions', [2, 4, 6, 8, 10]);
  //   this.set('defaultLimit', 2);
  //   this.set('onNextButtonClicked', (args) => {
  //     this.set('callBackTriggered', true);

  //     // If this block is executed the expected args will be in the format:
  //     // {limit: NUMBER, offset: NUMBER}
  //     this.set('callBackValue', args);
  //   });

  //   // NOTE: The default pagination offset is equal to 1 if not provided
  //   await render(hbs`
  //       <Pagination
  //         @totalItems={{this.totalItems}}
  //         @results={{this.tableData}}
  //         @nextAction={{this.onNextButtonClicked}}
  //         @offset={{this.offset}}
  //         @defaultLimit={{this.defaultLimit}}
  //         @itemPerPageOptions={{this.customSelectOptions}}
  //         as |context|
  //      >
  //         {{#each context.currentPage as |project|}}
  //           <AppMonitoring::Table::Row @amApp={{project}} />
  //         {{/each}}
  //      </Pagination>
  //     `);

  //   assert.dom(`[data-test-pagination-next-btn]`).exists();

  //   // These values should not exist until the 'onNextButtonClicked' callback is called
  //   assert.notOk(this.callBackTriggered, 'callBackTriggered is undefined');
  //   assert.notOk(this.callBackTriggered, 'callBackValue is undefined');

  //   await click(`[data-test-pagination-next-btn]`);

  //   // These values should exist if the callback was triggered by the select change
  //   assert.true(this.callBackTriggered, 'Callback was triggered');
  //   assert.ok(this.callBackValue, 'callBackValue is defined');

  //   // The value passed to the callback is in the format {limit: NUMBER, offset: NUMBER}
  //   assert.propContains(
  //     this.callBackValue,
  //     {
  //       limit: 2,
  //       offset: 6,
  //     },
  //     'callBackValue contains the right properties'
  //   );

  //   await click(`[data-test-pagination-next-btn]`);

  //   // The value passed to the callback is in the format {limit: NUMBER, offset: NUMBER}
  //   assert.propContains(
  //     this.callBackValue,
  //     {
  //       limit: 2,
  //       offset: 8,
  //     },
  //     'callBackValue contains the right properties '
  //   );
  // });

  // // This suite is tested with the post production table component
  // test('It triggers the previous action callback whenever the previous button (if enabled) is clicked', async function (assert) {
  //   this.set(
  //     'tableData',
  //     this.server.createList('app-monitoring/am-app', 21, {
  //       project: this.project,
  //     })
  //   );
  //   this.set('totalItems', this.tableData.length);
  //   this.set('offset', 3);
  //   this.set('customSelectOptions', [5, 10, 15, 20, 25, 30]);
  //   this.set('defaultLimit', 5);
  //   this.set('onPrevButtonClicked', (args) => {
  //     this.set('callBackTriggered', true);

  //     // If this block is executed the expected args will be in the format:
  //     // {limit: NUMBER, offset: NUMBER}
  //     this.set('callBackValue', args);
  //   });

  //   // NOTE: The default pagination offset is equal to 1 if not provided
  //   await render(hbs`
  //         <Pagination
  //           @totalItems={{this.totalItems}}
  //           @results={{this.tableData}}
  //           @prevAction={{this.onPrevButtonClicked}}
  //           @offset={{this.offset}}
  //           @defaultLimit={{this.defaultLimit}}
  //           @itemPerPageOptions={{this.customSelectOptions}}
  //           as |context|
  //        >
  //           {{#each context.currentPage as |project|}}
  //             <AppMonitoring::Table::Row @amApp={{project}} />
  //           {{/each}}
  //        </Pagination>
  //       `);

  //   assert.dom(`[data-test-pagination-prev-btn]`).exists();

  //   // These values should not exist until the 'onPrevButtonClicked' callback is called
  //   assert.notOk(this.callBackTriggered, 'callBackTriggered is undefined');
  //   assert.notOk(this.callBackTriggered, 'callBackValue is undefined');

  //   await click(`[data-test-pagination-prev-btn]`);

  //   // These values should exist if the callback was triggered by the select change
  //   assert.true(this.callBackTriggered, 'Callback was triggered');
  //   assert.ok(this.callBackValue, 'callBackValue is defined');

  //   // The value passed to the callback is in the format {limit: NUMBER, offset: NUMBER}
  //   assert.propContains(
  //     this.callBackValue,
  //     {
  //       limit: 5,
  //       offset: 10,
  //     },
  //     'callBackValue contains the right properties'
  //   );

  //   await click(`[data-test-pagination-prev-btn]`);

  //   // The value passed to the callback is in the format {limit: NUMBER, offset: NUMBER}
  //   assert.propContains(
  //     this.callBackValue,
  //     {
  //       limit: 5,
  //       offset: 5,
  //     },
  //     'callBackValue contains the right properties '
  //   );
  // });

  // // This suite is tested with the post production table component
  // test('It should disable next button when the last page is reached', async function (assert) {
  //   this.set(
  //     'tableData',
  //     this.server.createList('app-monitoring/am-app', 15, {
  //       project: this.project,
  //     })
  //   );

  //   this.set('totalItems', this.tableData.length);
  //   this.set('customSelectOptions', [2, 4, 6, 8, 10]);
  //   this.set('defaultLimit', 4);
  //   this.set('offset', 2);
  //   this.set('onNextButtonClicked', (args) => {
  //     this.set('callBackTriggered', true);

  //     // If this block is executed the expected args will be in the format:
  //     // {limit: NUMBER, offset: NUMBER}
  //     this.set('callBackValue', args);
  //   });

  //   // NOTE: The default pagination offset is equal to 1 if not provided
  //   await render(hbs`
  //       <Pagination
  //         @totalItems={{this.totalItems}}
  //         @results={{this.tableData}}
  //         @defaultLimit={{this.defaultLimit}}
  //         @itemPerPageOptions={{this.customSelectOptions}}
  //         @nextAction={{this.onNextButtonClicked}}
  //         @offset={{this.offset}}
  //         as |context|
  //      >
  //         {{#each context.currentPage as |project|}}
  //           <AppMonitoring::Table::Row @amApp={{project}} />
  //         {{/each}}
  //      </Pagination>
  //     `);

  //   assert.dom(`[data-test-pagination-next-btn]`).exists();
  //   assert
  //     .dom(`[data-test-pagination-next-btn]`)
  //     .hasProperty('disabled', false);

  //   await click(`[data-test-pagination-next-btn]`); // offset = 8

  //   assert.dom(`[data-test-pagination-next-btn]`).hasProperty('disabled', true);
  // });

  // // This suite is tested with the post production table component
  // test('It should disable previous button when the first page is reached', async function (assert) {
  //   this.set(
  //     'tableData',
  //     this.server.createList('app-monitoring/am-app', 15, {
  //       project: this.project,
  //     })
  //   );

  //   this.set('totalItems', this.tableData.length);
  //   this.set('customSelectOptions', [2, 4, 6, 8, 10]);
  //   this.set('defaultLimit', 4);
  //   this.set('offset', 13);
  //   this.set('onPrevButtonClicked', (args) => {
  //     this.set('callBackTriggered', true);

  //     // If this block is executed the expected args will be in the format:
  //     // {limit: NUMBER, offset: NUMBER}

  //     const { offset } = args;
  //     this.set('callBackValue', args);
  //     this.set('offset', offset);
  //   });

  //   // NOTE: The default pagination offset is equal to 1 if not provided
  //   await render(hbs`
  //       <Pagination
  //         @totalItems={{this.totalItems}}
  //         @results={{this.tableData}}
  //         @defaultLimit={{this.defaultLimit}}
  //         @itemPerPageOptions={{this.customSelectOptions}}
  //         @offset={{this.offset}}
  //         @prevAction={{this.onPrevButtonClicked}}
  //         as |context|
  //      >
  //         {{#each context.currentPage as |project|}}
  //           <AppMonitoring::Table::Row @amApp={{project}} />
  //         {{/each}}
  //      </Pagination>
  //     `);

  //   assert.dom(`[data-test-pagination-prev-btn]`).exists();
  //   assert
  //     .dom(`[data-test-pagination-prev-btn]`)
  //     .hasProperty('disabled', false);

  //   await click(`[data-test-pagination-prev-btn]`); // offset = 12
  //   await click(`[data-test-pagination-prev-btn]`); // offset = 8
  //   await click(`[data-test-pagination-prev-btn]`); // offset = 4
  //   await click(`[data-test-pagination-prev-btn]`); // offset = 0

  //   assert.strictEqual(this.offset, 0, 'Page offset has a value of 4');
  //   assert.dom(`[data-test-pagination-prev-btn]`).hasProperty('disabled', true);
  // });
});
