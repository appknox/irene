import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { underscore } from '@ember/string';
import { REPORT } from 'irene/utils/constants';
import dayjs from 'dayjs';
import { Response } from 'miragejs';

class RealtimeStub extends Service {
  ReportCounter = 0;
}

class NotificationsStub extends Service {
  errorMsg = null;
  error(msg) {
    return (this.errorMsg = msg);
  }
}

function serializer(payload) {
  const serializedPayload = {};
  Object.keys(payload.attrs).map((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });
  return serializedPayload;
}

function serializerAll(data) {
  return {
    count: data.length,
    next: null,
    previous: null,
    results: data.models.map((d) => {
      return serializer(d);
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
    assert.dom(`[data-test-report="file-details"]`).exists();
    assert.dom(`[data-test-report="analysis"]`).doesNotExist();
  });

  test('it should render btn in security dashboard', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.server.get('v2/files/:id/reports', () => {
      return [];
    });
    this.set('file', {});
    this.set('isSecurityDashboard', true);
    await render(
      hbs`<File::ReportBtn @file={{this.file}} @isSecurityDashboard={{this.isSecurityDashboard}}/>`
    );
    assert.dom(`[data-test-report="file-details"]`).doesNotExist();
    assert.dom(`[data-test-report="analysis"]`).exists();
  });

  test('it should handle generating status', async function (assert) {
    var fileReport = this.server.create('file-report', { progress: -1 });
    this.server.get('v2/files/:id/reports', () => {
      return [serializer(fileReport)];
    });

    this.server.post('v2/files/:id/reports', () => {
      fileReport.update('progress', 30);
      return serializer(fileReport);
    });
    this.realtimeService = this.owner.lookup('service:realtime');
    this.set('file', { id: 1, canGenerateReport: true, isStaticDone: true });
    await render(hbs`<File::ReportBtn @file={{this.file}}/>`);

    assert
      .dom(`[data-test-report="action-btn-label"]`)
      .hasText(`t:generateReport:()`);

    await click(`[data-test-report="action-btn-label"]`);
    this.realtimeService.incrementProperty('ReportCounter');
    assert
      .dom(`[data-test-report="action-btn-label"]`)
      .hasText(`t:generatingReport:()`);
    assert.dom(`i.fa-spinner`).exists();
    assert.equal(
      this.element.querySelector(`[data-test-report='progress']`).style.width,
      '30%'
    );
  });

  // test('it should handle generated/download status', async function (assert) {
  //   console.log('testing generated');
  //   this.set('file', { id: 1, canGenerateReport: true, isStaticDone: true });
  //   var fileReport = this.server.create('file-report', {
  //     progress: -1,
  //   });
  //   this.server.get('v2/files/:id/reports', (schema, req) => {
  //     console.log('req', req);
  //     return [serializer(schema.fileReports.find(req.params.id))];
  //   });

  //   this.server.post('v2/files/:id/reports', () => {
  //     fileReport.update('progress', 100);
  //     fileReport.update('isGenerated', true);
  //     this.set('file', { id: 1, canGenerateReport: false });
  //     return serializer(fileReport);
  //   });

  //   this.realtimeService = this.owner.lookup('service:realtime');

  //   await render(hbs`<File::ReportBtn @file={{this.file}}/>`);

  //   assert
  //     .dom(`[data-test-report="action-btn-label"]`)
  //     .hasText(`t:generateReport:()`);

  //   await click(`[data-test-report="action-btn-label"]`);

  //   await this.realtimeService.incrementProperty('ReportCounter');
  //   assert
  //     .dom(`[data-test-report="action-btn-label"]`)
  //     .hasText(`t:downloadReport:()`);
  // });

  test('it should show btn with generate report state', async function (assert) {
    this.set('file', { canGenerateReport: true });
    await render(hbs`<File::ReportBtn @file={{this.file}}/>`);

    assert
      .dom(`[data-test-report="action-btn-label"]`)
      .hasText(`t:generateReport:()`);
  });

  test('it should show prev report dropdown', async function (assert) {
    const reports = this.server.createList('file-report', 2);
    this.server.get('v2/files/:id/reports', (schema) => {
      return serializerAll(schema.fileReports.all());
    });

    this.set('file', { id: 1 });
    await render(hbs`<File::ReportBtn @file={{this.file}}/>`);

    assert.dom(`[data-test-report='pre-reports']`).exists();

    await click(`[data-test-report='prev-report-trigger']`);

    const noOfPrevReports = REPORT.MAX_LIMIT - 1;

    assert.equal(
      this.element.querySelectorAll(`[data-test-report='prev-report']`).length,
      noOfPrevReports,
      `Number of prev reports limited to ${noOfPrevReports}`
    );
    for (let i = 1; i <= noOfPrevReports; i++) {
      assert
        .dom(
          `[data-test-report='prev-report-${
            i - 1
          }'] [data-test-report='download-prev-report']`
        )
        .hasText(`t:downloadPrevReport:()`);
      assert
        .dom(
          `[data-test-report='prev-report-${
            i - 1
          }'] [data-test-report='generated-label']`
        )
        .hasText(
          `t:generatedOn:() ${dayjs(reports.objectAt(i).generatedOn).format(
            'DD MMM YYYY hh:mm a'
          )}`
        );
    }
  });

  test('it should show error when report url is not found', async function (assert) {
    this.server.create('file-report', { progress: 100 });
    this.server.get('v2/files/:id/reports', (schema) => {
      return serializerAll(schema.fileReports.all());
    });

    this.server.get('v2/reports/:id/:type', () => {
      return {};
    });

    this.set('file', { id: 1 });
    await render(hbs`<File::ReportBtn @file={{this.file}}/>`);

    await click(`[data-test-report="action-btn-label"]`);

    this.notifyService = this.owner.lookup('service:notifications');
    assert.equal(
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

    await click(`[data-test-report="action-btn-label"]`);

    this.notifyService = this.owner.lookup('service:notifications');
    assert.equal(
      this.notifyService.get('errorMsg'),
      `Report generation failed`
    );
  });

  test('it should show generate report btn in sec dashboard', async function (assert) {
    this.set('isSecurityDashboard', true);
    this.set('file', { id: 1, canGenerateReport: true, isStaticDone: true });
    await render(
      hbs`<File::ReportBtn @file={{this.file}} @isSecurityDashboard={{this.isSecurityDashboard}}/>`
    );

    assert.dom(`[data-test-report='analysis']`).hasText(`t:generateReport:()`);
    assert
      .dom(`[data-test-report='external-report-download-dropdown']`)
      .exists();

    await click(`[data-test-report='ext-download-trigger']`);

    assert.dom(`[data-test-report='ext-download-content']`).exists();
    assert
      .dom(`[data-test-report='ext-download-excel']`)
      .hasText(`t:downloadExcelReport:()`);
  });
});
