import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import Service from '@ember/service';
import { objectifyEncodedReqBody } from 'irene/tests/test-utils';

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

const selectors = {
  dynScanAutoRoot:
    '[data-test-projectSettings-genSettings-dynScanAutoSettings-root]',
  dynScanAutoToggle:
    '[data-test-genSettings-dynScanAutoSettings-dynamicscanModeToggle] [data-test-toggle-input]',
  dynamicscanModeToggleLabel:
    '[data-test-genSettings-dynScanAutoSettings-dynamicscanModeToggleLabel]',
};

module(
  'Integration | Component | project-settings/general-settings/dynamicscan-automation-settings',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      // Server mocks
      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/profiles/:id/dynamicscan_mode', (schema, req) =>
        schema.dynamicscanModes.find(`${req.queryParams.id}`)?.toJSON()
      );

      this.owner.register('service:notifications', NotificationsStub);

      const store = this.owner.lookup('service:store');
      const file = this.server.create('file', 1);
      const project = this.server.create('project', {
        id: 1,
        last_file_id: file.id,
      });

      const normalizedProject = store.normalize('project', {
        ...project.toJSON(),
      });

      this.setProperties({
        project: store.push(normalizedProject),
      });
    });

    test('it renders', async function (assert) {
      this.server.create('dynamicscan-mode', {
        id: 1,
        dynamicscan_mode: 'Manual',
      });

      await render(hbs`
        <ProjectSettings::GeneralSettings::DynamicscanAutomationSettings 
          @project={{this.project}} 
          @profileId={{this.project.activeProfileId}} 
        />
      `);

      assert.dom(selectors.dynScanAutoRoot).exists();

      assert
        .dom('[data-test-genSettings-dynScanAutoSettings-headerTitle]')
        .exists()
        .hasText('t:dynamicScanAutomation:()');

      assert
        .dom('[data-test-genSettings-dynScanAutoSettings-headerInfoChip]')
        .exists()
        .hasText('t:experimentalFeature:()');

      assert
        .dom('[data-test-genSettings-dynScanAutoSettings-headerInfoDescNote]')
        .exists()
        .hasText('t:dynScanAutoSchedNote:()');
    });

    test('it toggles scheduled automation', async function (assert) {
      this.server.put('/profiles/:id/dynamicscan_mode', (schema, req) => {
        const reqBody = objectifyEncodedReqBody(req.requestBody);

        this.set('dynamicscan_mode', reqBody.dynamicscan_mode);

        return {
          dynamicscan_mode: reqBody.dynamicscan_mode,
          id: req.params.id,
        };
      });

      await render(hbs`
        <ProjectSettings::GeneralSettings::DynamicscanAutomationSettings 
          @project={{this.project}} 
          @profileId={{this.project.activeProfileId}} 
        />
      `);

      assert.dom(selectors.dynScanAutoRoot).exists();

      assert
        .dom(selectors.dynamicscanModeToggleLabel)
        .exists()
        .containsText('t:appiumScheduledAutomation:()');

      assert.dom(selectors.dynScanAutoToggle).exists().isNotChecked();

      await click(selectors.dynScanAutoToggle);

      assert.dom(selectors.dynScanAutoToggle).isChecked();

      assert.ok(this.dynamicscan_mode, 'Automated');

      await click(selectors.dynScanAutoToggle);

      assert.dom(selectors.dynScanAutoToggle).isNotChecked();

      assert.ok(this.dynamicscan_mode, 'Manual');
    });
  }
);
