import Service from '@ember/service';
import { click, render } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

class NotificationsStub extends Service {
  errorMsg = null;
  error(msg) {
    return (this.errorMsg = msg);
  }
}

module('Integration | Component | partner/export-stats', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 2);
    await this.owner.lookup('service:organization').load();
    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it renders date range picker enabled', async function (assert) {
    await render(hbs`<Partner::ExportStats />`);
    assert.dom(`[data-test-header]`).hasText(t('downloadClientsStatData'));
    assert.dom(`[data-test-date-range-picker]`).exists();
    const iconElementClass = this.element.querySelector(
      `[data-test-date-range-icon]`
    ).className;
    assert.ok(iconElementClass, 'calendar');
    assert
      .dom(`[data-test-date-range]`)
      .hasText(`${t('fromDate')} - ${t('toDate')}`);
    assert.dom(`[data-test-export-btn]`).hasText(t('exportCSV'));
  });

  test('it should show error, if export btn clicked with empty date range', async function (assert) {
    await render(hbs`<Partner::ExportStats />`);
    this.notifyService = this.owner.lookup('service:notifications');
    assert.strictEqual(
      this.notifyService.get('errorMsg'),
      null,
      'Error msg should not exist'
    );
    await click(this.element.querySelector(`[data-test-export-btn]`));

    assert.strictEqual(
      this.notifyService.get('errorMsg'),
      'Please select valid date range'
    );
  });

  test('it should check if the datetime getting passed in the api is timezoned correctly when exporting chart data', async function (assert) {
    let analytics_export_request;

    // Request to be made when a user clicks on the data export button
    this.server.get('v2/partners/:id/analytics/download_url', (_, req) => {
      analytics_export_request = req;

      return {
        id: req.params.id,
        upload_timeline: [
          {
            created_on_date: '2022-04-11',
            upload_count: 2,
          },
        ],
      };
    });

    // The default values of the start and end dates to be set in the ExportStats Component
    this.set('startDate', dayjs().subtract(4, 'month'));
    this.set('endDate', dayjs().subtract(4, 'day'));

    await render(
      hbs`
        <Partner::ExportStats 
          @startDate={{this.startDate}}
          @endDate={{this.endDate}}
        />
      `
    );

    assert
      .dom(`[data-test-from-date]`)
      .hasText(`${this.startDate.format('DD/MM/YYYY')}`);
    assert
      .dom(`[data-test-to-date]`)
      .hasText(`${this.endDate.format('DD/MM/YYYY')}`);

    await click(this.element.querySelector(`[data-test-export-btn]`));

    // Get mocked request from pretender initiated by the click of the export button
    const analytics_export_request_params =
      analytics_export_request.queryParams;
    const { start_timestamp, end_timestamp } = analytics_export_request_params;

    assert.strictEqual(
      dayjs(start_timestamp).format(),
      this.startDate.format(), // selected start_date of date range picker in ExportStats Component
      'Element [data-test-from-date] value is equal to the start_date in chart data export request URL params'
    );

    assert.strictEqual(
      dayjs(end_timestamp).format(),
      this.endDate.format(), // selected end_date of date range picker in ExportStats Component
      'Element [data-test-to-date] value is equal to the end_date in chart data export request URL params'
    );
  });
});
