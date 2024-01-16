import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { selectFiles } from 'ember-file-upload/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

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

const getRequestObj = (body) =>
  JSON.parse(
    '{"' + body.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
    function (key, value) {
      return key === '' ? value : decodeURIComponent(value);
    }
  );

module(
  'Integration | Component | project-settings/general-settings/dynamicscan-automation-settings/scripts-archived',
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

      this.server.get('/profiles/:id/automation_scripts', (schema) => {
        const results = schema.automationScripts.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/profiles/:id/dynamicscan_mode', (schema, req) =>
        schema.dynamicscanModes.find(`${req.queryParams.id}`)?.toJSON()
      );

      this.server.put(
        'https://api.test-upload-url.com',
        () => new Response(200)
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
        <ProjectSettings::GeneralSettings::DynamicscanAutomationSettings::ScriptsArchived
          @project={{this.project}} 
          @profileId={{this.project.activeProfileId}} 
        />
      `);

      assert
        .dom('[data-test-projectSettings-genSettings-dynScanAutoSettings-root]')
        .exists();

      assert
        .dom('[data-test-genSettings-dynScanAutoSettings-headerTitle]')
        .exists()
        .hasText('t:dynamicScanAutomation:()');

      assert
        .dom('[data-test-genSettings-dynScanAutoSettings-headerInfoChip]')
        .exists()
        .hasText('t:experimentalFeature:()');

      assert
        .dom('[data-test-genSettings-dynScanAutoSettings-headerInfoDescHeader]')
        .exists()
        .hasText('t:appiumScripts:()');

      assert
        .dom('[data-test-genSettings-dynScanAutoSettings-headerInfoDescText]')
        .exists()
        .hasText('t:appiumScriptsDescription:()');

      assert
        .dom('[data-test-genSettings-dynScanAutoSettings-headerInfoDescNote]')
        .exists()
        .hasText('t:appiumScriptsSchedNote:()');
    });

    test.each(
      'it uploads an automation script',
      [
        { is_valid: false, fail: false },
        { is_valid: true, fail: false },
        { is_valid: true, fail: true },
      ],
      async function (assert, { is_valid, fail }) {
        this.server.post(
          '/profiles/:id/upload_automation_script/signed_url',
          () => {
            if (fail) {
              return new Response(500, {}, { errors: ['server error'] });
            }

            return {
              url: 'https://api.test-upload-url.com',
              file_key: 'test-file-key.zip',
              file_key_signed: 'signed-test-file-key.zip',
            };
          }
        );

        this.server.post(
          '/profiles/:id/upload_automation_script',
          (schema, req) => {
            const reqBody = req.requestBody;

            const scriptKeys = JSON.parse(
              '{"' + reqBody.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
              function (key, value) {
                return key === '' ? value : decodeURIComponent(value);
              }
            );

            const automationScript = this.server.create('automation-script', {
              id: 1,
              ...scriptKeys,
              file_name: this.fileName,
              is_valid,
            });

            this.set('automationScript', automationScript);

            return automationScript.toJSON();
          }
        );

        this.server.create('dynamicscan-mode', {
          id: 1,
          dynamicscan_mode: 'Manual',
        });

        this.set('fileName', 'test.zip');

        await render(hbs`
          <ProjectSettings::GeneralSettings::DynamicscanAutomationSettings::ScriptsArchived
            @project={{this.project}} 
            @profileId={{this.project.activeProfileId}} 
          />
        `);

        assert
          .dom('[data-test-genSettings-dynScanAutoSettings-uploadZipInput]')
          .exists();

        assert
          .dom('[data-test-genSettings-dynScanAutoSettings-uploadZipBtn]')
          .hasText('t:uploadZipFile:()');

        assert
          .dom('[data-test-genSettings-dynScanAutoSettings-autoScriptsRoot]')
          .doesNotExist();

        let file = new File(['Test zip file'], this.fileName, {
          type: 'application/zip',
        });

        await selectFiles(
          '[data-test-genSettings-dynScanAutoSettings-uploadZipInput]',
          file
        );

        const notify = this.owner.lookup('service:notifications');

        // If upload passes
        if (!fail) {
          assert.strictEqual(
            notify.successMsg,
            't:appiumFileUploadedSuccessfully:()'
          );

          assert
            .dom('[data-test-genSettings-dynScanAutoSettings-autoScriptsRoot]')
            .exists();

          const uploadedAutoScriptSelector = `[data-test-genSettings-dynScanAutoSettings-autoScript='${this.automationScript.file_key}']`;
          assert.dom(uploadedAutoScriptSelector).exists();

          assert
            .dom(
              '[data-test-genSettings-dynScanAutoSettings-autoScript-dynamicscanModeToggle]'
            )
            .exists();

          assert
            .dom(
              `${uploadedAutoScriptSelector} [data-test-genSettings-dynScanAutoSettings-autoScript-fileKey]`
            )
            .exists()
            .containsText(this.automationScript.file_key);

          assert
            .dom(
              `${uploadedAutoScriptSelector} [data-test-genSettings-dynScanAutoSettings-autoScript-fileKeyIcon]`
            )
            .exists();

          assert
            .dom(
              `${uploadedAutoScriptSelector} [data-test-genSettings-dynScanAutoSettings-autoScript-dateCreated]`
            )
            .exists()
            .containsText(
              `${dayjs(this.automationScript.created_on).fromNow()}`
            );
        } else {
          assert.strictEqual(notify.errorMsg, 'server error');
        }

        // If upload happens and the script is invalid
        if (!is_valid) {
          assert
            .dom(
              '[data-test-genSettings-dynScanAutoSettings-autoScript-invalidScript-errorIcon]'
            )
            .exists();

          assert
            .dom(
              '[data-test-genSettings-dynScanAutoSettings-autoScript-invalidScript-text]'
            )
            .exists()
            .containsText('t:appiumScriptInvalid:()');
        }
      }
    );

    test('it toggles scheduled automation', async function (assert) {
      this.server.post(
        '/profiles/:id/upload_automation_script/signed_url',
        () => {
          return {
            url: 'https://api.test-upload-url.com',
            file_key: 'test-file-key.zip',
            file_key_signed: 'signed-test-file-key.zip',
          };
        }
      );

      this.server.post(
        '/profiles/:id/upload_automation_script',
        (schema, req) => {
          const reqBody = req.requestBody;

          const scriptKeys = getRequestObj(reqBody);

          const automationScript = this.server.create('automation-script', {
            id: 1,
            ...scriptKeys,
            file_name: this.fileName,
            is_valid: true,
          });

          this.set('automationScript', automationScript);

          return automationScript.toJSON();
        }
      );

      this.server.put('/profiles/:id/dynamicscan_mode', (schema, req) => {
        const reqBody = getRequestObj(req.requestBody);
        this.set('dynamicscan_mode', reqBody.dynamicscan_mode);

        return {
          dynamicscan_mode: reqBody.dynamicscan_mode,
          id: req.params.id,
        };
      });

      this.server.create('dynamicscan-mode', {
        id: 1,
        dynamicscan_mode: 'Manual',
      });

      this.set('fileName', 'test.zip');

      await render(hbs`
        <ProjectSettings::GeneralSettings::DynamicscanAutomationSettings::ScriptsArchived
          @project={{this.project}} 
          @profileId={{this.project.activeProfileId}} 
        />
      `);

      let file = new File(['Test zip file'], this.fileName, {
        type: 'application/zip',
      });

      await selectFiles(
        '[data-test-genSettings-dynScanAutoSettings-uploadZipInput]',
        file
      );

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        't:appiumFileUploadedSuccessfully:()'
      );

      assert
        .dom('[data-test-genSettings-dynScanAutoSettings-autoScriptsRoot]')
        .exists();

      const uploadedAutoScriptSelector = `[data-test-genSettings-dynScanAutoSettings-autoScript='${this.automationScript.file_key}']`;
      assert.dom(uploadedAutoScriptSelector).exists();

      assert
        .dom(
          '[data-test-genSettings-dynScanAutoSettings-autoScript-dynamicscanModeToggleLabel]'
        )
        .exists()
        .containsText('t:appiumScheduledAutomation:()');

      assert
        .dom(
          '[data-test-genSettings-dynScanAutoSettings-autoScript-dynamicscanModeToggle] input'
        )
        .exists()
        .isNotChecked();

      await click(
        `${uploadedAutoScriptSelector} [data-test-genSettings-dynScanAutoSettings-autoScript-dynamicscanModeToggle]`
      );

      assert
        .dom(
          '[data-test-genSettings-dynScanAutoSettings-autoScript-dynamicscanModeToggle] input'
        )
        .isChecked();

      assert.ok(this.dynamicscan_mode, 'Automated');

      await click(
        `${uploadedAutoScriptSelector} [data-test-genSettings-dynScanAutoSettings-autoScript-dynamicscanModeToggle]`
      );

      assert
        .dom(
          '[data-test-genSettings-dynScanAutoSettings-autoScript-dynamicscanModeToggle] input'
        )
        .isNotChecked();

      assert.ok(this.dynamicscan_mode, 'Manual');
    });
  }
);
