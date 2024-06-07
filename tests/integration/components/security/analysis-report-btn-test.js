import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { Response } from 'miragejs';

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

class WindowStub extends Service {
  url = null;
  target = null;

  open(url, target) {
    this.url = url;
    this.target = target;
  }
}

module(
  'Integration | Component | security/analysis-report-btn',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      // Services
      this.owner.register('service:browser/window', WindowStub);
      this.owner.register('service:notifications', NotificationsStub);

      const window = this.owner.lookup('service:browser/window');
      const store = this.owner.lookup('service:store');

      // Server Mocks
      this.server.get('/hudson-api/projects/:id', (schema, req) => {
        return schema['security/projects'].find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/hudson-api/projects', () => {
        return new Response(200);
      });

      const secProj = this.server.create('security/project');

      const secFile = this.server.create('security/file', {
        id: 1,
        project: secProj.id,
      });

      const secFileModel = store.push(
        store.normalize('security/file', secFile.toJSON())
      );

      this.setProperties({ secFileModel, secProj, window });
    });

    test('it should render generate report and available reports buttons', async function (assert) {
      await render(
        hbs`<Security::AnalysisReportBtn @file={{this.secFileModel}} />`
      );

      assert
        .dom('[data-test-securityAnalysisReportBtn]')
        .exists()
        .hasText('t:generateReport:()');

      assert
        .dom('[data-test-securityAnalysisReportBtn-moreOptionsBtn]')
        .exists();

      assert
        .dom('[data-test-securityAnalysisReportBtn-moreOptionsBtn-icon]')
        .exists();
    });

    test('it generates a report', async function (assert) {
      assert.expect();

      const emailsToSendTo = ['user1@email.com', 'user2@email.com'];
      const emailsToSendToStr = emailsToSendTo.join(', ');

      this.server.put('/hudson-api/reports/:id', (_, req) => {
        const { emails } = JSON.parse(req.requestBody);

        assert.strictEqual(
          emailsToSendToStr,
          emails.join(', '),
          'Sends correct email addresses over the network'
        );

        return new Response(200);
      });

      await render(
        hbs`<Security::AnalysisReportBtn @file={{this.secFileModel}} />`
      );

      assert.dom('[data-test-securityAnalysisReportBtn]').exists();

      await click('[data-test-securityAnalysisReportBtn]');

      assert
        .dom('[data-test-securityAnalysisReportBtn-genReportModal]')
        .exists();

      assert
        .dom('[data-test-securityAnalysisReportBtn-genReportModal-formHeader]')
        .exists()
        .containsText('Emails')
        .containsText('Please enter emails to send report to');

      const emailsTextfieldSelector =
        '[data-test-securityAnalysisReportBtn-genReportModal-emailsToSendTextfield]';

      assert.dom(emailsTextfieldSelector).exists();

      await fillIn(emailsTextfieldSelector, emailsToSendToStr);

      assert.dom(emailsTextfieldSelector).hasValue(emailsToSendToStr);

      for (const email of emailsToSendTo) {
        assert
          .dom(
            `[data-test-securityAnalysisReportBtn-genReportModal-email="${email}"]`
          )
          .exists()
          .hasText(email);
      }

      assert
        .dom('[data-test-securityAnalysisReportBtn-genReportModal-submitBtn]')
        .exists()
        .hasText('t:generateReport:()');

      await click(
        '[data-test-securityAnalysisReportBtn-genReportModal-submitBtn]'
      );

      assert
        .dom('[data-test-securityAnalysisReportBtn-genReportModal]')
        .containsText('t:reportGeneratedSuccessfully:()')
        .containsText('t:reportSendTo:()');

      for (const email of emailsToSendTo) {
        assert
          .dom(
            `[data-test-securityAnalysisReportBtn-genReportModal-succesEmail='${email}']`
          )
          .exists()
          .containsText(email);
      }
    });

    test.each(
      'it should download all other report types',
      [
        {
          label: 't:excelReport:()',
          format: 'xlsx',
        },
        {
          label: 't:jaHTMLReport:()',
          format: 'html_ja',
        },
        {
          label: 't:enHTMLReport:()',
          format: 'html_en',
        },
        {
          label: 't:excelReport:()',
          format: 'xlsx',
          error: true,
        },
        {
          label: 't:jaHTMLReport:()',
          format: 'html_ja',
          error: true,
        },
        {
          label: 't:enHTMLReport:()',
          format: 'html_en',
          error: true,
        },
      ],
      async function (assert, { label, format, error }) {
        const downloadURL = `www.download-${format}-report.com`;

        this.server.get('/hudson-api/reports/:id/download_url', () => {
          const FORMAT = error ? 'CSV' : format;

          return { [FORMAT]: downloadURL };
        });

        await render(
          hbs`<Security::AnalysisReportBtn @file={{this.secFileModel}} />`
        );

        const availableReportsBtn =
          '[data-test-securityAnalysisReportBtn-moreOptionsBtn]';

        assert.dom(availableReportsBtn).exists();

        await click(availableReportsBtn);

        const reportTypeDownloadTrigger = `[data-test-securityAnalysisReportBtn-moreOptionsItem='${label}'] button`;

        assert.dom(reportTypeDownloadTrigger).hasText(`t:download:() ${label}`);

        await click(reportTypeDownloadTrigger);

        const notifyService = this.owner.lookup('service:notifications');

        if (error) {
          assert.strictEqual(
            notifyService.get('errorMsg'),
            `t:noReportExists:("format":"${label}")`
          );
        } else {
          assert.strictEqual(this.window.url, downloadURL);
        }
      }
    );
  }
);
