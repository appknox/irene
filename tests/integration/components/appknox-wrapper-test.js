import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, find, findAll, render } from '@ember/test-helpers';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';

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

class FreshdeskStub extends Service {
  supportWidgetIsEnabled = false;
  freshchatEnabled = true;
}

class ConfigurationStub extends Service {
  frontendData = {};
  themeData = {};
  imageData = {};
  serverData = { enterprise: false };
}

class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isPendoEnabled() {
    return false;
  }

  isCrispEnabled() {
    return true;
  }
}

const menuItems = ({
  privacy,
  appMonitoring,
  sbom,
  analytics,
  publicApis,
  market,
  billing,
  partner,
}) =>
  [
    {
      label: t('allProjects'),
      icon: 'folder',
      hasBadge: true,
    },
    privacy && { label: t('privacyModule.title'), icon: 'shield-outline' },
    appMonitoring && { label: t('appMonitoring'), icon: 'inventory-2' },
    sbom && { label: t('SBOM'), icon: 'receipt-long' },
    analytics && { label: t('analytics'), icon: 'graphic-eq' },
    { label: t('organization'), icon: 'group' },
    publicApis && { label: t('apiDocumentation') },
    { label: t('accountSettings'), icon: 'account-box' },
    market && { label: t('marketplace'), icon: 'account-balance' },
    billing && { label: t('billing'), icon: 'credit-card-outline' },
    partner && {
      label: t('clients'),
      icon: 'groups-2',
      hasBadge: true,
      badgeLabel: t('beta'),
    },
  ].filter(Boolean);

const sections = (enabled) => ({
  billing: enabled,
  appMonitoring: enabled,
  market: enabled,
  partner: enabled,
  sbom: enabled,
  publicApis: enabled,
  analytics: enabled,
  privacy: enabled,
});

const lowerMenuItems = [
  {
    title: () => t('chatSupport'),
    icon: 'chat-bubble',
    enabled: false,
  },
  {
    title: () => t('version'),
    icon: 'info',
    enabled: false,
  },
  {
    title: () => t('collapse'),
    icon: 'keyboard-tab',
  },
];

module('Integration | Component | appknox-wrapper', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');
  setupBrowserFakes(hooks, { window: true, localStorage: true });

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

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
    this.owner.register('service:freshdesk', FreshdeskStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:configuration', ConfigurationStub);

    const organization = this.owner.lookup('service:organization');

    const window = this.owner.lookup('service:browser/window');

    window.localStorage.clear();

    this.setProperties({
      title: t('vapt'),
      organization: organization,
      user: store.createRecord('user', this.server.create('user').toJSON()),
    });

    // handle submissions api for each test
    this.server.get('/submissions', () => []);
  });

  test.each(
    'test top nav and upload app status',
    [{ knowledgeBase: true, hasUploadAppStatus: true }, {}],
    async function (assert, { knowledgeBase, hasUploadAppStatus }) {
      const guideCategories = [
        {
          category: t('onboardingGuideModule.VA'),
          guides: [
            {
              id: 'va-guide',
              title: t('onboardingGuideModule.initiateVA'),
              url: 'https://appknox.portal.trainn.co/share/bEK4jmKvG16y1lqH9b9sPA/embed?mode=interactive',
            },
            {
              id: 'scan-results-guide',
              title: t('onboardingGuideModule.viewReports'),
              url: 'https://appknox.portal.trainn.co/share/gKJQU8gka8sX3ZLJD80CWg/embed?mode=interactive',
            },
            {
              id: 'invitation-guide',
              title: t('inviteUsers'),
              url: 'https://appknox.portal.trainn.co/share/bXBvltZ53ZpWxvrrhrqkbA/embed?mode=interactive',
            },
            {
              id: 'creating-teams-guide',
              title: t('onboardingGuideModule.createTeams'),
              url: 'https://appknox.portal.trainn.co/share/01VQVnUV64rjHIBsx6tzqQ/embed?mode=interactive',
            },
            {
              id: 'upload-access-guide',
              title: t('onboardingGuideModule.uploadAccess'),
              url: 'https://appknox.portal.trainn.co/share/FPsW0wVu5g6NtAZzHjrNrA/embed?mode=interactive',
            },
          ],
        },
        {
          category: t('SBOM'),
          guides: [
            {
              id: 'sbom-guide',
              title: t('onboardingGuideModule.generateSBOM'),
              url: 'https://appknox.portal.trainn.co/share/mMfpJY5qpu0czTtC4TKdtQ/embed?mode=interactive',
            },
          ],
        },
      ];

      const freshdesk = this.owner.lookup('service:freshdesk');

      freshdesk.supportWidgetIsEnabled = knowledgeBase;

      if (hasUploadAppStatus) {
        this.server.createList('submission', 2, {
          status: ENUMS.SUBMISSION_STATUS.VALIDATING,
        });

        this.server.get('/submissions', (schema) => {
          return schema.submissions.all().models;
        });
      }

      this.organization.selected.features = {
        upload_via_url: true,
      };

      await render(hbs`
        <AppknoxWrapper
          @user={{this.user}}
        />
      `);

      assert.dom('[data-test-topNav]').exists();

      // assert.dom('[data-test-topNav-title]').hasText(this.title);

      assert
        .dom('[data-test-topNav-startScanLabel]')
        .hasText(t('startNewScan'));

      assert.dom('[data-test-uploadApp-input]').exists();

      assert.dom('[data-test-uploadApp-uploadBtn]').hasText(t('uploadApp'));
      assert.dom('[data-test-uploadAppViaLink-btn]').isNotDisabled();

      if (hasUploadAppStatus) {
        assert.dom('[data-test-uploadAppStatus-loader]').exists();
        assert.dom('[data-test-uploadAppStatus-icon]').exists();
      } else {
        assert.dom('[data-test-uploadAppStatus-loader]').doesNotExist();
        assert.dom('[data-test-uploadAppStatus-icon]').doesNotExist();
      }

      // Onboarding guides
      assert.dom('[data-test-topNav-OnboardingGuideBtn]').exists();

      await click('[data-test-topNav-OnboardingGuideBtn]');

      assert
        .dom('[data-test-onboarding-guide-modal]')
        .exists()
        .containsText(t('onboardingGuides'));

      guideCategories.forEach((gCat) => {
        const category = find(
          `[data-test-onboarding-guide-category='${gCat.category}']`
        );

        assert.dom(category).hasText(gCat.category);

        gCat.guides.forEach((guide) => {
          const guideElem = find(
            `[data-test-onboarding-guide-list-item='${guide.id}']`
          );

          assert.dom(guideElem).hasText(guide.title);
        });
      });

      const defaultSelectedGuide = guideCategories[0].guides[0];

      assert
        .dom(`[data-test-onboarding-guide-iframe='${defaultSelectedGuide.id}']`)
        .exists();

      // Knowledge base
      if (knowledgeBase) {
        assert
          .dom('[data-test-topNav-KnowledgeBaseBtn]')
          .isNotDisabled()
          .hasText(t('knowledgeBase'));
      } else {
        assert.dom('[data-test-topNav-KnowledgeBaseBtn]').doesNotExist();
      }
    }
  );

  test('test knowledge base click', async function (assert) {
    assert.expect(5);

    const freshdesk = this.owner.lookup('service:freshdesk');

    freshdesk.supportWidgetIsEnabled = true;

    freshdesk.openSupportWidget = function () {
      assert.ok('Knowledge base clicked');
      assert.strictEqual(arguments.length, 0);
    };

    await render(hbs`
      <AppknoxWrapper
        @user={{this.user}}
      />
    `);

    assert.dom('[data-test-topNav]').exists();

    assert
      .dom('[data-test-topNav-KnowledgeBaseBtn]')
      .isNotDisabled()
      .hasText(t('knowledgeBase'));

    await click('[data-test-topNav-KnowledgeBaseBtn]');
  });

  test.each(
    'It should not show onboarding guide for enterprise',
    ['true', 'false'],
    async function (assert, isEnterprise) {
      const configuration = this.owner.lookup('service:configuration');
      configuration.serverData.enterprise = isEnterprise;

      await render(hbs`
        <AppknoxWrapper
          @user={{this.user}}
        />
      `);

      if (isEnterprise) {
        assert.dom('[data-test-topNav-OnboardingGuideBtn]').doesNotExist();
      } else {
        assert.dom('[data-test-topNav-OnboardingGuideBtn]').exists();

        await click('[data-test-topNav-OnboardingGuideBtn]');

        assert.dom('[data-test-onboarding-guide-modal]').exists();

        await click('[data-test-topNav-OnboardingGuideBtn]');

        assert.dom('[data-test-onboarding-guide-modal]').doesNotExist();
      }
    }
  );

  test.each(
    'it should render appknox side nav',
    [
      { owner: true, admin: true, ...sections(true) },
      { owner: true, admin: true, ...sections(false) },
      { owner: false, admin: true, ...sections(true) },
      { owner: false, admin: true, ...sections(false) },
      { owner: false, admin: false, ...sections(true) },
      { owner: false, admin: false, ...sections(false) },
    ],
    async function (assert, scenario) {
      const { owner, admin, ...sectionConfig } = scenario;
      const me = this.owner.lookup('service:me');
      const configuration = this.owner.lookup('service:configuration');

      configuration.serverData.enterprise = false;

      me.org.is_owner = owner;
      me.org.is_admin = admin;
      me.org.can_access_partner_dashboard = sectionConfig.partner;

      ENV.enableMarketplace = sectionConfig.market;

      this.organization.selected.billingHidden = !sectionConfig.billing;

      this.organization.selected.features = {
        app_monitoring: sectionConfig.appMonitoring,
        public_apis: sectionConfig.publicApis,
      };

      await render(hbs`<AppknoxWrapper @user={{this.user}} />`);

      assert.dom('[data-test-img-logo]').exists();

      const menuItemEle = findAll('[data-test-side-menu-item]');

      assert.dom('[data-test-side-lower-menu]').exists();

      assert.dom('[data-test-side-lower-menu-divider]').exists();

      const expandButton = find(`[
        data-test-side-lower-menu-item="${t('expand')}"
      ]`);

      await click(expandButton);

      menuItems({
        ...sectionConfig,
        analytics: owner || admin,
        billing: owner && sectionConfig.billing,
        sbom: true,
        privacy: true,
      }).forEach((it, index) => {
        if (it.icon) {
          assert
            .dom('[data-test-side-menu-item-icon]', menuItemEle[index])
            .hasAttribute('icon', `material-symbols:${it.icon}`);
        }

        assert
          .dom('[data-test-side-menu-item-text]', menuItemEle[index])
          .hasText(it.label);

        if (it.hasBadge) {
          assert
            .dom('[data-test-side-menu-item-badge]', menuItemEle[index])
            .exists()
            .hasText(
              it.badgeLabel || String(this.organization.selected.projectsCount)
            );
        }
      });

      const lowerMenuItemEle = findAll('[data-test-side-lower-menu-item]');

      lowerMenuItems.forEach((it, index) => {
        assert
          .dom('[data-test-side-lower-menu-item-text]', lowerMenuItemEle[index])
          .containsText(it.title());

        assert
          .dom('[data-test-side-lower-menu-item-icon]', lowerMenuItemEle[index])
          .hasAttribute('icon', `material-symbols:${it.icon}`);
      });

      const collapseButton = find(`[
        data-test-side-lower-menu-item="${t('collapse')}"
      ]`);

      assert.ok(collapseButton, 'Collapse button should exist');

      await click(collapseButton);

      assert.dom('[data-test-side-menu-item-text]').doesNotExist();

      assert.dom('[data-test-side-lower-menu-item-text]').doesNotExist();
    }
  );

  test.each(
    'it should render switcher modal',
    [
      { storeknox: true, aiFeatures: { reporting: true } },
      { storeknox: false, aiFeatures: { reporting: true } },
      { storeknox: false, aiFeatures: { reporting: false } },
      { storeknox: true, aiFeatures: { reporting: false } },
    ],
    async function (assert, scenario) {
      const { storeknox, aiFeatures } = scenario;

      this.organization.selected.features = { storeknox };
      this.organization.selected.aiFeatures = aiFeatures;

      await render(hbs`
        <AppknoxWrapper
          @user={{this.user}}
        />
      `);

      const expandButton = find(`[
        data-test-side-lower-menu-item="${t('expand')}"
      ]`);

      await click(expandButton);

      if (storeknox || aiFeatures.reporting) {
        assert.dom('[data-test-side-menu-switcher]').exists();

        assert.dom('[data-test-side-menu-switcher-modal]').doesNotExist();

        assert.dom('[data-test-side-menu-switcher-icon]').exists();

        assert
          .dom('[data-test-side-menu-switcher-text]')
          .exists()
          .hasText(t('appSwitcher'));

        await click('[data-test-side-menu-switcher]');

        assert.dom('[data-test-side-menu-switcher-modal]').exists();
      } else {
        assert.dom('[data-test-side-menu-switcher]').doesNotExist();
      }
    }
  );
});
