import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, find, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import Service from '@ember/service';

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

class WhitelabelStub extends Service {
  is_appknox_url = true;
}

class ConfigurationStub extends Service {
  frontendData = {};
  themeData = {};
  imageData = {};
  serverData = { urlUploadAllowed: true, enterprise: false };
}

const reportMenuItems = [
  {
    label: () => t('reportModule.generateReport'),
    icon: 'auto-awesome',
    route: 'authenticated.reports.generate',
  },
];

const lowerMenuItems = [
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

module('Integration | Component | report-wrapper', function (hooks) {
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
    this.owner.register('service:whitelabel', WhitelabelStub);
    this.owner.register('service:configuration', ConfigurationStub);

    const organization = this.owner.lookup('service:organization');
    const window = this.owner.lookup('service:browser/window');

    window.localStorage.setItem('reportSidebarState', 'expanded');

    this.setProperties({
      title: t('reportModule.title'),
      organization: organization,
      user: store.createRecord('user', this.server.create('user').toJSON()),
    });
  });

  test('it displays AI reporting engine title and powered by AI chip', async function (assert) {
    await render(hbs`<ReportWrapper @user={{this.user}} />`);

    assert
      .dom('[data-test-report-title]')
      .hasText(t('reportModule.reportingEngine'));

    assert.dom('[data-test-report-powered-by-ai-chip]').exists();

    // Test clicking on the powered by AI chip
    await click('[data-test-report-powered-by-ai-chip]');

    // Check that AI info drawer opens
    assert.dom('[data-test-poweredByAi-drawer]').exists();

    assert
      .dom('[data-test-poweredByAi-drawer-title]')
      .hasText(t('aiPoweredFeatures'));

    // Check drawer content headings
    const drawerHeadings = findAll(
      '[data-test-poweredByAi-drawer-section-title]'
    );

    assert.strictEqual(drawerHeadings.length, 3, 'Should have 3 info sections');

    // Drawer Header check
    assert.dom(drawerHeadings[0]).hasText(t('reportModule.aiDataAccess'));
    assert.dom(drawerHeadings[1]).hasText(t('reportModule.aiDataUsage'));
    assert.dom(drawerHeadings[2]).hasText(t('reportModule.aiDataProtection'));

    // Check drawer body/content
    const drawerInfo = [
      {
        title: t('reportModule.aiDataAccess'),
        body: t('reportModule.aiDataAccessDescription'),
      },
      {
        title: t('reportModule.aiDataUsage'),
        body: t('reportModule.aiDataUsageDescription'),
      },
      {
        title: t('reportModule.aiDataProtection'),
        contentList: [
          t('reportModule.aiDataProtectionList.item1'),
          t('reportModule.aiDataProtectionList.item2'),
          t('reportModule.aiDataProtectionList.item3'),
        ],
      },
    ];

    // Check body
    const body = findAll('[data-test-poweredByAi-drawer-section-body]');

    // Check content list
    const contentList = findAll(
      '[data-test-poweredByAi-drawer-section-list-item]'
    );

    drawerInfo.forEach((it, index) => {
      assert
        .dom(`[data-test-poweredByAi-drawer-section-title="${it.title}"]`)
        .hasText(it.title);

      if (it.body) {
        assert.dom(body[index]).containsText(it.body);
      }

      if (it.contentList) {
        it.contentList.forEach((content, index) => {
          assert.dom(contentList[index]).containsText(content);
        });
      }
    });
  });

  test('it should render report side nav', async function (assert) {
    await render(hbs`<ReportWrapper @user={{this.user}} />`);

    const menuItemEle = findAll('[data-test-side-menu-item]');

    reportMenuItems.forEach((it, index) => {
      assert
        .dom('[data-test-side-menu-item-icon]', menuItemEle[index])
        .hasAttribute('icon', `material-symbols:${it.icon}`);
    });

    assert.dom('[data-test-side-lower-menu]').exists();

    assert.dom('[data-test-side-lower-menu-divider]').exists();

    reportMenuItems.forEach((it, index) => {
      assert
        .dom('[data-test-side-menu-item-text]', menuItemEle[index])
        .hasText(it.label());
    });

    let lowerMenuItemEle = findAll('[data-test-side-lower-menu-item]');

    lowerMenuItems.forEach((it, index) => {
      assert
        .dom('[data-test-side-lower-menu-item-text]', lowerMenuItemEle[index])
        .containsText(it.title());

      assert
        .dom('[data-test-side-lower-menu-item-icon]', lowerMenuItemEle[index])
        .hasAttribute('icon', `material-symbols:${it.icon}`);
    });

    // Collapse side nav
    const collapseButton = find(
      `[data-test-side-lower-menu-item="${t('collapse')}"]`
    );

    assert.ok(collapseButton, 'Collapse button should exist');

    await click(collapseButton);

    lowerMenuItemEle = findAll('[data-test-side-lower-menu-item]');

    lowerMenuItems.forEach((it, index) => {
      assert
        .dom('[data-test-side-lower-menu-item-text]', lowerMenuItemEle[index])
        .doesNotExist();

      assert
        .dom('[data-test-side-lower-menu-item-icon]', lowerMenuItemEle[index])
        .hasAttribute('icon', `material-symbols:${it.icon}`);
    });
  });

  test.each(
    'it should render switcher modal if storeknox feature is available',
    [true, false],
    async function (assert, storeknox) {
      this.organization.selected.features = { storeknox };

      await render(hbs`<ReportWrapper @user={{this.user}} />`);

      if (storeknox) {
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
