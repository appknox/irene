import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, waitFor, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';

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
  @tracked SubmissionCounter = 0;
}

const menuItems = ({
  analytics,
  appMonitoring,
  market,
  billing,
  partner,
  security,
}) =>
  [
    { label: 't:projects:()', icon: 'folder', hasBadge: true },
    appMonitoring && { label: 't:appMonitoring:()', icon: 'inventory-2' },
    analytics && { label: 't:analytics:()', icon: 'graphic-eq' },
    { label: 't:organization:()', icon: 'people' },
    { label: 't:accountSettings:()', icon: 'account-box' },
    market && { label: 't:marketplace:()', icon: 'account-balance' },
    billing && { label: 't:billing:()', icon: 'credit-card' },
    partner && {
      label: 't:clients:()',
      icon: 'groups-2',
      hasBadge: true,
      badgeLabel: 't:beta:()',
    },
    security && { label: 't:securityDashboard:()', icon: 'security' },
  ].filter(Boolean);

const sections = (enabled) => ({
  billing: enabled,
  appMonitoring: enabled,
  market: enabled,
  partner: enabled,
  security: enabled,
});

module(
  'Integration | Component | home-page/organization-dashboard/side-nav',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      const submissions = this.server.createList('submission', 2, {
        status: ENUMS.SUBMISSION_STATUS.VALIDATING,
      });

      const store = this.owner.lookup('service:store');

      const organizationMe = store.createRecord('organization-me', {
        is_owner: true,
        is_admin: true,
      });

      class OrganizationMeStub extends Service {
        org = organizationMe;
      }

      await this.owner.lookup('service:organization').load();

      this.owner.register('service:me', OrganizationMeStub);
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:realtime', RealtimeStub);

      const organization = this.owner.lookup('service:organization');

      this.setProperties({
        organization: organization,
        submissions,
      });
    });

    test.each(
      'it should render org-side-menu',
      [
        { owner: true, admin: true, ...sections(true) },
        { owner: true, admin: true, ...sections(false) },
        { owner: false, admin: true, ...sections(true) },
        { owner: false, admin: true, ...sections(false) },
        { owner: false, admin: false, ...sections(true) },
        { owner: false, admin: false, ...sections(false) },
      ],
      async function (
        assert,
        { owner, admin, billing, partner, market, appMonitoring, security }
      ) {
        this.server.get('/submissions', () => {
          return [];
        });

        this.setProperties({
          isSecurityEnabled: security,
        });

        const me = this.owner.lookup('service:me');

        me.org.is_owner = owner;
        me.org.is_admin = admin;
        me.org.can_access_partner_dashboard = partner;

        ENV.enableMarketplace = market;

        this.organization.selected.billingHidden = !billing;
        this.organization.selected.features = { app_monitoring: appMonitoring };

        await render(
          hbs`<HomePage::OrganizationDashboard::SideNav @isSecurityEnabled={{this.isSecurityEnabled}} />`
        );

        assert.dom('[data-test-img-logo]').exists();

        const menuItemEle = findAll('[data-test-side-menu-item]');

        menuItems({
          analytics: owner || admin,
          billing: owner && billing,
          market,
          appMonitoring,
          partner,
          security,
        }).forEach((it, index) => {
          assert
            .dom('[data-test-side-menu-item-icon]', menuItemEle[index])
            .hasClass(`ak-icon-${it.icon}`);

          assert
            .dom('[data-test-side-menu-item-text]', menuItemEle[index])
            .hasText(it.label);

          if (it.hasBadge) {
            assert
              .dom('[data-test-side-menu-item-badge]', menuItemEle[index])
              .exists()
              .hasText(
                it.badgeLabel ||
                  String(this.organization.selected.projectsCount)
              );
          }
        });
      }
    );

    test('it renders submission-list on first render', async function (assert) {
      this.server.get('/submissions', (schema) => {
        return schema.submissions.all().models;
      });

      await render(hbs`<HomePage::OrganizationDashboard::SideNav />`);

      assert.dom('[data-test-submission-list-title]').hasText('t:status:()');

      const details = findAll('[data-test-submission-list-detail]');

      assert.strictEqual(details.length, 2);

      this.submissions.forEach((s, i) => {
        assert
          .dom('[data-test-submission-status-detail]', details[i])
          .hasClass('is-progress');

        assert
          .dom('[data-test-submission-status-reason]', details[i])
          .hasText(s.reason);
      });
    });

    test('test submission-list triggers based on realtime submission counter', async function (assert) {
      const realtime = this.owner.lookup('service:realtime');

      this.server.get('/submissions', (schema) => {
        if (realtime.SubmissionCounter === 1) {
          return schema.submissions.all().models;
        }

        if (realtime.SubmissionCounter === 2) {
          const models = schema.submissions.all().models;

          models[1].status = ENUMS.SUBMISSION_STATUS.ANALYZING;

          return models;
        }

        return [];
      });

      await render(hbs`<HomePage::OrganizationDashboard::SideNav />`);

      assert.dom('[data-test-submission-list-title]').doesNotExist();
      assert.dom('[data-test-submission-list-detail]').doesNotExist();

      realtime.incrementProperty('SubmissionCounter');

      // wait for api
      await waitFor('[data-test-submission-list-title]', { timeout: 2000 });

      assert.dom('[data-test-submission-list-title]').hasText('t:status:()');

      const details = findAll('[data-test-submission-list-detail]');

      assert.strictEqual(details.length, 2);

      this.submissions.forEach((s, i) => {
        assert
          .dom('[data-test-submission-status-detail]', details[i])
          .hasClass('is-progress');

        assert
          .dom('[data-test-submission-status-reason]', details[i])
          .hasText(s.reason);
      });

      realtime.incrementProperty('SubmissionCounter');

      // wait for api
      await waitUntil(
        () => findAll('[data-test-submission-list-detail]').length == 1,
        { timeout: 2000 }
      );

      const updatedDetails = findAll('[data-test-submission-list-detail]');

      assert.strictEqual(updatedDetails.length, 1);

      assert
        .dom('[data-test-submission-status-detail]')
        .hasClass('is-progress');

      assert
        .dom('[data-test-submission-status-reason]')
        .hasText(this.submissions[0].reason);
    });
  }
);
