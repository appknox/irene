/* eslint-disable qunit/no-assert-equal */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

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

module(
  'Integration | Component | security/analysis-report-btn',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
    });

    test('it should render generate report btn', async function (assert) {
      this.server.get('v2/files/:id/reports', () => {
        return [];
      });
      this.set('file', {});
      await render(hbs`<Security::AnalysisReportBtn @file={{this.file}}/>`);
      assert.dom(`[data-test-report-analysis]`).hasText(`t:generateReport:()`);
    });

    test('it should show all other types download report btns', async function (assert) {
      this.set('file', { id: 1 });
      await render(hbs`<Security::AnalysisReportBtn @file={{this.file}}/>`);

      assert.dom(`[data-test-report-report-download-dropdown]`).exists();

      await click(`[data-test-report-download-trigger]`);

      const reportTypes = [
        `t:excelReport:()`,
        `t:jaHTMLReport:()`,
        `t:enHTMLReport:()`,
      ];

      assert.dom(`[data-test-report-download-content]`).exists();

      reportTypes.forEach((reportType, seq) =>
        assert
          .dom(`[data-test-report-type='${seq}']`)
          .hasText(`t:download:() ${reportType}`)
      );
    });

    test('it should show error when download report which is not exist', async function (assert) {
      this.set('file', { id: 1 });
      await render(hbs`<Security::AnalysisReportBtn @file={{this.file}}/>`);

      await click(`[data-test-report-download-trigger]`);

      const reportTypes = [
        `t:excelReport:()`,
        `t:jaHTMLReport:()`,
        `t:enHTMLReport:()`,
      ];

      assert.dom(`[data-test-report-download-content]`).exists();
      const notifyService = this.owner.lookup('service:notifications');
      await click(`[data-test-report-type='0']`);
      assert.equal(
        notifyService.get('errorMsg'),
        `t:noReportExists:("format":"${reportTypes[0]}")`
      );

      await click(`[data-test-report-type='1']`);
      assert.equal(
        notifyService.get('errorMsg'),
        `t:noReportExists:("format":"${reportTypes[1]}")`
      );

      await click(`[data-test-report-type='2']`);
      assert.equal(
        notifyService.get('errorMsg'),
        `t:noReportExists:("format":"${reportTypes[2]}")`
      );
    });
  }
);
