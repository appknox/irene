import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

class NotificationsStub extends Service {
  errorMsg = null;
  error(msg) {
    return (this.errorMsg = msg);
  }
}

module('Integration | Component | partner/export-stats', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 2);
    await this.owner.lookup('service:organization').load();
    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it renders date range picker enabled', async function (assert) {
    await render(hbs`<Partner::ExportStats />`);
    assert.dom(`[data-test-header]`).hasText(`t:downloadClientsStatData:()`);
    assert.dom(`[data-test-date-range-picker]`).exists();
    assert.dom(`[data-test-date-range] i`).hasClass('fa-calendar');
    assert.dom(`[data-test-date-range]`).hasText(`t:fromDate:() - t:toDate:()`);
    assert.dom(`[data-test-export-btn]`).hasText(`t:exportCSV:()`);
  });

  test('it should show error, if export btn clicked with empty date range', async function (assert) {
    await render(hbs`<Partner::ExportStats />`);
    this.notifyService = this.owner.lookup('service:notifications');
    assert.equal(
      this.notifyService.get('errorMsg'),
      null,
      'Error msg should not exist'
    );
    await click(this.element.querySelector(`[data-test-export-btn]`));

    assert.equal(
      this.notifyService.get('errorMsg'),
      'Please select valid date range'
    );
  });
});
