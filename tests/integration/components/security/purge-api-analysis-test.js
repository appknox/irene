import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { fillIn, click } from '@ember/test-helpers';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }
  success(msg) {
    this.successMsg = msg;
  }
}

module(
  'Integration | Component | security/purge-api-analysis',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
    });

    test('it shows purge api analysis page with elements', async function (assert) {
      await render(hbs`<Security::PurgeApiAnalysis />`);

      assert.dom('[data-test-purge-api-analysis-container]').exists();

      assert
        .dom('[data-test-purge-api-analysis-title]')
        .exists()
        .hasText('Purge API Analyses');

      assert
        .dom('[data-test-purge-api-analysis-summary]')
        .exists()
        .hasText(
          'Please enter the id of the file you want to purge off API Analyses'
        );
    });

    test('it successfully runs purge api analysis', async function (assert) {
      await render(hbs`<Security::PurgeApiAnalysis />`);

      assert.dom('[data-test-purge-api-analysis-input]').exists();

      this.server.post(
        '/hudson-api/files/3/purge_api',
        () => new Response(200)
      );

      await fillIn('[data-test-purge-api-analysis-input]', '3');

      await click('[data-test-purge-api-analysis-submit-button]');

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.successMsg, 'Successfully Purged the Analysis');
    });
  }
);
