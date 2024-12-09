import { module, test } from 'qunit';
import { Response } from 'miragejs';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, triggerEvent, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { serializer } from 'irene/tests/test-utils';

module(
  'Integration | Component | partner/client-report-download/report-password',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      await this.server.create('organization');
      await this.owner.lookup('service:organization').load();
    });

    test('it should render password toggle button', async function (assert) {
      this.server.create('partner/partner', {
        access: { view_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.set('clientId', 1);
      this.set('fileId', 1);
      this.set('reportId', 1);

      await render(
        hbs`<Partner::ClientReportDownload::ReportPassword
          @clientId={{this.clientId}}
          @fileId={{this.fileId}}
          @reportId={{this.reportId}}
        />`
      );

      assert.dom('[data-test-dropdown]').exists();
      assert.dom('[data-test-dropdown-toggle]').exists();
      assert.dom('[data-test-dropdown-tray]').doesNotExist();
    });

    test('it should show tooltip', async function (assert) {
      this.server.create('partner/partner', {
        access: { view_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.set('clientId', 1);
      this.set('fileId', 1);
      this.set('reportId', 1);

      await render(
        hbs`<Partner::ClientReportDownload::ReportPassword
        @clientId={{this.clientId}}
        @fileId={{this.fileId}}
        @reportId={{this.reportId}}
      />`
      );

      const genActionTooltip = find(
        '[data-test-dropdown] [data-test-ak-tooltip-root]'
      );

      await triggerEvent(genActionTooltip, 'mouseenter');

      assert.dom('[data-test-dropdown-tooltip-text]').exists();

      assert
        .dom('[data-test-dropdown-tooltip-text]')
        .hasText(t('reportPassword'));
    });

    test('it should not call unlock_key API without toggle click', async function (assert) {
      this.server.create('partner/partner', {
        access: { view_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.set('unlockKeyAPICalled', false);

      this.server.get(
        'v2/partnerclients/:clientId/reports/:id/unlock_key',
        () => {
          this.set('unlockKeyAPICalled', true);
          return new Response(403);
        }
      );

      this.set('clientId', 1);
      this.set('fileId', 1);
      this.set('reportId', 1);

      await render(
        hbs`<Partner::ClientReportDownload::ReportPassword
        @clientId={{this.clientId}}
        @fileId={{this.fileId}}
        @reportId={{this.reportId}}
      />`
      );

      assert.false(this.unlockKeyAPICalled);
    });

    test('it should call unlock_key API on toggle click', async function (assert) {
      this.server.create('partner/partner', {
        access: { view_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.set('unlockKeyAPICalled', false);

      this.server.create('partner/partnerclient-report-unlockkey');
      this.server.get(
        'v2/partnerclients/:clientId/reports/:id/unlock_key',
        (schema) => {
          this.set('unlockKeyAPICalled', true);
          const data = schema['partner/partnerclientReportUnlockkeys'].find(1);
          return serializer(data);
        }
      );

      this.set('clientId', 1);
      this.set('fileId', 1);
      this.set('reportId', 1);

      await render(
        hbs`<Partner::ClientReportDownload::ReportPassword
        @clientId={{this.clientId}}
        @fileId={{this.fileId}}
        @reportId={{this.reportId}}
      />`
      );

      const toggleBtn = this.element.querySelector(
        '[data-test-dropdown-toggle]'
      );
      await click(toggleBtn);

      assert.true(this.unlockKeyAPICalled);
    });

    test('it should render dropdown with password and copy button on toggle click', async function (assert) {
      this.server.create('partner/partner', {
        access: { view_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      const unlockKey = this.server.create(
        'partner/partnerclient-report-unlockkey'
      );
      this.server.get(
        'v2/partnerclients/:clientId/reports/:id/unlock_key',
        (schema) => {
          const data = schema['partner/partnerclientReportUnlockkeys'].find(1);
          return serializer(data);
        }
      );

      this.set('clientId', 1);
      this.set('fileId', 1);
      this.set('reportId', 1);

      await render(
        hbs`<Partner::ClientReportDownload::ReportPassword
        @clientId={{this.clientId}}
        @fileId={{this.fileId}}
        @reportId={{this.reportId}}
      />`
      );

      assert.dom('[data-test-dropdown-tray]').doesNotExist();

      const toggleBtn = this.element.querySelector(
        '[data-test-dropdown-toggle]'
      );
      await click(toggleBtn);

      assert.dom('[data-test-dropdown-tray]').exists();
      assert.dom('[data-test-report-password]').exists();
      assert
        .dom('[data-test-report-password-title]')
        .hasText(t('reportPassword'));
      assert
        .dom('[data-test-report-password-value]')
        .hasAttribute('id', `unlock-key-${this.reportId}`)
        .hasValue(unlockKey.unlockKey);
      assert
        .dom('[data-test-report-password-copy-button]')
        .containsText(t('copy'));
    });

    test('it should copy password to clipboard on click of copy button', async function (assert) {
      this.server.create('partner/partner', {
        access: { view_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      const unlockKey = this.server.create(
        'partner/partnerclient-report-unlockkey'
      );
      this.server.get(
        'v2/partnerclients/:clientId/reports/:id/unlock_key',
        (schema) => {
          const data = schema['partner/partnerclientReportUnlockkeys'].find(1);
          return serializer(data);
        }
      );

      this.set('clientId', 1);
      this.set('fileId', 1);
      this.set('reportId', 1);

      await render(
        hbs`<Partner::ClientReportDownload::ReportPassword
        @clientId={{this.clientId}}
        @fileId={{this.fileId}}
        @reportId={{this.reportId}}
      />`
      );

      const toggleBtn = this.element.querySelector(
        '[data-test-dropdown-toggle]'
      );
      await click(toggleBtn);

      assert
        .dom('[data-test-report-password-value]')
        .hasAttribute('id', `unlock-key-${this.reportId}`)
        .hasValue(unlockKey.unlockKey);

      assert
        .dom('[data-test-report-password-copy-button]')
        .hasAttribute('data-clipboard-target', `#unlock-key-${this.reportId}`);

      const copyBtn = this.element.querySelector(
        '[data-test-report-password-copy-button]'
      );
      await click(copyBtn);

      // Note: ClipboardJS copies text to clipboard using
      // document.execcommand('copy'), in order to retrieve the text we have
      // to use Clipboard web API navigator.clipboard.readText(),
      // which require permissions to be set from test context.
      // Therefore skipping this test
    });

    test('it should not render if view_reports privilege is set to false', async function (assert) {
      this.server.create('partner/partner', {
        access: { view_reports: false },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.set('clientId', 1);
      this.set('fileId', 1);
      this.set('reportId', 1);

      await render(
        hbs`<Partner::ClientReportDownload::ReportPassword
        @clientId={{this.clientId}}
        @fileId={{this.fileId}}
        @reportId={{this.reportId}}
      />`
      );

      assert.dom('[data-test-dropdown]').doesNotExist();
    });

    test('it should render if view_reports privilege is set to true', async function (assert) {
      this.server.create('partner/partner', {
        access: { view_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.set('clientId', 1);
      this.set('fileId', 1);
      this.set('reportId', 1);

      await render(
        hbs`<Partner::ClientReportDownload::ReportPassword
        @clientId={{this.clientId}}
        @fileId={{this.fileId}}
        @reportId={{this.reportId}}
      />`
      );

      assert.dom('[data-test-dropdown]').exists();
    });

    test('it should display error state if unable to load unlock_key API', async function (assert) {
      this.server.create('partner/partner', {
        access: { view_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.get(
        'v2/partnerclients/:clientId/reports/:id/unlock_key',
        () => {
          return new Response(403);
        }
      );

      this.set('clientId', 1);
      this.set('fileId', 1);
      this.set('reportId', 1);

      await render(
        hbs`<Partner::ClientReportDownload::ReportPassword
        @clientId={{this.clientId}}
        @fileId={{this.fileId}}
        @reportId={{this.reportId}}
      />`
      );

      assert.dom('[data-test-report-password]').doesNotExist();
      assert.dom('[data-test-api-error]').doesNotExist();

      const toggleBtn = this.element.querySelector(
        '[data-test-dropdown-toggle]'
      );
      await click(toggleBtn);

      assert.dom('[data-test-report-password]').exists();
      assert
        .dom('[data-test-api-error]')
        .exists()
        .hasText(t('somethingWentWrong'));
    });
  }
);
