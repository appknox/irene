import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { selectChoose } from 'ember-power-select/test-support';
import Service from '@ember/service';

import styles from 'irene/components/ak-select/index.scss';
import { dsAutomatedDevicePref } from 'irene/helpers/ds-automated-device-pref';
import ENUMS from 'irene/enums';

const classes = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  success(msg) {
    this.successMsg = msg;
  }

  error(msg) {
    this.errorMsg = msg;
  }
}

module(
  'Integration | Component | project-settings/general-settings/device-preferences-automated-dast',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      const availableDevices = this.server.createList(
        'available-automated-device',
        3
      );

      const profile = this.server.create('profile', { id: '1' });

      const file = this.server.create('file', {
        project: '1',
        profile: profile.id,
      });

      const project = this.server.create('project', {
        id: '1',
        last_file: file,
        active_profile_id: profile.id,
      });

      const devicePreference = this.server.create(
        'ds-automated-device-preference',
        { id: profile.id }
      );

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get(
        'v2/profiles/:id/ds_automated_device_preference',
        (schema, req) =>
          schema.dsAutomatedDevicePreferences.find(req.params.id)?.toJSON()
      );

      this.server.get(
        '/v2/projects/:id/available_automated_devices',
        (schema) => {
          const results = schema.availableAutomatedDevices.all().models;

          return { count: results.length, next: null, previous: null, results };
        }
      );

      const store = this.owner.lookup('service:store');

      this.setProperties({
        project: store.push(store.normalize('project', project.toJSON())),
        devicePreference,
        availableDevices,
      });

      await this.owner.lookup('service:organization').load();
      this.owner.register('service:notifications', NotificationsStub);
    });

    test.each(
      'it renders',
      [
        ENUMS.DS_AUTOMATED_DEVICE_SELECTION.ANY_DEVICE,
        ENUMS.DS_AUTOMATED_DEVICE_SELECTION.FILTER_CRITERIA,
      ],
      async function (assert, deviceSelection) {
        this.devicePreference.update({
          ds_automated_device_selection: deviceSelection,
        });

        await render(hbs`
          <DsPreferenceProvider
            @profileId={{this.project.activeProfileId}}
            @file={{this.project.lastFile}}
            as |dpContext|
          >
            <ProjectSettings::DastAutomation::AutomationSettings::DevicePreferences @project={{this.project}} @dpContext={{dpContext}} />
          </DsPreferenceProvider>
        `);

        assert
          .dom(
            '[data-test-projectSettings-dastAutomationSettings-devicePreference-title]'
          )
          .exists()
          .containsText(t('devicePreferences'));

        assert
          .dom(
            '[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceSelect]'
          )
          .exists();

        assert
          .dom(
            `[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceSelect] .${classes.trigger}`
          )
          .hasText(t(dsAutomatedDevicePref([deviceSelection])));

        if (
          deviceSelection ===
          ENUMS.DS_AUTOMATED_DEVICE_SELECTION.FILTER_CRITERIA
        ) {
          assert
            .dom(
              '[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceCriteriaContainer]'
            )
            .exists();

          assert
            .dom(
              '[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceCriteria-deviceTypeTitle]'
            )
            .exists()
            .hasText(t('deviceType'));

          assert
            .dom(
              `[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceCriteria-deviceTypeRadioGroup] input[value="${this.devicePreference.ds_automated_device_type}"]`
            )
            .hasValue(`${this.devicePreference.ds_automated_device_type}`)
            .isChecked();

          assert
            .dom(
              '[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceCriteria-minOSVersionTitle]'
            )
            .exists()
            .hasText(t('minOSVersion'));

          assert
            .dom(
              `[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceCriteria-minOSVersionSelect] .${classes.trigger}`
            )
            .hasText(
              this.devicePreference.ds_automated_platform_version_min ||
                t('anyVersion')
            );
        } else {
          assert
            .dom(
              '[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceCriteriaContainer]'
            )
            .doesNotExist();
        }
      }
    );

    test('it selects preference filter criteria', async function (assert) {
      this.devicePreference.update({
        ds_automated_device_selection:
          ENUMS.DS_AUTOMATED_DEVICE_SELECTION.ANY_DEVICE,
      });

      this.server.put(
        'v2/profiles/:id/ds_automated_device_preference',
        (schema, req) => {
          const data = JSON.parse(req.requestBody);

          this.set('requestBody', data);

          return schema.dsAutomatedDevicePreferences
            .find(req.params.id)
            .update(data)
            .toJSON();
        }
      );

      await render(hbs`
        <DsPreferenceProvider
          @profileId={{this.project.activeProfileId}}
          @file={{this.project.lastFile}}
          as |dpContext|
        >
          <ProjectSettings::DastAutomation::AutomationSettings::DevicePreferences @project={{this.project}} @dpContext={{dpContext}} />
        </DsPreferenceProvider>
      `);

      const notify = this.owner.lookup('service:notifications');
      const devicePreferenceCriteriaSelectTrigger = `[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceSelect] .${classes.trigger}`;

      assert
        .dom(
          '[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceCriteriaContainer]'
        )
        .doesNotExist();

      //  Select 'Filter Criteria'
      const filterCriteriaLabel = t(
        dsAutomatedDevicePref([
          ENUMS.DS_AUTOMATED_DEVICE_SELECTION.FILTER_CRITERIA,
        ])
      );

      await selectChoose(
        devicePreferenceCriteriaSelectTrigger,
        filterCriteriaLabel
      );

      //  "Filter Criteria" is second option
      assert
        .dom(devicePreferenceCriteriaSelectTrigger)
        .hasText(filterCriteriaLabel);

      assert.strictEqual(notify.successMsg, t('savedPreferences'));

      assert.strictEqual(
        this.requestBody.ds_automated_device_selection,
        ENUMS.DS_AUTOMATED_DEVICE_SELECTION.FILTER_CRITERIA
      );

      assert
        .dom(
          '[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceCriteriaContainer]'
        )
        .exists();

      const anyDeviceLabel = t(
        dsAutomatedDevicePref([ENUMS.DS_AUTOMATED_DEVICE_SELECTION.ANY_DEVICE])
      );

      // Select "Any Device"
      await selectChoose(devicePreferenceCriteriaSelectTrigger, anyDeviceLabel);

      //  "Any Device" is first option
      assert.dom(devicePreferenceCriteriaSelectTrigger).hasText(anyDeviceLabel);

      assert
        .dom(
          '[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceCriteriaContainer]'
        )
        .doesNotExist();

      assert.strictEqual(notify.successMsg, t('savedPreferences'));

      assert.strictEqual(
        this.requestBody.ds_automated_device_selection,
        ENUMS.DS_AUTOMATED_DEVICE_SELECTION.ANY_DEVICE
      );
    });

    test('it selects device type & min version', async function (assert) {
      this.devicePreference.update({
        ds_automated_device_type: ENUMS.DS_DEVICE_TYPE.NO_PREFERENCE,
        ds_automated_platform_version_min: '',
        ds_automated_device_selection:
          ENUMS.DS_AUTOMATED_DEVICE_SELECTION.FILTER_CRITERIA,
      });

      this.availableDevices[1].update({
        platform_version: '12',
      });

      this.server.put(
        'v2/profiles/:id/ds_automated_device_preference',
        (schema, req) => {
          const data = JSON.parse(req.requestBody);

          this.set('requestBody', data);

          return schema.dsAutomatedDevicePreferences
            .find(req.params.id)
            .update(data)
            .toJSON();
        }
      );

      await render(hbs`
        <DsPreferenceProvider
          @profileId={{this.project.activeProfileId}}
          @file={{this.project.lastFile}}
          as |dpContext|
        >
          <ProjectSettings::DastAutomation::AutomationSettings::DevicePreferences @project={{this.project}} @dpContext={{dpContext}} />
        </DsPreferenceProvider>
      `);

      const minOSVersionTrigger = `[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceCriteria-minOSVersionSelect] .${classes.trigger}`;

      assert
        .dom(
          '[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceCriteriaContainer]'
        )
        .exists();

      assert
        .dom(
          `[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceCriteria-deviceTypeRadioGroup] input[value="${ENUMS.DS_DEVICE_TYPE.NO_PREFERENCE}"]`
        )
        .hasValue(`${ENUMS.DS_DEVICE_TYPE.NO_PREFERENCE}`)
        .isChecked();

      assert.dom(minOSVersionTrigger).hasText(t('anyVersion'));

      // select device type
      await click(
        `[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceCriteria-deviceTypeRadioGroup] input[value="${ENUMS.DS_DEVICE_TYPE.PHONE_REQUIRED}"]`
      );

      assert
        .dom(
          `[data-test-projectSettings-dastAutomationSettings-devicePreference-automatedPreferenceCriteria-deviceTypeRadioGroup] input[value="${ENUMS.DS_DEVICE_TYPE.PHONE_REQUIRED}"]`
        )
        .hasValue(`${ENUMS.DS_DEVICE_TYPE.PHONE_REQUIRED}`)
        .isChecked();

      assert.strictEqual(
        this.requestBody.ds_automated_device_type,
        ENUMS.DS_DEVICE_TYPE.PHONE_REQUIRED
      );

      // select min version
      await selectChoose(minOSVersionTrigger, '12');

      //  "12" is second option
      assert.dom(minOSVersionTrigger).hasText('12');

      assert.strictEqual(
        this.requestBody.ds_automated_platform_version_min,
        '12'
      );
    });
  }
);
