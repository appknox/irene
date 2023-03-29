import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module(
  'Integration | Component | app-monitoring/details-table',

  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.store = this.owner.lookup('service:store');

      this.amAppVersions = [];

      const amAppVersion = this.store.createRecord('am-app-version', {
        id: 1,
      });

      this.amAppVersions.push(amAppVersion);
    });

    test('it renders empty state when app versions are empty', async function (assert) {
      this.amAppVersions = [];

      await render(
        hbs`<AppMonitoring::DetailsTable @amAppVersions={{this.amAppVersions}} />`
      );

      assert.dom('[data-test-am-details-table-empty]').exists();

      // TODO: Add proper tests for empty content when empty messages have been updated
      assert
        .dom(
          '[data-test-am-details-table-empty] [data-test-am-empty-header-text]'
        )
        .hasText('t:notFound:()');

      assert
        .dom(
          '[data-test-am-details-table-empty] [data-test-am-empty-body-text]'
        )
        .hasText(
          'Lorem ipsum dolor sit amet consectetur. Maecenas quis morbi libero lacus. Cras sapien cursus bibendum.'
        );
    });

    test('it renders details table when atleast one amApp version exists', async function (assert) {
      await render(
        hbs`<AppMonitoring::DetailsTable @amAppVersions={{this.amAppVersions}} />`
      );

      assert.dom('[data-test-am-details-table]').exists();

      const versionsRowElements = this.element.querySelectorAll(
        '[data-test-am-details-table-row]'
      );
      assert.strictEqual(
        versionsRowElements.length,
        this.amAppVersions.length,
        'renders the correct number of app versions'
      );

      // Checks for version row cells
      assert
        .dom(
          '[data-test-am-details-table] [data-test-am-details-table-row] [data-test-details-table-country-code]'
        )
        .exists()
        .hasText('UK');

      assert
        .dom(
          '[data-test-am-details-table] [data-test-am-details-table-row] [data-test-am-details-table-store-version]'
        )
        .exists();

      assert
        .dom(
          '[data-test-am-details-table] [data-test-am-details-table-row] [data-test-am-details-table-action]'
        )
        .exists();

      assert
        .dom(
          '[data-test-am-details-table] [data-test-am-details-table-row] [data-test-am-details-table-scan-button]'
        )
        .exists()
        .hasText('t:appMonitoringModule.startScan:()');
    });
  }
);
