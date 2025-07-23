import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, triggerEvent, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

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

const buildIndividualScanSettingsItems = (settingsState) => {
  return [
    {
      id: 'static_scan_completed',
      title: t('accountNotifSettings.staticScanTitle'),
      description: t('accountNotifSettings.staticScanDescription'),
      enabled: settingsState.static_scan_completed,
      disable_toggling: settingsState.all_va_completed,
    },
    {
      id: 'dynamic_scan_completed',
      title: t('accountNotifSettings.dynamicScanTitle'),
      description: t('accountNotifSettings.dynamicScanDescription'),
      enabled: settingsState.dynamic_scan_completed,
      disable_toggling: settingsState.all_va_completed,
    },
    {
      id: 'api_scan_completed',
      title: t('accountNotifSettings.apiScanTitle'),
      description: t('accountNotifSettings.apiScanDescription'),
      enabled: settingsState.api_scan_completed,
      disable_toggling: settingsState.all_va_completed,
    },
  ];
};

module(
  'Integration | Component | account-settings/notification-settings',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);
    });

    test.each(
      'it renders the toggle states for the different notification settings',
      [
        {
          all_va_completed: false,
          static_scan_completed: false,
          dynamic_scan_completed: false,
          api_scan_completed: false,
        },
        {
          all_va_completed: true,
          static_scan_completed: true,
          dynamic_scan_completed: true,
          api_scan_completed: true,
        },
      ],
      async function (assert, settingsState) {
        // Server mocks
        this.server.get(
          '/v2/nf_email_notification_preference',
          () => settingsState
        );

        await render(hbs`<AccountSettings::NotificationSettings />`);

        assert.dom('[data-test-accountSettings-notificationSettings]').exists();

        assert
          .dom('[data-test-accountSettings-notificationSettings-title]')
          .hasText(t('accountNotifSettings.emailSummaryTitle'));

        const EXPECTED_SETTINGS = [
          // VA Notification
          {
            id: 'va_notification',
            title: t('accountNotifSettings.vaNotificationTitle'),
            tooltipText: t('accountNotifSettings.vaNotificationTooltip'),
            settings: [
              {
                id: 'all_va_completed',
                title: t('accountNotifSettings.vaNotificationTitle'),
                description: t(
                  'accountNotifSettings.vaNotificationDescription'
                ),
                enabled: settingsState.all_va_completed,
                disable_toggling: false,
              },
            ],
          },

          // Individual Scan Level Notification
          {
            id: 'individual_scan_level_notification',
            title: t('accountNotifSettings.individualScanTitle'),
            tooltipText: t('accountNotifSettings.individualScanTooltip'),
            settings: buildIndividualScanSettingsItems(settingsState),
          },
        ];

        for (const group of EXPECTED_SETTINGS) {
          const settingGroup = find(
            `[data-test-accountSettings-notificationSettings="${group.id}"]`
          );

          assert.dom(settingGroup).exists();
          assert.dom(settingGroup).containsText(group.title);

          // Check tooltip
          const tooltipSelector = `[data-test-accountSettings-notificationSettings-tooltip="${group.id}"]`;
          await triggerEvent(tooltipSelector, 'mouseenter');

          assert
            .dom('[data-test-ak-tooltip-content]')
            .exists()
            .containsText(group.tooltipText);

          await triggerEvent(tooltipSelector, 'mouseleave');

          // Check email settings state
          for (const setting of group.settings) {
            const settingItem = find(
              `[data-test-accountSettings-notificationSettings-settingsItem="${setting.id}"]`
            );

            assert.dom(settingItem, settingGroup).exists();
            assert.dom(settingItem, settingGroup).containsText(setting.title);

            assert
              .dom(settingItem, settingGroup)
              .containsText(setting.description);

            // check toggle state
            const toggleSelector = settingItem.querySelector(
              '[data-test-accountSettings-notificationSettings-settingsItem-toggle] [data-test-toggle-input]'
            );

            if (setting.enabled) {
              assert.dom(toggleSelector).isChecked();
            } else {
              assert.dom(toggleSelector).isNotChecked();
            }

            // Show disabled tooltip for individual scan settings when All VA notification is enabled
            if (setting.disable_toggling) {
              const tooltipSelector = `[data-test-accountSettings-notificationSettings-settingsItem-tooltip="${setting.id}"]`;
              await triggerEvent(tooltipSelector, 'mouseenter');

              compareInnerHTMLWithIntlTranslation(assert, {
                selector: '[data-test-ak-tooltip-content]',
                message: t(
                  'accountNotifSettings.individualScanAllVaEnabledTooltipText',
                  { htmlSafe: true }
                ),
                doIncludesCheck: true,
              });

              await triggerEvent(tooltipSelector, 'mouseleave');
            }
          }
        }

        // Check notification settings note
        compareInnerHTMLWithIntlTranslation(assert, {
          selector: '[data-test-accountSettings-notificationSettings-note]',
          message: t('accountNotifSettings.notificationNote', {
            htmlSafe: true,
          }),
          doIncludesCheck: true,
        });
      }
    );

    test.each(
      'it toggles individual scan settings when All VA notification is disabled',
      [
        // All VA notification should be disabled
        {
          all_va_completed: false,
          static_scan_completed: true,
          dynamic_scan_completed: true,
          api_scan_completed: true,
        },
        {
          all_va_completed: false,
          static_scan_completed: false,
          dynamic_scan_completed: false,
          api_scan_completed: false,
        },
      ],
      async function (assert, initialSettingsState) {
        // Server mocks
        this.server.get(
          '/v2/nf_email_notification_preference',
          () => initialSettingsState
        );

        this.server.put(
          '/v2/nf_email_notification_preference/update_user_va_notification_pref',
          (_schema, req) => {
            const updatedSettingsState = JSON.parse(req.requestBody);

            return {
              ...initialSettingsState,
              ...updatedSettingsState,
            };
          }
        );

        await render(hbs`<AccountSettings::NotificationSettings />`);

        assert.dom('[data-test-accountSettings-notificationSettings]').exists();

        assert
          .dom('[data-test-accountSettings-notificationSettings-title]')
          .hasText(t('accountNotifSettings.emailSummaryTitle'));

        const SETTINGS_ITEMS =
          buildIndividualScanSettingsItems(initialSettingsState);

        // Check email settings state
        for (const setting of SETTINGS_ITEMS) {
          const settingItem = find(
            `[data-test-accountSettings-notificationSettings-settingsItem="${setting.id}"]`
          );

          assert.dom(settingItem).exists();
          assert.dom(settingItem).containsText(setting.title);
          assert.dom(settingItem).containsText(setting.description);

          // check toggle state
          const toggleSelector = settingItem.querySelector(
            '[data-test-accountSettings-notificationSettings-settingsItem-toggle] [data-test-toggle-input]'
          );

          // Initial state of toggle
          if (setting.enabled) {
            assert.dom(toggleSelector).isChecked();
          } else {
            assert.dom(toggleSelector).isNotChecked();
          }

          // Perform toggle
          await click(toggleSelector);

          // After toggle
          if (setting.enabled) {
            assert.dom(toggleSelector).isNotChecked();
          } else {
            assert.dom(toggleSelector).isChecked();
          }

          // Check notification success message
          const notify = this.owner.lookup('service:notifications');

          assert.strictEqual(
            notify.successMsg,
            t('accountNotifSettings.notificationPreferenceUpdated')
          );
        }
      }
    );

    test.each(
      'it toggles All VA notification irrespective of individual scan settings',
      [
        {
          all_va_completed: false,
          static_scan_completed: true,
          dynamic_scan_completed: true,
          api_scan_completed: true,
        },
        {
          all_va_completed: true,
          static_scan_completed: false,
          dynamic_scan_completed: false,
          api_scan_completed: false,
        },
      ],
      async function (assert, initialSettingsState) {
        // Server mocks
        this.server.get(
          '/v2/nf_email_notification_preference',
          () => initialSettingsState
        );

        this.server.put(
          '/v2/nf_email_notification_preference/update_user_va_notification_pref',
          (_schema, req) => {
            const updatedSettingsState = JSON.parse(req.requestBody);

            return {
              ...initialSettingsState,
              ...updatedSettingsState,
            };
          }
        );

        await render(hbs`<AccountSettings::NotificationSettings />`);

        assert.dom('[data-test-accountSettings-notificationSettings]').exists();

        assert
          .dom('[data-test-accountSettings-notificationSettings-title]')
          .hasText(t('accountNotifSettings.emailSummaryTitle'));

        const SETTINGS_ITEMS = [
          {
            id: 'all_va_completed',
            title: t('accountNotifSettings.vaNotificationTitle'),
            description: t('accountNotifSettings.vaNotificationDescription'),
            enabled: initialSettingsState.all_va_completed,
            disable_toggling: false,
          },
          ...buildIndividualScanSettingsItems(initialSettingsState),
        ];

        // Check email settings state for only All VA notification
        for (const setting of SETTINGS_ITEMS.slice(0, 1)) {
          const settingItem = find(
            `[data-test-accountSettings-notificationSettings-settingsItem="${setting.id}"]`
          );

          assert.dom(settingItem).exists();
          assert.dom(settingItem).containsText(setting.title);
          assert.dom(settingItem).containsText(setting.description);

          // check toggle state
          const toggleSelector = settingItem.querySelector(
            '[data-test-accountSettings-notificationSettings-settingsItem-toggle] [data-test-toggle-input]'
          );

          // Initial state of toggle
          if (setting.enabled) {
            assert.dom(toggleSelector).isChecked();
          } else {
            assert.dom(toggleSelector).isNotChecked();
          }

          // Perform toggle
          await click(toggleSelector);

          // After toggle
          if (setting.enabled) {
            assert.dom(toggleSelector).isNotChecked();
          } else {
            assert.dom(toggleSelector).isChecked();

            // Individual scan settings should be disabled when All VA notification is enabled
            const INDIVIDUAL_SCAN_SETTING_ITEMS = SETTINGS_ITEMS.slice(1);

            for (const individualScanSetting of INDIVIDUAL_SCAN_SETTING_ITEMS) {
              const individualScanSettingItem = find(
                `[data-test-accountSettings-notificationSettings-settingsItem="${individualScanSetting.id}"]`
              );

              assert.dom(individualScanSettingItem).exists();
              assert
                .dom(individualScanSettingItem)
                .containsText(individualScanSetting.title);

              const toggleSelector = individualScanSettingItem.querySelector(
                '[data-test-accountSettings-notificationSettings-settingsItem-toggle] [data-test-toggle-input]'
              );

              // State of individual scans should be preserved
              if (individualScanSetting.enabled) {
                assert.dom(toggleSelector).isChecked();
              } else {
                assert.dom(toggleSelector).isNotChecked();
              }

              // Show disabled tooltip for individual scan settings when All VA notification is enabled
              const tooltipSelector = `[data-test-accountSettings-notificationSettings-settingsItem-tooltip="${individualScanSetting.id}"]`;
              await triggerEvent(tooltipSelector, 'mouseenter');

              compareInnerHTMLWithIntlTranslation(assert, {
                selector: '[data-test-ak-tooltip-content]',
                message: t(
                  'accountNotifSettings.individualScanAllVaEnabledTooltipText',
                  { htmlSafe: true }
                ),
                doIncludesCheck: true,
              });

              await triggerEvent(tooltipSelector, 'mouseleave');
            }
          }

          // Check notification success message
          const notify = this.owner.lookup('service:notifications');

          assert.strictEqual(
            notify.successMsg,
            t('accountNotifSettings.notificationPreferenceUpdated')
          );
        }
      }
    );
  }
);
