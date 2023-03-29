import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import dayjs from 'dayjs';

module(
  'Integration | Component | app-monitoring/history-table',

  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.store = this.owner.lookup('service:store');

      this.amAppSyncs = [];

      const amAppSync = this.store.createRecord('am-app-sync', {
        id: 1,
        syncedOn: '2023-02-23T12:30:30.126797Z',
      });

      this.amAppSyncs.push(amAppSync);
    });

    test('it renders empty state when app sync records are empty', async function (assert) {
      this.amAppSyncs = [];

      await render(
        hbs`<AppMonitoring::HistoryTable @amAppSyncs={{this.amAppSyncs}} />`
      );

      assert.dom('[data-test-history-table-empty]').exists();

      // TODO: Add proper tests for empty content when empty messages have been updated
      assert
        .dom('[data-test-history-table-empty] [data-test-am-empty-header-text]')
        .hasText('t:notFound:()');

      assert
        .dom('[data-test-history-table-empty] [data-test-am-empty-body-text]')
        .hasText(
          'Lorem ipsum dolor sit amet consectetur. Maecenas quis morbi libero lacus. Cras sapien cursus bibendum.'
        );
    });

    test('it renders details table when atleast one amApp sync record exists', async function (assert) {
      await render(
        hbs`<AppMonitoring::HistoryTable @amAppSyncs={{this.amAppSyncs}} />`
      );

      assert.dom('[data-test-history-table]').exists();

      const syncRowElements = this.element.querySelectorAll(
        '[data-test-history-table-row]'
      );

      assert.strictEqual(
        syncRowElements.length,
        this.amAppSyncs.length,
        'renders the correct number of app syncs'
      );

      // Checks for sync row cells
      assert
        .dom(
          '[data-test-history-table] [data-test-history-table-row] [data-test-history-table-store-version]'
        )
        .exists();

      assert
        .dom(
          '[data-test-history-table] [data-test-history-table-row] [data-test-history-table-scanned-status]'
        )
        .exists();

      assert
        .dom(
          '[data-test-history-table] [data-test-history-table-row] [data-test-history-table-file-id]'
        )
        .exists();

      assert
        .dom(
          '[data-test-history-table] [data-test-history-table-row] [data-test-history-table-date-found]'
        )
        .exists()
        .hasText(`${dayjs(this.amAppSyncs[0].syncedOn).format('DD MMM YYYY')}`);
    });
  }
);
