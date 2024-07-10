import { click, fillIn, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { Response } from 'miragejs';
import { selectChoose } from 'ember-power-select/test-support';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';
import Service from '@ember/service';
import { appEnvironment } from 'irene/helpers/app-environment';
import { appAction } from 'irene/helpers/app-action';
import styles from 'irene/components/ak-select/index.scss';

const classes = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

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
}

module(
  'Integration | Component | file-details/scan-actions-old/manual-scan',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      const store = this.owner.lookup('service:store');

      const profile = this.server.create('profile', { id: '100' });

      const file = this.server.create('file', {
        project: '1',
        profile: profile.id,
      });

      this.server.create('project', { file: file.id, id: '1' });

      const manualscan = this.server.create('manualscan', { id: file.id });

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        manualscan,
        store,
      });

      await this.owner.lookup('service:organization').load();
      this.owner.register('service:notifications', NotificationsStub);
    });

    test.each(
      'it renders different states of manual scan button',
      [
        { manual: ENUMS.MANUAL.NONE, done: false },
        { manual: ENUMS.MANUAL.NONE, done: false, disabled: true },
        { manual: ENUMS.MANUAL.REQUESTED, done: false },
        { manual: ENUMS.MANUAL.REQUESTED, done: true },
        { manual: ENUMS.MANUAL.ASSESSING, done: false },
        { manual: ENUMS.MANUAL.ASSESSING, done: true },
      ],
      async function (assert, scan) {
        this.file.manual = scan.manual;
        this.file.isManualDone = scan.done;

        this.file.isActive = !scan.disabled;

        this.server.get('/manualscans/:id', (schema, req) => {
          return schema.manualscans.find(`${req.params.id}`)?.toJSON();
        });

        await render(hbs`
            <FileDetails::ScanActionsOld::ManualScan @file={{this.file}} />
        `);

        if (this.file.manual === ENUMS.MANUAL.ASSESSING) {
          assert
            .dom('[data-test-manualScan-statusBtn]')
            .hasText(
              this.file.isManualDone ? 't:completed:()' : 't:inProgress:()'
            );
        } else if (this.file.isManualRequested) {
          assert
            .dom('[data-test-manualScan-statusBtn]')
            .hasText(
              this.file.isManualDone ? 't:completed:()' : 't:requested:()'
            );
        } else {
          assert
            .dom('[data-test-manualScan-requestBtn]')
            [this.file.isActive ? 'isNotDisabled' : 'isDisabled']()
            .hasText('t:start:()');
        }
      }
    );

    test('it renders manual scan request access modal & send request', async function (assert) {
      this.file.manual = ENUMS.MANUAL.NONE;
      this.file.isManualDone = false;
      this.file.isActive = true;

      const organization = this.owner.lookup('service:organization');
      organization.selected.isTrial = true;

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/manualscans/:id', (schema, req) => {
        return schema.manualscans.find(`${req.params.id}`)?.toJSON();
      });

      this.server.post(
        '/organizations/:id/request_access',
        () => new Response(201)
      );

      await render(hbs`
        <FileDetails::ScanActionsOld::ManualScan @file={{this.file}} />
      `);

      assert
        .dom('[data-test-manualScan-requestBtn]')
        .isNotDisabled()
        .hasText('t:start:()');

      await click('[data-test-manualScan-requestBtn]');

      assert
        .dom('[data-test-ak-modal-header]')
        .hasText('t:modalCard.requestAccess.title:()');

      assert
        .dom('[data-test-confirmbox-description]')
        .hasText('t:modalCard.requestAccess.description:()');

      assert
        .dom('[data-test-confirmbox-confirmBtn]')
        .isNotDisabled()
        .hasText('t:modalCard.requestAccess.button:()');

      assert
        .dom('[data-test-confirmbox-cancelBtn]')
        .isNotDisabled()
        .hasText('t:cancel:()');

      // set manual to requested for reload
      this.server.db.files.update(this.file.id, {
        manual: ENUMS.MANUAL.REQUESTED,
      });

      await click('[data-test-confirmbox-confirmBtn]');

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.successMsg, 't:accessRequested:()');
      assert.dom('[data-test-ak-modal-header]').doesNotExist();
      assert.dom('[data-test-manualScan-statusBtn]').hasText('t:requested:()');
    });

    test('it renders manual scan modal & send request', async function (assert) {
      assert.expect(77);

      this.file.manual = ENUMS.MANUAL.NONE;
      this.file.isManualDone = false;
      this.file.isActive = true;

      const manualscan = this.server.db.manualscans.update(this.file.id, {
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

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
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

      await render(hbs`
        <FileDetails::ScanActionsOld::ManualScan @file={{this.file}} />
      `);

      assert
        .dom('[data-test-manualScan-requestBtn]')
        .isNotDisabled()
        .hasText('t:start:()');

      await click('[data-test-manualScan-requestBtn]');

      assert
        .dom('[data-test-ak-modal-header]')
        .hasText('t:modalCard.manual.title:()');

      assert
        .dom('[data-test-manualScanModal-description]')
        .hasText('t:modalCard.manual.description:()');

      const accordions = findAll('[data-test-ak-accordion]');

      assert.strictEqual(accordions.length, 3);

      assert
        .dom('[data-test-ak-accordion-summary]', accordions[0])
        .hasText('t:modalCard.manual.basicAppInfo:()');

      assert
        .dom('[data-test-manualScanBasicInfo-appEnvLabel]', accordions[0])
        .hasText('t:modalCard.manual.appEnv:()');

      assert
        .dom(
          `[data-test-manualScanBasicInfo-appEnvSelect] .${classes.trigger}`,
          accordions[0]
        )
        .hasText(`t:${appEnvironment([ENUMS.APP_ENV.NO_PREFERENCE])}:()`);

      assert
        .dom('[data-test-manualScanBasicInfo-minOSVersionLabel]', accordions[0])
        .hasText('t:minOSVersion:()');

      assert
        .dom('[data-test-manualScanBasicInfo-minOSVersionInput]', accordions[0])
        .isNotDisabled()
        .hasValue(`${manualscan.min_os_version}`);

      assert
        .dom('[data-test-manualScanBasicInfo-appQuestion1Label]', accordions[0])
        .hasText('t:modalCard.manual.appQuestion1:()');

      assert
        .dom(
          `[data-test-manualScanBasicInfo-appQuestion1Select] .${classes.trigger}`,
          accordions[0]
        )
        .hasText(`t:${appAction([ENUMS.APP_ACTION.NO_PREFERENCE])}:()`);

      assert
        .dom('[data-test-manualScanBasicInfo-pocLabel]', accordions[0])
        .hasText('t:modalCard.manual.poc:()');

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
        .hasText('t:modalCard.manual.loginDetails:()');

      await click(
        accordions[1].querySelector('[data-test-ak-accordion-summary]')
      );

      assert
        .dom(
          '[data-test-manualScanLoginDetails-loginRequiredLabel]',
          accordions[1]
        )
        .hasText('t:modalCard.manual.loginRequired:()');

      assert
        .dom(
          `[data-test-manualScanLoginDetails-loginRequiredSelect] .${classes.trigger}`,
          accordions[1]
        )
        .hasText('t:no:()');

      assert
        .dom(
          '[data-test-manualScanLoginDetails-userRoleDetailsContainer]',
          accordions[1]
        )
        .doesNotExist();

      // vpn detail
      assert
        .dom('[data-test-ak-accordion-summary]', accordions[2])
        .hasText('t:modalCard.manual.vpnDetails:()');

      await click(
        accordions[2].querySelector('[data-test-ak-accordion-summary]')
      );

      assert
        .dom('[data-test-manualScanVpnDetails-vpnRequiredLabel]', accordions[2])
        .hasText('t:modalCard.manual.vpnRequired:()');

      assert
        .dom(
          `[data-test-manualScanVpnDetails-vpnRequiredSelect] .${classes.trigger}`,
          accordions[2]
        )
        .hasText('t:no:()');

      assert
        .dom('[data-test-manualScanVpnDetails-detailsContainer]', accordions[2])
        .doesNotExist();

      assert
        .dom('[data-test-manualScanModal-additionalCommentLabel]')
        .hasText('t:modalCard.manual.additionalComments:()');

      assert
        .dom('[data-test-manualScanModal-additionalCommentInput]')
        .isNotDisabled()
        .hasValue(manualscan.additional_comments);

      assert
        .dom('[data-test-manualScanModal-requestBtn]')
        .isNotDisabled()
        .hasText('t:modalCard.manual.title:()');

      assert
        .dom('[data-test-manualScanModal-cancelBtn]')
        .isNotDisabled()
        .hasText('t:cancel:()');

      // set manual scan details
      // basic info
      await selectChoose(
        accordions[0].querySelector(
          `[data-test-manualScanBasicInfo-appEnvSelect] .${classes.trigger}`
        ),
        `t:${appEnvironment([this.appEnv])}:()`
      );

      await fillIn(
        '[data-test-manualScanBasicInfo-minOSVersionInput]',
        this.minOsVersion
      );

      await selectChoose(
        accordions[0].querySelector(
          `[data-test-manualScanBasicInfo-appquestion1select] .${classes.trigger}`
        ),
        `t:${appAction([this.appAction])}:()`
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
      await selectChoose(
        accordions[1].querySelector(
          `[data-test-manualScanLoginDetails-loginRequiredSelect] .${classes.trigger}`
        ),
        't:yes:()'
      );

      assert
        .dom(
          '[data-test-manualScanLoginDetails-userRoleDetailsContainer]',
          accordions[1]
        )
        .exists();

      assert
        .dom('[data-test-manualScanLoginDetails-detailsLabel]', accordions[1])
        .hasText('t:modalCard.manual.enterLoginDetails:()');

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
        .hasText('t:modalCard.manual.addUserRole:()');

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

      assert.dom(userRoleHeaderCells[0]).hasText('t:username:()');
      assert.dom(userRoleHeaderCells[1]).hasText('t:role:()');
      assert.dom(userRoleHeaderCells[2]).hasText('t:password:()');
      assert.dom(userRoleHeaderCells[3]).hasText('t:action:()');

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
      await selectChoose(
        accordions[2].querySelector(
          `[data-test-manualScanVpnDetails-vpnRequiredSelect] .${classes.trigger}`
        ),
        't:yes:()'
      );

      assert
        .dom('[data-test-manualScanVpnDetails-detailsContainer]', accordions[2])
        .exists();

      assert
        .dom('[data-test-manualScanVpnDetails-detailsLabel]', accordions[2])
        .hasText('t:modalCard.manual.enterVPNDetails:()');

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
        .hasText('t:modalCard.manual.enterCredentails:()');

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

      await fillIn(
        '[data-test-manualScanModal-additionalCommentInput]',
        this.additionalComments
      );

      // manually set to requested to mimic backend
      this.server.db.files.update(this.file.id, {
        manual: ENUMS.MANUAL.REQUESTED,
      });

      await click('[data-test-manualScanModal-requestBtn]');

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.infoMsg, 't:manualRequested:()');
      assert.dom('[data-test-ak-modal-header]').doesNotExist();
      assert.dom('[data-test-manualScan-statusBtn]').hasText('t:requested:()');
    });
  }
);
