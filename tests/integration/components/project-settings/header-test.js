import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

module('Integration | Component | project-settings/header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test.each(
    'it renders',
    [true, false],
    async function (assert, isDASTScenarioPage) {
      this.set('isDASTScenarioPage', isDASTScenarioPage);

      // Server mocks
      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      const store = this.owner.lookup('service:store');
      const file = this.server.create('file', 1);
      const project = this.server.create('project', {
        id: 1,
        last_file_id: file.id,
      });

      const normalizedProject = store.normalize('project', {
        ...project.toJSON(),
      });

      this.project = store.push(normalizedProject);

      await render(
        hbs`<ProjectSettings::Header @project={{this.project}} @isDASTScenarioPage={{this.isDASTScenarioPage}} />`
      );

      const breadcrumbItems = [
        t('allProjects'),
        this.project.get('packageName'),
        isDASTScenarioPage
          ? t('dastAutomation.dastAutomationScenario')
          : t('settings'),
      ];

      // Checks rendering of breadcrumbs
      breadcrumbItems.forEach((item) => {
        assert
          .dom(`[data-test-projectSettingsHeader-breadcrumbItem="${item}"]`)
          .exists();
      });

      if (!isDASTScenarioPage) {
        assert
          .dom('[data-test-projectSettingsHeader-descText]')
          .exists()
          .containsText(t('settings'))
          .containsText(t('projectSettings.headerText'));

        assert.dom('[data-test-projectSettingsHeader-projectDetails]').exists();

        assert
          .dom(
            '[data-test-projectSettingsHeader-projectDetails-lastFileIconUrl]'
          )
          .exists()
          .hasAttribute('src', this.project.get('lastFile').get('iconUrl'));

        assert
          .dom('[data-test-projectSettingsHeader-projectDetails-packageName]')
          .exists()
          .containsText(this.project.get('packageName'));

        assert
          .dom('[data-test-projectSettingsHeader-projectDetails-projectID]')
          .exists()
          .containsText(t('projectID'))
          .containsText(this.project.id);

        assert
          .dom('[data-test-projectSettingsHeader-platformIcon]')
          .exists()
          .hasClass(
            RegExp(`platform-${this.project.get('platformIconClass')}`)
          );

        // Checks rendering of tabs
        const tabItems = [t('generalSettings'), t('analysisSettings')];

        tabItems.forEach((tab) => {
          assert
            .dom(`[data-test-projectSettingsHeader-tab="${tab}"]`)
            .exists()
            .hasText(tab);
        });
      }
    }
  );
});
