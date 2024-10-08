import {
  click,
  currentURL,
  find,
  findAll,
  fillIn,
  visit,
} from '@ember/test-helpers';

import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRequiredEndpoints } from '../../helpers/acceptance-utils';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { Response } from 'miragejs';
import { selectChoose } from 'ember-power-select/test-support';
import { t } from 'ember-intl/test-support';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';
import { appEnvironment } from 'irene/helpers/app-environment';
import { appAction } from 'irene/helpers/app-action';
import styles from 'irene/components/ak-select/index.scss';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';

const classes = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isPendoEnabled() {
    return false;
  }

  isCrispEnabled() {
    return false;
  }
}

class WebsocketStub extends Service {
  async connect() {}

  async configure() {}
}

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  infoMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  info(msg) {
    this.infoMsg = msg;
  }

  setDefaultAutoClear() {}
}

module('Acceptance | file-details/manual-scan', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { vulnerabilities, organization } = await setupRequiredEndpoints(
      this.server
    );

    const analyses = vulnerabilities.map((v, id) =>
      this.server.create('analysis', { id, vulnerability: v.id }).toJSON()
    );

    const profile = this.server.create('profile', { id: '1' });

    const project = this.server.create('project', {
      active_profile_id: profile.id,
    });

    const file = this.server.create('file', {
      is_static_done: true,
      is_dynamic_done: true,
      is_manual_done: false,
      manual: ENUMS.MANUAL.NONE,
      is_active: true,
      dynamic_status: ENUMS.DYNAMIC_STATUS.NONE,
      project: project.id,
      profile: profile.id,
      analyses,
    });

    const manualscan = this.server.create('manualscan', { id: file.id });

    this.server.create('project', {
      file: file.id,
      id: '1',
      platform: ENUMS.PLATFORM.ANDROID,
    });

    // service stubs
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    // server api interception
    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.setProperties({
      file,
      manualscan,
      organization,
      store: this.owner.lookup('service:store'),
    });
  });

  test('it renders manual scan request access view & send request', async function (assert) {
    this.organization.update({
      is_trial: true,
    });

    this.server.get('/manualscans/:id', (schema, req) => {
      return schema.manualscans.find(`${req.params.id}`)?.toJSON();
    });

    this.server.post(
      '/organizations/:id/request_access',
      () => new Response(201)
    );

    await visit(`/dashboard/file/${this.file.id}/manual-scan`);

    assert
      .dom('[data-test-fileDetails-manualScan-breadcrumbContainer]')
      .exists();

    assert.dom('[data-test-fileDetailsSummary-root]').exists();

    assert
      .dom('[data-test-fileDetails-manualScan-tabs="manual-scan-tab"]')
      .hasText(t('manualScan'));

    assert
      .dom('[data-test-fileDetails-manualScan-requestAccess-container]')
      .exists();

    assert.dom('[data-test-fileDetails-manualScan-requestAccess-svg]').exists();

    assert
      .dom('[data-test-fileDetails-manualScan-requestAccess-title]')
      .hasText(t('modalCard.requestAccess.description'));

    assert
      .dom('[data-test-fileDetails-manualScan-requestAccess-description]')
      .hasText(t('modalCard.requestAccess.helperText'));

    assert
      .dom('[data-test-fileDetails-manualScan-requestAccess-requestBtn]')
      .isNotDisabled()
      .hasText(t('modalCard.requestAccess.title'));

    // set manual to requested for reload
    this.server.db.files.update(this.file.id, {
      manual: ENUMS.MANUAL.REQUESTED,
    });

    await click('[data-test-fileDetails-manualScan-requestAccess-requestBtn]');

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(notify.successMsg, t('accessRequested'));

    assert
      .dom('[data-test-fileDetails-manualScan-requestAccess-container]')
      .doesNotExist();

    // requested status
    assert
      .dom('[data-test-fileDetails-manualScan-progressStatus-container]')
      .exists();

    assert
      .dom(
        `[data-test-fileDetails-manualScan-progressStatus-svg="in-progress"]`
      )
      .exists();

    assert
      .dom('[data-test-fileDetails-manualScan-progressStatus-title]')
      .hasText(t('requested'));

    assert
      .dom('[data-test-fileDetails-manualScan-progressStatus-description]')
      .hasText(t('modalCard.manual.requestSubmittedDescription'));
  });

  test('it renders manual scan request form & send request', async function (assert) {
    assert.expect(82);

    const manualscan = this.manualscan.update({
      app_env: ENUMS.APP_ENV.NO_PREFERENCE,
      min_os_version: '',
      app_action: ENUMS.APP_ACTION.NO_PREFERENCE,
      login_required: false,
      vpn_required: false,
      additional_comments: '',
    });

    // values for manualscan request
    this.setProperties({
      appEnv: ENUMS.APP_ENV.PRODUCTION,
      minOsVersion: 10,
      appAction: ENUMS.APP_ACTION.HALT,
      contactName: 'test',
      contactEmail: 'test@mail.com',
      userRoles: [
        {
          role: 'test_role',
          username: 'test_name',
          password: faker.internet.password(),
        },
      ],
      vpnDetails: {
        address: faker.internet.ip(),
        port: faker.internet.port(),
        username: 'test_vpn_name',
        password: faker.internet.password(),
      },
      additionalComments: 'comment',
    });

    this.server.get('/manualscans/:id', (schema, req) => {
      return schema.manualscans.find(`${req.params.id}`)?.toJSON();
    });

    this.server.put('manualscans/:id', (_, req) => {
      const data = JSON.parse(req.requestBody);

      assert.strictEqual(data.app_env, this.appEnv);
      assert.strictEqual(data.min_os_version, `${this.minOsVersion}`);
      assert.strictEqual(data.app_action, this.appAction);
      assert.true(data.login_required);

      this.userRoles.forEach((ur, i) => {
        assert.strictEqual(data.user_roles[i].role, ur.role);
        assert.strictEqual(data.user_roles[i].username, ur.username);
        assert.strictEqual(data.user_roles[i].password, ur.password);
      });

      assert.true(data.vpn_required);
      assert.strictEqual(data.contact.name, this.contactName);
      assert.strictEqual(data.contact.email, this.contactEmail);
      assert.strictEqual(data.additional_comments, this.additionalComments);

      return new Response(201);
    });

    await visit(`/dashboard/file/${this.file.id}/manual-scan`);

    assert
      .dom('[data-test-fileDetails-manualScan-breadcrumbContainer]')
      .exists();

    assert.dom('[data-test-fileDetailsSummary-root]').exists();

    assert.dom('[data-test-fileDetails-manualScan-tabs]').doesNotExist();

    assert
      .dom('[data-test-manualScanRequestForm-title]')
      .hasText(t('modalCard.manual.title'));

    assert
      .dom('[data-test-manualScanRequestForm-description]')
      .hasText(t('modalCard.manual.description'));

    const accordions = findAll('[data-test-ak-accordion]');

    assert.strictEqual(accordions.length, 4);

    assert
      .dom('[data-test-ak-accordion-summary]', accordions[0])
      .hasText(t('modalCard.manual.basicAppInfo'));

    assert
      .dom('[data-test-manualScanBasicInfo-appEnvLabel]', accordions[0])
      .hasText(t('modalCard.manual.appEnv'));

    assert
      .dom(
        `[data-test-manualScanBasicInfo-appEnvSelect] .${classes.trigger}`,
        accordions[0]
      )
      .hasText(t(appEnvironment([ENUMS.APP_ENV.NO_PREFERENCE])));

    assert
      .dom('[data-test-manualScanBasicInfo-minOSVersionLabel]', accordions[0])
      .hasText(t('minOSVersion'));

    assert
      .dom('[data-test-manualScanBasicInfo-minOSVersionInput]', accordions[0])
      .isNotDisabled()
      .hasValue(`${manualscan.min_os_version}`);

    assert
      .dom('[data-test-manualScanBasicInfo-appQuestion1Label]', accordions[0])
      .hasText(t('modalCard.manual.appQuestion1'));

    assert
      .dom(
        `[data-test-manualScanBasicInfo-appQuestion1Select] .${classes.trigger}`,
        accordions[0]
      )
      .hasText(t(appAction([ENUMS.APP_ACTION.NO_PREFERENCE])));

    assert
      .dom('[data-test-manualScanBasicInfo-pocLabel]', accordions[0])
      .hasText(t('modalCard.manual.poc'));

    assert
      .dom('[data-test-manualScanBasicInfo-pocNameInput]', accordions[0])
      .isNotDisabled()
      .hasValue(manualscan.contact.name);

    assert
      .dom('[data-test-manualScanBasicInfo-pocEmailInput]', accordions[0])
      .isNotDisabled()
      .hasValue(manualscan.contact.email);

    // login details
    assert
      .dom('[data-test-ak-accordion-summary]', accordions[1])
      .hasText(t('modalCard.manual.loginDetails'));

    await click(
      accordions[1].querySelector('[data-test-ak-accordion-summary]')
    );

    assert
      .dom(
        '[data-test-manualScanLoginDetails-loginRequiredLabel]',
        accordions[1]
      )
      .hasText(t('modalCard.manual.loginRequired'));

    assert
      .dom(
        `[data-test-manualScanLoginDetails-loginRequiredSelect] .${classes.trigger}`,
        accordions[1]
      )
      .hasText(t('no'));

    assert
      .dom(
        '[data-test-manualScanLoginDetails-userRoleDetailsContainer]',
        accordions[1]
      )
      .doesNotExist();

    // vpn detail
    assert
      .dom('[data-test-ak-accordion-summary]', accordions[2])
      .hasText(t('modalCard.manual.vpnDetails'));

    await click(
      accordions[2].querySelector('[data-test-ak-accordion-summary]')
    );

    assert
      .dom('[data-test-manualScanVpnDetails-vpnRequiredLabel]', accordions[2])
      .hasText(t('modalCard.manual.vpnRequired'));

    assert
      .dom(
        `[data-test-manualScanVpnDetails-vpnRequiredSelect] .${classes.trigger}`,
        accordions[2]
      )
      .hasText(t('no'));

    assert
      .dom('[data-test-manualScanVpnDetails-detailsContainer]', accordions[2])
      .doesNotExist();

    // additional comments
    assert
      .dom('[data-test-ak-accordion-summary]', accordions[3])
      .hasText(t('modalCard.manual.additionalComments'));

    await click(
      accordions[3].querySelector('[data-test-ak-accordion-summary]')
    );

    assert
      .dom('[data-test-manualScan-additionalCommentInput]')
      .isNotDisabled()
      .hasValue(manualscan.additional_comments);

    // request form footer
    assert.dom('[data-test-fileDetails-manualScanFooter]').exists();

    assert
      .dom('[data-test-fileDetails-manualScanFooter-requestTitle]')
      .hasText(t('modalCard.manual.title'));

    assert
      .dom('[data-test-fileDetails-manualScanFooter-requestSubmitBtn]')
      .isNotDisabled()
      .hasText(t('submit'));

    // set manual scan details
    // basic info
    await click(
      accordions[0].querySelector('[data-test-ak-accordion-summary]')
    );

    await selectChoose(
      accordions[0].querySelector(
        `[data-test-manualScanBasicInfo-appEnvSelect] .${classes.trigger}`
      ),
      t(appEnvironment([this.appEnv]))
    );

    await fillIn(
      '[data-test-manualScanBasicInfo-minOSVersionInput]',
      this.minOsVersion
    );

    await selectChoose(
      accordions[0].querySelector(
        `[data-test-manualScanBasicInfo-appquestion1select] .${classes.trigger}`
      ),
      t(appAction([this.appAction]))
    );

    await fillIn(
      '[data-test-manualScanBasicInfo-pocNameInput]',
      this.contactName
    );

    await fillIn(
      '[data-test-manualScanBasicInfo-pocEmailInput]',
      this.contactEmail
    );

    // login details
    await click(
      accordions[1].querySelector('[data-test-ak-accordion-summary]')
    );

    await selectChoose(
      accordions[1].querySelector(
        `[data-test-manualScanLoginDetails-loginRequiredSelect] .${classes.trigger}`
      ),
      t('yes')
    );

    assert
      .dom(
        '[data-test-manualScanLoginDetails-userRoleDetailsContainer]',
        accordions[1]
      )
      .exists();

    assert.strictEqual(
      accordions[1]
        .querySelector('[data-test-manualScanLoginDetails-detailsLabel]')
        .innerHTML.trim(),
      t('modalCard.manual.enterLoginDetails')
    );

    assert
      .dom('[data-test-manualScanLoginDetails-roleInput]', accordions[1])
      .hasNoValue();

    assert
      .dom('[data-test-manualScanLoginDetails-usernameInput]', accordions[1])
      .hasNoValue();

    assert
      .dom('[data-test-manualScanLoginDetails-passwordInput]', accordions[1])
      .hasNoValue();

    assert
      .dom('[data-test-manualScanLoginDetails-addRoleBtn]', accordions[1])
      .isNotDisabled()
      .hasText(t('modalCard.manual.addUserRole'));

    assert
      .dom('[data-test-manualScanLoginDetails-userRole-table]', accordions[1])
      .doesNotExist();

    for (const ur of this.userRoles) {
      await fillIn(
        accordions[1].querySelector(
          '[data-test-manualScanLoginDetails-roleInput]'
        ),
        ur.role
      );

      await fillIn(
        accordions[1].querySelector(
          '[data-test-manualScanLoginDetails-usernameInput]'
        ),
        ur.username
      );

      await fillIn(
        accordions[1].querySelector(
          '[data-test-manualScanLoginDetails-passwordInput]'
        ),
        ur.password
      );

      await click(
        accordions[1].querySelector(
          '[data-test-manualScanLoginDetails-addRoleBtn]'
        )
      );
    }

    assert
      .dom('[data-test-manualScanLoginDetails-userRole-table]', accordions[1])
      .exists();

    const userRoleHeaderCells = accordions[1].querySelectorAll(
      '[data-test-manualScanLoginDetails-userRole-thead] th'
    );

    assert.strictEqual(userRoleHeaderCells.length, 4);

    assert.dom(userRoleHeaderCells[0]).hasText(t('username'));
    assert.dom(userRoleHeaderCells[1]).hasText(t('role'));
    assert.dom(userRoleHeaderCells[2]).hasText(t('password'));
    assert.dom(userRoleHeaderCells[3]).hasText(t('action'));

    const userRoleRows = accordions[1].querySelectorAll(
      '[data-test-manualScanLoginDetails-userRole-row]'
    );

    assert.strictEqual(userRoleRows.length, this.userRoles.length);

    const firstRowCells = userRoleRows[0].querySelectorAll(
      '[data-test-manualScanLoginDetails-userRole-cell]'
    );

    assert.dom(firstRowCells[0]).hasText(this.userRoles[0].username);
    assert.dom(firstRowCells[1]).hasText(this.userRoles[0].role);
    assert.dom(firstRowCells[2]).hasText(this.userRoles[0].password);

    assert
      .dom(
        '[data-test-manualScanLoginDetails-userRole-deleteBtn]',
        firstRowCells[3]
      )
      .isNotDisabled();

    // vpn details
    await click(
      accordions[2].querySelector('[data-test-ak-accordion-summary]')
    );

    await selectChoose(
      accordions[2].querySelector(
        `[data-test-manualScanVpnDetails-vpnRequiredSelect] .${classes.trigger}`
      ),
      t('yes')
    );

    assert
      .dom('[data-test-manualScanVpnDetails-detailsContainer]', accordions[2])
      .exists();

    assert
      .dom('[data-test-manualScanVpnDetails-detailsLabel]', accordions[2])
      .hasText(t('modalCard.manual.enterVPNDetails'));

    assert
      .dom('[data-test-manualScanVpnDetails-vpnAddressInput]', accordions[2])
      .isNotDisabled()
      .hasNoValue();

    assert
      .dom('[data-test-manualScanVpnDetails-vpnPortInput]', accordions[2])
      .isNotDisabled()
      .hasNoValue();

    assert
      .dom('[data-test-manualScanVpnDetails-credentialsLabel]', accordions[2])
      .hasText(t('modalCard.manual.enterCredentails'));

    assert
      .dom('[data-test-manualScanVpnDetails-usernameInput]', accordions[2])
      .isNotDisabled()
      .hasNoValue();

    assert
      .dom('[data-test-manualScanVpnDetails-passwordInput]', accordions[2])
      .isNotDisabled()
      .hasNoValue();

    await fillIn(
      accordions[2].querySelector(
        '[data-test-manualScanVpnDetails-vpnAddressInput]'
      ),
      this.vpnDetails.address
    );

    await fillIn(
      accordions[2].querySelector(
        '[data-test-manualScanVpnDetails-vpnPortInput]'
      ),
      this.vpnDetails.port
    );

    await fillIn(
      accordions[2].querySelector(
        '[data-test-manualScanVpnDetails-usernameInput]'
      ),
      this.vpnDetails.username
    );

    await fillIn(
      accordions[2].querySelector(
        '[data-test-manualScanVpnDetails-passwordInput]'
      ),
      this.vpnDetails.password
    );

    // additional comments
    await click(
      accordions[3].querySelector('[data-test-ak-accordion-summary]')
    );

    await fillIn(
      '[data-test-manualScan-additionalCommentInput]',
      this.additionalComments
    );

    // manually set to requested to mimic backend
    this.file.update({
      manual: ENUMS.MANUAL.REQUESTED,
    });

    await click('[data-test-fileDetails-manualScanFooter-requestSubmitBtn]');

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(notify.infoMsg, t('manualRequested'));
    assert.dom('[data-test-manualScanRequestForm-container]').doesNotExist();
    assert.dom('[data-test-fileDetails-manualScan-tabs]').exists();

    // requested status
    assert
      .dom('[data-test-fileDetails-manualScan-progressStatus-container]')
      .exists();

    assert
      .dom(
        `[data-test-fileDetails-manualScan-progressStatus-svg="in-progress"]`
      )
      .exists();

    assert
      .dom('[data-test-fileDetails-manualScan-progressStatus-title]')
      .hasText(t('requested'));

    assert
      .dom('[data-test-fileDetails-manualScan-progressStatus-description]')
      .hasText(t('modalCard.manual.requestSubmittedDescription'));
  });

  test.each(
    'test manual scan status',
    [ENUMS.MANUAL.REQUESTED, ENUMS.MANUAL.ASSESSING, ENUMS.MANUAL.DONE],
    async function (assert, status) {
      this.file.update({
        manual: status,
        is_manual_done: status === ENUMS.MANUAL.DONE,
      });

      this.server.get('/manualscans/:id', (schema, req) => {
        return schema.manualscans.find(`${req.params.id}`)?.toJSON();
      });

      await visit(`/dashboard/file/${this.file.id}/manual-scan`);

      assert
        .dom('[data-test-fileDetails-manualScan-breadcrumbContainer]')
        .exists();

      assert.dom('[data-test-fileDetailsSummary-root]').exists();

      assert
        .dom('[data-test-fileDetails-manualScan-tabs="manual-scan-tab"]')
        .hasText(t('manualScan'));

      assert
        .dom('[data-test-fileDetails-manualScan-progressStatus-container]')
        .exists();

      assert
        .dom(
          `[data-test-fileDetails-manualScan-progressStatus-svg="${this.file.is_manual_done ? 'completed' : 'in-progress'}"]`
        )
        .exists();

      if (status === ENUMS.MANUAL.REQUESTED) {
        assert
          .dom('[data-test-fileDetails-manualScan-progressStatus-title]')
          .hasText(t('requested'));

        assert
          .dom('[data-test-fileDetails-manualScan-progressStatus-description]')
          .hasText(t('modalCard.manual.requestSubmittedDescription'));
      }

      if (status === ENUMS.MANUAL.ASSESSING) {
        assert
          .dom('[data-test-fileDetails-manualScan-progressStatus-title]')
          .hasText(t('scanInProgress'));

        assert
          .dom('[data-test-fileDetails-manualScan-progressStatus-description]')
          .hasText(t('modalCard.manual.scanInProgressDescription'));
      }

      if (this.file.is_manual_done) {
        assert
          .dom('[data-test-fileDetails-manualScan-progressStatus-title]')
          .hasText(t('manualScan'));

        assert
          .dom('[data-test-fileDetails-manualScan-progressStatus-Chip]')
          .hasText(t('chipStatus.completed'));

        assert.strictEqual(
          find(
            '[data-test-fileDetails-manualScan-progressStatus-helperText]'
          ).innerHTML.trim(),
          t('modalCard.manual.viewResultsInTab').toString().trim()
        );
      }
    }
  );

  test('it should navigate properly on tab click', async function (assert) {
    this.file.update({
      manual: ENUMS.MANUAL.COMPLETED,
      is_manual_done: true,
    });

    this.server.get('/manualscans/:id', (schema, req) => {
      return schema.manualscans.find(`${req.params.id}`)?.toJSON();
    });

    await visit(`/dashboard/file/${this.file.id}/manual-scan`);

    const file = this.store.peekRecord('file', this.file.id);

    const tabLink = (id) =>
      `[data-test-fileDetails-manualScan-tabs="${id}-tab"] a`;

    assert
      .dom(tabLink('manual-scan'))
      .hasText(t('manualScan'))
      .hasClass(/active-shadow/);

    await click(tabLink('manual-results'));

    assert
      .dom(tabLink('manual-results'))
      .hasText(`${t('manualScanResults')} ${file.manualVulnerabilityCount}`)
      .hasClass(/active-shadow/);

    assert.strictEqual(
      currentURL(),
      `/dashboard/file/${this.file.id}/manual-scan/results`
    );

    await click(tabLink('manual-scan'));

    assert
      .dom(tabLink('manual-scan'))
      .hasText(t('manualScan'))
      .hasClass(/active-shadow/);

    assert.strictEqual(
      currentURL(),
      `/dashboard/file/${this.file.id}/manual-scan`
    );
  });

  test('it renders manual scan results', async function (assert) {
    this.file.update({
      manual: ENUMS.MANUAL.COMPLETED,
      is_manual_done: true,
    });

    this.server.get('/manualscans/:id', (schema, req) => {
      return schema.manualscans.find(`${req.params.id}`)?.toJSON();
    });

    await visit(`/dashboard/file/${this.file.id}/manual-scan/results`);

    assert
      .dom('[data-test-fileDetails-manualScan-breadcrumbContainer]')
      .exists();

    assert.dom('[data-test-fileDetailsSummary-root]').exists();

    assert
      .dom(
        "[data-test-fileDetails-manualScanResults-tabs='vulnerability-details-tab'] a"
      )
      .hasText(t('vulnerabilityDetails'))
      .hasClass(/active-line/);

    assert
      .dom('[data-test-fileDetails-manualScanResults-desc]')
      .hasText(t('modalCard.manual.resultsDescription'));

    // assert vulnerability table
    const headerCells = findAll('[data-test-vulnerability-analysis-thead] th');

    assert.strictEqual(headerCells.length, 2);

    assert.dom(headerCells[0]).hasText(t('impact'));
    assert.dom(headerCells[1]).hasText(t('title'));

    const rows = findAll('[data-test-vulnerability-analysis-row]');

    const file = this.store.peekRecord('file', this.file.id);

    const manualAnalyses = file.analyses.filter((a) =>
      a.hasType(ENUMS.VULNERABILITY_TYPE.MANUAL)
    );

    assert.strictEqual(rows.length, manualAnalyses.length);

    // assert first row
    const firstRowCells = rows[0].querySelectorAll(
      '[data-test-vulnerability-analysis-cell]'
    );

    const analyses = manualAnalyses
      .slice()
      .sort((a, b) => b.computedRisk - a.computedRisk); // sort by computedRisk:desc

    const { label } = analysisRiskStatus([
      String(analyses[0].computedRisk),
      String(analyses[0].status),
      analyses[0].isOverriddenRisk,
    ]);

    assert
      .dom('[data-test-analysisRiskTag-label]', firstRowCells[0])
      .hasText(label);

    assert.dom(firstRowCells[1]).hasText(analyses[0].vulnerability.get('name'));
  });

  test('it disables manual scan submit button for inactive file', async function (assert) {
    this.file.update({
      is_active: false,
    });

    this.server.get('/manualscans/:id', (schema, req) => {
      return schema.manualscans.find(`${req.params.id}`)?.toJSON();
    });

    this.server.post(
      '/organizations/:id/request_access',
      () => new Response(201)
    );

    await visit(`/dashboard/file/${this.file.id}/manual-scan`);

    const accordions = findAll('[data-test-ak-accordion]');

    assert.strictEqual(accordions.length, 4);

    assert
      .dom('[data-test-manualScanBasicInfo-minOSVersionInput]', accordions[0])
      .isDisabled();

    assert
      .dom('[data-test-manualScanBasicInfo-pocNameInput]', accordions[0])
      .isDisabled();

    assert
      .dom('[data-test-manualScanBasicInfo-pocEmailInput]', accordions[0])
      .isDisabled();

    await click(
      accordions[1].querySelector('[data-test-ak-accordion-summary]')
    );

    assert
      .dom(
        `[data-test-manualScanLoginDetails-loginRequiredSelect] .${classes.trigger}`
      )
      .hasAria('disabled', 'true');

    // vpn details
    await click(
      accordions[2].querySelector('[data-test-ak-accordion-summary]')
    );

    assert
      .dom(
        accordions[2].querySelector(
          `[data-test-manualScanVpnDetails-vpnRequiredSelect]
          .${classes.trigger}`
        )
      )
      .hasAria('disabled', 'true');

    // additional comments
    await click(
      accordions[3].querySelector('[data-test-ak-accordion-summary]')
    );

    assert.dom('[data-test-manualScan-additionalCommentInput]').isDisabled();

    assert
      .dom('[data-test-fileDetails-manualScanFooter-requestSubmitBtn]')
      .hasAttribute('disabled');
  });
});
