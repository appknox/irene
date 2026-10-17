import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { Response } from 'miragejs';

import ENUMS from 'irene/enums';

class NotificationsStub extends Service {
  errorMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success() {}

  setDefaultAutoClear() {}
}

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  drawer: '[data-test-overdueVulnerabilities-slaPolicyDrawer]',
  title: '[data-test-overdueVulnerabilities-slaPolicyDrawer-title]',
  closeBtn: '[data-test-overdueVulnerabilities-slaPolicyDrawer-closeBtn]',
  organization:
    '[data-test-overdueVulnerabilities-slaPolicyDrawer-organization]',
  organizationTitle:
    '[data-test-overdueVulnerabilities-slaPolicyDrawer-organizationTitle]',
  organizationDescription:
    '[data-test-overdueVulnerabilities-slaPolicyDrawer-organizationDescription]',
  project: '[data-test-overdueVulnerabilities-slaPolicyDrawer-project]',
  projectTitle:
    '[data-test-overdueVulnerabilities-slaPolicyDrawer-projectTitle]',
  projectDescription:
    '[data-test-overdueVulnerabilities-slaPolicyDrawer-projectDescription]',
  remediationHeader:
    '[data-test-vulnerabilitySla-policyTable-remediationHeader]',
  info: '[data-test-vulnerabilitySla-policyTable-info]',
  rows: '[data-test-vulnerabilitySla-severityRow]',
  row: (severity) => `[data-test-vulnerabilitySla-severityRow="${severity}"]`,
  rowWindow: '[data-test-vulnerabilitySla-severityRow-readonlyWindow]',
  rowTimeInput: '[data-test-vulnerabilitySla-severityRow-timeInput]',
  rowResetBtn: '[data-test-vulnerabilitySla-severityRow-resetBtn]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<OverdueVulnerabilities::SlaPolicyDrawer
  @open={{this.open}}
  @file={{this.file}}
  @onClose={{this.onClose}}
/>`;

const SEVERITIES = ['critical', 'high', 'medium', 'low'];

const TIME_TYPE_LABEL_KEYS = {
  [ENUMS.SLA_REMEDIATION_TIME_TYPE.DAY]: 'days',
  [ENUMS.SLA_REMEDIATION_TIME_TYPE.WEEK]: 'vulnerabilitySla.weeks',
  [ENUMS.SLA_REMEDIATION_TIME_TYPE.MONTH]: 'vulnerabilitySla.months',
  [ENUMS.SLA_REMEDIATION_TIME_TYPE.YEAR]: 'vulnerabilitySla.years',
};

const windowText = (slaWindow) =>
  `${t('vulnerabilitySla.fixWithin')} ${slaWindow.remediation_time} ${t(
    TIME_TYPE_LABEL_KEYS[slaWindow.remediation_time_type]
  )}`;

// ─── Test suite ────────────────────────────────────────────────────────────────
module(
  'Integration | Component | overdue-vulnerabilities/sla-policy-drawer',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);

      this.server.createList('organization', 1);
      this.server.createList('organization-me', 1);

      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
      );

      await this.owner.lookup('service:organization').load();

      const store = this.owner.lookup('service:store');
      const profile = this.server.create('profile');
      const file = this.server.create('file', { project: '1' });

      this.server.create('project', {
        id: '1',
        last_file: file,
        active_profile_id: profile.id,
      });

      this.server.create('organization-vulnerability-sla', 'withEnabled', {
        id: '1',
      });

      this.server.create('profile-sla-policy', { id: '1' });

      this.server.db.profileSlaPolicies.update('1', {
        medium: {
          remediation_time: 5,
          remediation_time_type: ENUMS.SLA_REMEDIATION_TIME_TYPE.WEEK,
          is_inherited: false,
        },
      });

      this.server.get('/v3/projects/:id', (schema, req) =>
        schema.projects.find(req.params.id).toJSON()
      );

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(req.params.id).toJSON()
      );

      this.server.get('/organizations/:id/vulnerability-sla', (schema) =>
        schema.organizationVulnerabilitySlas.find('1').toJSON()
      );

      this.server.get('/profiles/:id/sla_policy', (schema) =>
        schema.profileSlaPolicies.find('1').toJSON()
      );

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        open: true,
        closed: false,
        onClose: () => this.set('closed', true),
        orgPolicy: () =>
          this.server.db.organizationVulnerabilitySlas.find('1').sla_policy,
        projectPolicy: () => this.server.db.profileSlaPolicies.find('1'),
        notify: this.owner.lookup('service:notifications'),
      });
    });

    // ─── Visibility ──────────────────────────────────────────────────────────
    test('it renders nothing while closed', async function (assert) {
      this.set('open', false);

      await render(TEMPLATE);

      assert.dom(selectors.drawer).doesNotExist();
    });

    test('the close button calls onClose', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.title)
        .hasText(t('overdueVulnerabilities.slaPolicy'));
      assert.false(this.closed);

      await click(selectors.closeBtn);

      assert.true(this.closed);
    });

    // ─── Policies ────────────────────────────────────────────────────────────
    test('it renders the organization policy read-only', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.organizationTitle)
        .hasText(t('overdueVulnerabilities.organizationConfiguredAs'));

      assert
        .dom(selectors.organizationDescription)
        .hasText(t('overdueVulnerabilities.organizationPolicyDescription'));

      assert
        .dom(`${selectors.organization} ${selectors.remediationHeader}`)
        .hasText(t('vulnerabilitySla.remediationDeadline'));

      const rows = findAll(`${selectors.organization} ${selectors.rows}`);
      const policy = this.orgPolicy();

      assert.strictEqual(rows.length, SEVERITIES.length);

      SEVERITIES.forEach((severity, i) => {
        assert
          .dom(selectors.rowWindow, rows[i])
          .hasText(windowText(policy[severity]));
        assert.dom(selectors.rowTimeInput, rows[i]).doesNotExist();
      });

      assert.dom(`${selectors.organization} ${selectors.info}`).doesNotExist();
    });

    test('it renders the project policy without reset controls', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.projectTitle)
        .hasText(t('overdueVulnerabilities.projectConfiguredAs'));

      assert
        .dom(selectors.projectDescription)
        .hasText(t('overdueVulnerabilities.projectPolicyDescription'));

      const rows = findAll(`${selectors.project} ${selectors.rows}`);
      const policy = this.projectPolicy();

      assert.strictEqual(rows.length, SEVERITIES.length);

      SEVERITIES.forEach((severity, i) => {
        assert
          .dom(selectors.rowWindow, rows[i])
          .hasText(windowText(policy[severity]));
      });

      assert
        .dom(
          `${selectors.project} ${selectors.row('medium')} ${selectors.rowWindow}`
        )
        .hasText(windowText(policy.medium));

      assert
        .dom(`${selectors.project} ${selectors.rowResetBtn}`)
        .doesNotExist();
    });

    test('a failed load notifies the error and shows no policy', async function (assert) {
      this.server.get(
        '/profiles/:id/sla_policy',
        () => new Response(404, {}, { detail: 'Not found.' })
      );

      await render(TEMPLATE);

      assert.strictEqual(this.notify.errorMsg, 'Not found.');
      assert.dom(selectors.project).doesNotExist();
    });
  }
);
