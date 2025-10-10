import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, find, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
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

  setDefaultAutoClear() {}
}

module(
  'Integration | Component | organization/ai-powered-features',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      // Create AI features record
      this.server.get('/organizations/:id/ai_features', () => {
        return { reporting: true };
      });

      this.server.post('/organizations/:id/ai_features', (_schema, request) => {
        const requestBody = JSON.parse(request.requestBody);
        return { ...requestBody };
      });

      // Register stub services
      this.owner.register('service:notifications', NotificationsStub);

      // Setup organization service
      const organizationService = this.owner.lookup('service:organization');
      await organizationService.load();

      // Mock organization's AI features
      organizationService.selected.set('aiFeatures', { reporting: true });

      // Test Data
      this.set('organizationService', organizationService);
    });

    test('it renders with AI features list', async function (assert) {
      await render(hbs`<Organization::AiPoweredFeatures />`);

      const aiFeaturesList = [
        {
          featureKey: 'reporting',
          isChecked: true,
          enabled: true,
          label: t('reporting'),
          description: t('reportModule.settingsDesc'),
          header: t('reportModule.settingsHeader'),
        },
      ];

      aiFeaturesList.forEach((feature) => {
        const featureBody = find(
          `[data-test-organzation-aiPoweredFeatures-featureBody=${feature.featureKey}]`
        );

        assert.dom(featureBody).exists();

        // Test each component part is rendered
        assert
          .dom(
            '[data-test-organzation-aiPoweredFeatures-poweredByAiChip]',
            featureBody
          )
          .exists();

        // Check the feature title and description
        assert
          .dom('[data-test-organzation-aiPoweredFeatures-header]', featureBody)
          .hasText(t('reportModule.settingsHeader'));

        assert
          .dom(
            '[data-test-organzation-aiPoweredFeatures-description]',
            featureBody
          )
          .hasText(t('reportModule.settingsDesc'));

        // Check that toggle is rendered and enabled
        assert
          .dom(
            '[data-test-organzation-aiPoweredFeatures-featureToggle] [data-test-toggle-input]',
            featureBody
          )
          .exists()
          .isNotDisabled();
      });
    });

    test.each(
      'it hides/shows ai features when hideUpsellUI is true and feature is not enabled',
      [
        {
          key: 'reporting',
          value: false,
          otherFeatures: { pii: true },
          hideUpsellUI: true,
        },
        {
          key: 'pii',
          value: false,
          otherFeatures: { reporting: true },
          hideUpsellUI: true,
        },
        {
          key: 'reporting',
          value: false,
          otherFeatures: { pii: true },
          hideUpsellUI: false,
        },
        {
          key: 'pii',
          value: false,
          otherFeatures: { reporting: true },
          hideUpsellUI: false,
        },
      ],
      async function (assert, testData) {
        this.organizationService.selected.set(
          'hideUpsellFeatures',
          testData.hideUpsellUI
        );

        this.organizationService.selected.set('aiFeatures', {
          [testData.key]: testData.value,
          ...testData.otherFeatures,
        });

        await render(hbs`<Organization::AiPoweredFeatures />`);

        if (testData.hideUpsellUI) {
          // Disable feature should not be rendered
          assert
            .dom(
              `[data-test-organzation-aiPoweredFeatures-featureBody=${testData.key}]`
            )
            .doesNotExist();

          // Enable feature should be rendered
          Object.keys(testData.otherFeatures).forEach((key) => {
            assert
              .dom(
                `[data-test-organzation-aiPoweredFeatures-featureBody=${key}]`
              )
              .exists();
          });
        } else {
          // All features should be rendered whether procured or not
          Object.keys({
            [testData.key]: testData.value,
            ...testData.otherFeatures,
          }).forEach((key) => {
            assert
              .dom(
                `[data-test-organzation-aiPoweredFeatures-featureBody=${key}]`
              )
              .exists();
          });
        }
      }
    );

    test.each(
      'it toggles a feature',
      [true, false],
      async function (assert, isEnabled) {
        // Server mock
        this.server.get('/organizations/:id/ai_features', () => {
          let enabled = isEnabled;

          if (this.hasToggled) {
            enabled = !isEnabled;
          }

          return { reporting: enabled };
        });

        this.server.put('/organizations/:id/ai_features', (_, request) => {
          const { reporting } = JSON.parse(request.requestBody);

          this.set('hasToggled', true);

          return { reporting };
        });

        // Test start
        await render(hbs`<Organization::AiPoweredFeatures />`);

        // Pick one of the features
        let featureBody = find(
          '[data-test-organzation-aiPoweredFeatures-featureBody="reporting"]'
        );

        let featureToggle = featureBody.querySelector(
          '[data-test-toggle-input]'
        );

        // Check toggle state
        if (isEnabled) {
          assert.ok(featureToggle.checked);
        } else {
          assert.notOk(featureToggle.checked);
        }

        // Click on toggle
        await click(featureToggle);

        // Drawer should now be visible
        assert.dom('[data-test-poweredByAi-drawer]').exists();

        assert
          .dom('[data-test-poweredByAi-drawer-title]')
          .hasText(t('aiPoweredFeatures'));

        // Check drawer content headings
        const drawerHeadings = findAll(
          '[data-test-poweredByAi-drawer-section-title]'
        );

        assert.strictEqual(
          drawerHeadings.length,
          3,
          'Should have 3 info sections'
        );

        // Drawer Header check
        assert.dom(drawerHeadings[0]).hasText(t('reportModule.aiDataAccess'));
        assert.dom(drawerHeadings[1]).hasText(t('reportModule.aiDataUsage'));

        assert
          .dom(drawerHeadings[2])
          .hasText(t('reportModule.aiDataProtection'));

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

        // Check drawer content and buttons
        assert
          .dom('[data-test-poweredByAi-drawer-footer-back-btn]')
          .hasText(t('back'));

        assert
          .dom('[data-test-poweredByAi-drawer-footer-button]')
          .hasText(isEnabled ? t('yesTurnOff') : t('yesTurnOn'));

        await click('[data-test-poweredByAi-drawer-footer-button]');

        // Check success notification
        const notificationService = this.owner.lookup('service:notifications');

        assert.strictEqual(
          notificationService.successMsg,
          t('statusUpdatedSuccessfully')
        );

        assert.dom('[data-test-poweredByAi-drawer]').doesNotExist();

        // Get updated toggle state
        featureBody = find(
          '[data-test-organzation-aiPoweredFeatures-featureBody="reporting"]'
        );

        featureToggle = featureBody.querySelector('[data-test-toggle-input]');

        if (isEnabled) {
          assert.notOk(featureToggle.checked);
        } else {
          assert.ok(featureToggle.checked);
        }
      }
    );
  }
);
