import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { click, render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

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

class RealtimeStub extends Service {
  @tracked InterimReportCounter = 0;
}

const INTERIM_REPORT_BASE = '/hudson-api/interim-reports';
const FILES_BASE = '/hudson-api/files';

module(
  'Integration | Component | security/interim-report-drawer',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:realtime', RealtimeStub);

      const store = this.owner.lookup('service:store');

      const secFile = this.server.create('security/file', { id: '1' });

      this.file = store.push(
        store.normalize('security/file', secFile.toJSON())
      );

      this.onClose = function () {};

      // Default: no interim report (404)
      this.server.get(
        `${FILES_BASE}/:fileId/interim-reports/`,
        () =>
          new Response(
            404,
            {},
            { errors: [{ status: '404', detail: 'Not found' }] }
          )
      );
    });

    test('it renders the generate CTA when no interim report exists', async function (assert) {
      await render(hbs`
        <Security::InterimReportDrawer
          @open={{true}}
          @file={{this.file}}
          @onClose={{this.onClose}}
        />
      `);

      assert.dom('[data-test-securityInterimReportDrawer]').exists();

      assert
        .dom('[data-test-securityInterimReportDrawer-title]')
        .hasText('Interim Report');

      assert
        .dom(
          '[data-test-securityInterimReportDrawer-generateInterimReport-CTA]'
        )
        .exists();

      assert
        .dom(
          '[data-test-securityInterimReportDrawer-generateInterimReportCTA-vector]'
        )
        .exists();

      assert
        .dom(
          '[data-test-securityInterimReportDrawer-generateInterimReportCTA-directiveText]'
        )
        .hasText(
          'Generate an interim report for the first time for this file.'
        );

      assert
        .dom(
          '[data-test-securityInterimReportDrawer-generateInterimReportCTA-btn]'
        )
        .hasText('Generate Report');

      assert
        .dom(
          '[data-test-securityInterimReportDrawer-generateInterimReportProgress-container]'
        )
        .doesNotExist();
    });

    test('it renders the progress loader when the report is being generated', async function (assert) {
      const progress = 45;

      this.server.get(`${FILES_BASE}/:fileId/interim-reports/`, () => ({
        id: 1,
        pdf_progress: progress,
        pdf_status: 1,
        report_password: 'TESTPASS', //NOSONAR
        generated_by: 'admin@example.com',
        created_on: new Date().toISOString(),
        interim_analysis_status: 1,
        is_visible_to_customer: false,
        language: 'en',
      }));

      await render(hbs`
        <Security::InterimReportDrawer
          @open={{true}}
          @file={{this.file}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom(
          '[data-test-securityInterimReportDrawer-generateInterimReportProgress-container]'
        )
        .exists();

      assert
        .dom(
          '[data-test-securityInterimReportDrawer-generateInterimReportProgress-text]'
        )
        .hasText(`Generating Report...`);

      assert
        .dom(
          '[data-test-securityInterimReportDrawer-generateInterimReportProgress-loader]'
        )
        .exists();

      assert
        .dom(`[data-test-ak-loader-linear-progress="${progress}"]`)
        .exists();

      assert
        .dom(
          '[data-test-securityInterimReportDrawer-generateInterimReportProgress-percent]'
        )
        .hasText(`${progress}%`);

      assert
        .dom(
          '[data-test-securityInterimReportDrawer-generateInterimReport-CTA]'
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-security-interimReportDrawer-groupItem="interim-report"]'
        )
        .doesNotExist();
    });

    test('it renders the report accordion when report is fully generated', async function (assert) {
      this.server.get(`${FILES_BASE}/:fileId/interim-reports/`, () => ({
        id: 1,
        pdf_progress: 100,
        pdf_status: 2,
        report_password: 'TESTPASS', //NOSONAR
        generated_by: 'admin@example.com',
        created_on: new Date().toISOString(),
        interim_analysis_status: 1,
        is_visible_to_customer: false,
        language: 'en',
      }));

      this.server.get(
        `${FILES_BASE}/:fileId/interim-reports/can_generate`,
        () => ({ can_generate: false })
      );

      await render(hbs`
        <Security::InterimReportDrawer
          @open={{true}}
          @file={{this.file}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom(
          '[data-test-security-interimReportDrawer-groupItem="interim-report"]'
        )
        .exists();

      assert
        .dom(
          '[data-test-securityInterimReportDrawer-generateInterimReport-CTA]'
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-securityInterimReportDrawer-generateInterimReportProgress-container]'
        )
        .doesNotExist();
    });

    test('it triggers report generation when the generate button is clicked', async function (assert) {
      let reportCreated = false;

      // Initially no report
      this.server.get(`${FILES_BASE}/:fileId/interim-reports/`, () => {
        if (!reportCreated) {
          return new Response(
            404,
            {},
            { errors: [{ status: '404', detail: 'Not found' }] }
          );
        }

        return {
          id: 1,
          pdf_progress: 0,
          pdf_status: 1,
          report_password: 'TESTPASS', //NOSONAR
          generated_by: 'admin@example.com',
          created_on: new Date().toISOString(),
          interim_analysis_status: 1,
          is_visible_to_customer: false,
          language: 'en',
        };
      });

      this.server.post(`${FILES_BASE}/:fileId/interim-reports/`, () => {
        reportCreated = true;

        return {
          id: 1,
          pdf_progress: 0,
          pdf_status: 1,
          report_password: null,
          generated_by: 'admin@example.com',
          created_on: new Date().toISOString(),
          interim_analysis_status: 1,
          is_visible_to_customer: false,
          language: 'en',
        };
      });

      this.server.post(`${INTERIM_REPORT_BASE}/:id/pdf/generate`, () => ({
        success: true,
      }));

      this.server.get(`/hudson-api/interim-reports/1`, () => ({
        id: 1,
        pdf_progress: 10,
        pdf_status: 1,
        report_password: 'TESTPASS', //NOSONAR
        generated_by: 'admin@example.com',
        created_on: new Date().toISOString(),
        interim_analysis_status: 1,
        is_visible_to_customer: false,
        language: 'en',
      }));

      await render(hbs`
        <Security::InterimReportDrawer
          @open={{true}}
          @file={{this.file}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom(
          '[data-test-securityInterimReportDrawer-generateInterimReportCTA-btn]'
        )
        .exists();

      await click(
        '[data-test-securityInterimReportDrawer-generateInterimReportCTA-btn]'
      );

      const notifyService = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notifyService.successMsg,
        'Generating interim report. This may take a few minutes...',
        'shows success notification after generation'
      );
    });

    test('it re-fetches the report when InterimReportCounter increments', async function (assert) {
      let fetchCount = 0;

      this.server.get(`${FILES_BASE}/:fileId/interim-reports/`, () => {
        fetchCount++;

        if (fetchCount === 1) {
          return new Response(
            404,
            {},
            { errors: [{ status: '404', detail: 'Not found' }] }
          );
        }

        return {
          id: 1,
          pdf_progress: 100,
          pdf_status: 2,
          report_password: 'TESTPASS', //NOSONAR
          generated_by: 'admin@example.com',
          created_on: new Date().toISOString(),
          interim_analysis_status: 1,
          is_visible_to_customer: false,
          language: 'en',
        };
      });

      this.server.get(
        `${FILES_BASE}/:fileId/interim-reports/can_generate`,
        () => ({ can_generate: false })
      );

      await render(hbs`
        <Security::InterimReportDrawer
          @open={{true}}
          @file={{this.file}}
          @onClose={{this.onClose}}
        />
      `);

      // Initially shows the CTA (no report)
      assert
        .dom(
          '[data-test-securityInterimReportDrawer-generateInterimReport-CTA]'
        )
        .exists();

      // Simulate a realtime update
      const realtime = this.owner.lookup('service:realtime');
      realtime.incrementProperty('InterimReportCounter');

      await waitFor(
        '[data-test-security-interimReportDrawer-groupItem="interim-report"]',
        {
          timeout: 500,
        }
      );

      // Now shows the report accordion
      assert
        .dom(
          '[data-test-security-interimReportDrawer-groupItem="interim-report"]'
        )
        .exists();

      assert
        .dom(
          '[data-test-securityInterimReportDrawer-generateInterimReport-CTA]'
        )
        .doesNotExist();
    });

    test('it calls onClose when the close button is clicked', async function (assert) {
      let closed = false;
      this.onClose = () => (closed = true);

      await render(hbs`
        <Security::InterimReportDrawer
          @open={{true}}
          @file={{this.file}}
          @onClose={{this.onClose}}
        />
      `);

      await click('[data-test-securityInterimReportDrawer-close-btn]');

      assert.true(closed, 'onClose was called');
    });
  }
);
