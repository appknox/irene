import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render, click, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { selectChoose } from 'ember-power-select/test-support';

import styles from 'irene/components/ak-select/index.scss';
import ENUMS from 'irene/enums';

const classes = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

module(
  'Integration | Component | project-settings/general-settings/device-preferences-automated-dast',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      await this.owner.lookup('service:organization').load();

      this.server.createList('organization', 1);

      const profile = this.server.create('profile', { id: '1' });

      const file = this.server.create('file', {
        project: '1',
        profile: profile.id,
      });

      const project = this.server.create('project', {
        file: file.id,
        id: '1',
        platform: ENUMS.PLATFORM.ANDROID,
      });

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/profiles/:id/device_preference', (schema, req) => {
        return schema.devicePreferences.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get(
        'v2/profiles/:id/ds_manual_device_preference',
        () => ({})
      );

      this.server.get('v2/profiles/:id/ds_automated_device_preference', () => ({
        ds_automated_device_selection:
          ENUMS.DS_AUTOMATED_DEVICE_SELECTION.ANY_DEVICE,
        ds_automated_platform_version_min: 13,
      }));

      this.server.get('/projects/:id/available-devices', (schema) => {
        const results = schema.projectAvailableDevices.all().models;
        return { count: results.length, next: null, previous: null, results };
      });

      const store = this.owner.lookup('service:store');

      const normalizedProject = store.normalize('project', {
        ...project.toJSON(),
      });

      this.setProperties({
        project: store.push(normalizedProject),
      });
    });

    test('it renders', async function (assert) {
      await render(hbs`
        <ProjectSettings::GeneralSettings::DevicePreferencesAutomatedDast @project={{this.project}}/>
      `);

      assert
        .dom(
          '[data-test-projectSettings-generalSettings-devicePreferenceAutomatedDast-title]'
        )
        .exists()
        .containsText('t:devicePreferencesAutomatedDast:()');

      assert
        .dom(
          '[data-test-projectSettings-generalSettings-devicePreferenceAutomatedDast-preference-select]'
        )
        .exists();
    });

    test('it selects criteria', async function (assert) {
      this.server.put(
        'v2/profiles/:id/ds_automated_device_preference',
        (_, req) => {
          const data = JSON.parse(req.requestBody);

          this.set('requestBody', data);

          const { ds_automated_device_selection } = JSON.parse(req.requestBody);

          return {
            ds_automated_device_selection: ds_automated_device_selection,
          };
        }
      );

      await render(hbs`
        <ProjectSettings::GeneralSettings::DevicePreferencesAutomatedDast @project={{this.project}}/>
      `);

      let selectListItems = findAll('.ember-power-select-option');

      const anyDeviceLabel = `t:anyAvailableDeviceWithAnyOS:()`;

      // Select "Any Device"
      await selectChoose(`.${classes.trigger}`, anyDeviceLabel);

      await click(`.${classes.trigger}`);
      selectListItems = findAll('.ember-power-select-option');

      //  "Any Device" is first option
      assert.dom(selectListItems[0]).hasAria('selected', 'true');

      assert.dom('[data-test-dast-preference-criteria-table]').doesNotExist();

      //  Select 'Specific Device'
      const specificDeviceLabel = `t:defineDeviceCriteria:()`;

      await selectChoose(`.${classes.trigger}`, specificDeviceLabel);

      await click(`.${classes.trigger}`);

      //  "Specific Device" is second option
      selectListItems = findAll('.ember-power-select-option');

      assert.dom(selectListItems[1]).hasAria('selected', 'true');

      await click(`.${classes.trigger}`);

      assert.strictEqual(this.requestBody.ds_automated_device_selection, 1);

      assert.dom('[data-test-dast-preference-criteria-table]').exists();
    });

    test('it selects min version', async function (assert) {
      this.server.put(
        'v2/profiles/:id/ds_automated_device_preference',
        (_, req) => {
          const data = JSON.parse(req.requestBody);

          this.set('requestBody', data);

          const { ds_automated_platform_version_min } = JSON.parse(
            req.requestBody
          );

          return {
            ds_automated_device_selection:
              ENUMS.DS_AUTOMATED_DEVICE_SELECTION.FILTER_CRITERIA,
            ds_automated_platform_version_min:
              ds_automated_platform_version_min,
          };
        }
      );

      await render(hbs`
        <ProjectSettings::GeneralSettings::DevicePreferencesAutomatedDast @project={{this.project}}/>
      `);

      //  Select 'Specific Device'
      const specificDeviceLabel = `t:defineDeviceCriteria:()`;

      await selectChoose(`.${classes.trigger}`, specificDeviceLabel);

      let triggerClass = findAll(`.${classes.trigger}`);

      await selectChoose(triggerClass[1], '12');

      await click(triggerClass[1]);

      //  "12" is third option
      let selectListItems = findAll('.ember-power-select-option');

      assert.dom(selectListItems[2]).hasAria('selected', 'true');

      assert.strictEqual(
        this.requestBody.ds_automated_platform_version_min,
        '12'
      );
    });
  }
);
