import { fillIn, render, triggerKeyEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  input: '[data-test-fileDetails-apiScan-searchInput]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <FileDetails::ApiScan::SearchInput
    data-test-fileDetails-apiScan-searchInput
    @onSearch={{this.onSearch}}
  />
`;

// ─── Test suite ────────────────────────────────────────────────────────────────
module(
  'Integration | Component | file-details/api-scan/search-input',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({
        searchedWith: null,
        searchCount: 0,
        onSearch: (query) => {
          this.set('searchedWith', query);
          this.set('searchCount', this.searchCount + 1);
        },
      });
    });

    test('it renders an empty input with the placeholder', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.input)
        .hasNoValue()
        .hasAttribute('placeholder', t('apiScanModule.searchEndpoints'));
    });

    test('it calls onSearch with the trimmed query after typing', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(this.searchedWith, null);

      await fillIn(selectors.input, '  /api/users  ');
      await triggerKeyEvent(selectors.input, 'keyup', 'S');

      assert.dom(selectors.input).hasValue('  /api/users  ');
      assert.strictEqual(this.searchedWith, '/api/users');
      assert.strictEqual(this.searchCount, 1);
    });

    test('it calls onSearch with an empty string when cleared', async function (assert) {
      await render(TEMPLATE);

      await fillIn(selectors.input, 'auth');
      await triggerKeyEvent(selectors.input, 'keyup', 'H');

      assert.strictEqual(this.searchedWith, 'auth');

      await fillIn(selectors.input, '');
      await triggerKeyEvent(selectors.input, 'keyup', 'Backspace');

      assert.strictEqual(this.searchedWith, '');
      assert.strictEqual(this.searchCount, 2);
    });
  }
);
