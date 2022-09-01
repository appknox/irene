import Service from '@ember/service';
import { underscore } from '@ember/string';
import { click, render } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { REPORT } from 'irene/utils/constants';
import { Response } from 'miragejs';
import { module, test } from 'qunit';

class RealtimeStub extends Service {
  ReportCounter = 0;
}

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  error(msg) {
    return (this.errorMsg = msg);
  }
  success(msg) {
    return (this.successMsg = msg);
  }
}

function serialize(payload) {
  const serializedPayload = {};
  Object.keys(payload.attrs).map((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });
  return serializedPayload;
}

function serializeAll(data) {
  return {
    count: data.length,
    next: null,
    previous: null,
    results: data.models.map((d) => {
      return serialize(d);
    }),
  };
}

module('Integration | Component | file/report-btn', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.owner.register('service:realtime', RealtimeStub);
    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it should render btn in file details', async function (assert) {
    this.server.get('v2/files/:id/reports', () => {
      return [];
    });
    this.set('file', {});
    await render(hbs`<File::ReportBtn @file={{this.file}}/>`);
    assert.dom(`[data-test-report-file-details]`).exists();
    assert.dom(`[data-test-report-analysis]`).doesNotExist();
  });

  test('it should handle generating status', async function (assert) {
    var fileReport = this.server.create('file-report', { progress: -1 });
    this.server.get('v2/files/:id/reports', () => {
      return [serialize(fileReport)];
    });

    this.server.post('v2/files/:id/reports', () => {
      fileReport.update('progress', 30);
      return serialize(fileReport);
    });
    this.realtimeService = this.owner.lookup('service:realtime');
    this.set('file', { id: 1, canGenerateReport: true, isStaticDone: true });
    await render(hbs`<File::ReportBtn @file={{this.file}}/>`);

    assert
      .dom(`[data-test-report-action-btn-label]`)
      .hasText(`t:generateReport:()`);

    await click(`[data-test-report-action-btn-label]`);
    this.realtimeService.incrementProperty('ReportCounter');
    assert
      .dom(`[data-test-report-action-btn-label]`)
      .hasText(`t:generatingReport:()`);
    assert.strictEqual(
      this.element.querySelector(`[data-test-report-progress]`).style.width,
      '30%'
    );
  });

  test('it should handle generated/download status', async function (assert) {
    this.set('file', { id: 1, canGenerateReport: true, isStaticDone: true });
    var fileReport = this.server.create('file-report', {
      progress: -1,
    });
    this.server.get('v2/files/:id/reports', () => {
      return [serialize(fileReport)];
    });

    this.server.post('v2/files/:id/reports', () => {
      fileReport.update('progress', 100);
      fileReport.update('isGenerated', true);
      this.set('file', { id: 1, canGenerateReport: false });
      return serialize(fileReport);
    });

    this.realtimeService = this.owner.lookup('service:realtime');
    this.notifyService = this.owner.lookup('service:notifications');

    await render(hbs`<File::ReportBtn @file={{this.file}}/>`);

    assert
      .dom(`[data-test-report-action-btn-label]`)
      .hasText(`t:generateReport:()`);

    await click(`[data-test-report-action-btn-label]`);

    await this.realtimeService.incrementProperty('ReportCounter');
    assert.strictEqual(
      this.notifyService.get('successMsg'),
      `t:reportIsGettingGenerated:()`
    );
    assert
      .dom(`[data-test-report-action-btn-label]`)
      .hasText(`t:downloadReport:()`);
  });

  test('it should show btn with generate report state', async function (assert) {
    this.set('file', { canGenerateReport: true });
    await render(hbs`<File::ReportBtn @file={{this.file}}/>`);

    assert
      .dom(`[data-test-report-action-btn-label]`)
      .hasText(`t:generateReport:()`);
  });

  test('it should show prev report dropdown', async function (assert) {
    const reports = this.server.createList('file-report', 2);
    this.server.get('v2/files/:id/reports', (schema) => {
      return serializeAll(schema.fileReports.all());
    });

    this.set('file', { id: 1 });
    await render(hbs`<File::ReportBtn @file={{this.file}}/>`);

    assert.dom(`[data-test-pre-reports]`).exists();

    await click(`[data-test-prev-report-trigger]`);

    const noOfPrevReports = REPORT.MAX_LIMIT - 1;

    assert.strictEqual(
      this.element.querySelectorAll(`[data-test-prev-report]`).length,
      noOfPrevReports,
      `Number of prev reports limited to ${noOfPrevReports}`
    );
    for (let i = 1; i <= noOfPrevReports; i++) {
      assert
        .dom(
          `[data-test-prev-report='${i - 1}'] [data-test-download-prev-report]`
        )
        .hasText(`t:downloadPrevReport:()`);
      assert
        .dom(
          `[data-test-prev-report='${
            i - 1
          }'] [data-test-report-generated-label]`
        )
        .hasText(
          `t:generatedOn:() ${dayjs(reports[i].generatedOn).format(
            'DD MMM YYYY hh:mm a'
          )}`
        );
    }
  });

  test('it should show error when report url is not found', async function (assert) {
    this.server.create('file-report', { progress: 100 });
    this.server.get('v2/files/:id/reports', (schema) => {
      return serializeAll(schema.fileReports.all());
    });

    this.server.get('v2/reports/:id/:type', () => {
      return {};
    });

    this.set('file', { id: 1 });
    await render(hbs`<File::ReportBtn @file={{this.file}}/>`);

    await click(`[data-test-report-action-btn-label]`);

    this.notifyService = this.owner.lookup('service:notifications');
    assert.strictEqual(
      this.notifyService.get('errorMsg'),
      `t:downloadUrlNotFound:()`
    );
  });

  test('it should show error when report generation is failed', async function (assert) {
    this.server.post('v2/files/:id/reports', () => {
      return new Response(
        400,
        { some: 'header' },
        { errors: ['Report generation failed'] }
      );
    });

    this.set('file', { id: 1, canGenerateReport: true, isStaticDone: true });
    await render(hbs`<File::ReportBtn @file={{this.file}}/>`);

    await click(`[data-test-report-action-btn-label]`);

    this.notifyService = this.owner.lookup('service:notifications');
    assert.strictEqual(
      this.notifyService.get('errorMsg'),
      `Report generation failed`
    );
  });
});
