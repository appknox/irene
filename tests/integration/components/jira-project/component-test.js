import Service from '@ember/service';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import {
  clickTrigger,
  selectChoose,
} from 'ember-power-select/test-support/helpers';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

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

module('Integration | Component | jira-project', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.owner.register('service:notifications', NotificationsStub);
    this.notifyService = this.owner.lookup('service:notifications');

    this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();

    this.server.createList('project', 3);
    this.set('project', this.server.db.projects[0]);

    this.set('jiraProjects', [
      {
        key: 'RM',
        name: 'Reporting Module',
      },
      {
        key: 'AT',
        name: 'Appknox Test',
      },
    ]);
  });

  test('it renders with no JIRA projects', async function (assert) {
    this.server.get('/organizations/:id/jira_projects', () => {
      return null;
    });

    await render(hbs`<JiraProject @project={{this.project}} />`);
    assert.dom('[data-test-jira-integration-header]').exists();
    assert
      .dom('[data-test-jira-integration-header]')
      .hasText('t:jiraIntegration:()');

    assert.dom('[data-test-no-jira-project]').exists();
    assert.dom('[data-test-no-jira-project]').hasText('t:jiraNoProject:()');
  });

  test('it renders select button with atleast one JIRA project', async function (assert) {
    this.server.get('/organizations/:id/jira_projects', () => {
      return this.jiraProjects;
    });

    await render(hbs`<JiraProject @project={{this.project}} />`);
    assert.dom('[data-test-no-jira-project]').doesNotExist();
    assert.dom('[data-test-select-project-header]').exists();
    assert
      .dom('[data-test-select-project-header]')
      .hasText('t:otherTemplates.selectJIRAAccount:()');
    assert.dom('[data-test-select-project-button]').exists();
    assert
      .dom('[data-test-select-project-button]')
      .hasText('t:selectProject:()');
  });

  test('it shows project edit modal when "select" button is clicked', async function (assert) {
    this.server.get('/organizations/:id/jira_projects', () => {
      return this.jiraProjects;
    });

    await render(hbs`<JiraProject @project={{this.project}} />`);
    assert.dom(`[data-test-edit-modal]`).doesNotHaveClass('is-active');
    await click('[data-test-select-project-button]');
    assert.dom(`[data-test-edit-modal]`).hasClass('is-active');
  });

  test('it closes the edit modal when cancel is clicked', async function (assert) {
    this.server.get('/organizations/:id/jira_projects', () => {
      return this.jiraProjects;
    });

    await render(hbs`<JiraProject @project={{this.project}} />`);
    assert.dom(`[data-test-edit-modal]`).doesNotHaveClass('is-active');
    await click('[data-test-select-project-button]');
    assert.dom(`[data-test-edit-modal]`).hasClass('is-active');
    await click('[data-test-modal-cancel-button]');
    assert.dom(`[data-test-edit-modal]`).doesNotHaveClass('is-active');
  });

  test('It shows an error message when no project repo is selected after clicking save in edit modal', async function (assert) {
    this.server.get('/organizations/:id/jira_projects', () => {
      return this.jiraProjects;
    });

    this.server.post(
      '/projects/:id/jira',
      { project_key: ['This field may not be null.'] },
      400
    );

    await render(hbs`<JiraProject @project={{this.project}} />`);
    await click('[data-test-select-project-button]');
    assert.dom(`[data-test-edit-modal]`).hasClass('is-active');

    await click('[data-test-modal-save-button]');

    assert.strictEqual(
      this.notifyService.get('errorMsg'),
      `t:invalidProject:()`
    );
  });

  test('it renders the fetched JIRA Projects on the edit modal correctly', async function (assert) {
    this.server.get('/organizations/:id/jira_projects', () => {
      return this.jiraProjects;
    });

    await render(hbs`<JiraProject @project={{this.project}} />`);
    await click('[data-test-select-project-button]');
    await clickTrigger('.select-repo-class');

    const projectDropdownList = this.element.querySelectorAll(
      '.ember-power-select-option'
    );

    assert.strictEqual(
      projectDropdownList.length,
      2,
      'JIRA Project count on dropdown list is correct'
    );

    for (let i = 0; i < this.jiraProjects.length; i++) {
      const jiraProject = this.jiraProjects[i];
      assert
        .dom(`[data-option-index="${i}"]`) // From power-select api
        .containsText(`${jiraProject.name}`);
    }
  });

  test('it saves the selected project when I select a valid repo from the edit modal', async function (assert) {
    assert.expect(7);

    this.server.get('/organizations/:id/jira_projects', () => {
      return this.jiraProjects;
    });

    this.server.post('/projects/:id/jira', (_, request) => {
      const requestBody = JSON.parse(request.requestBody);

      // Since the first item is selected
      assert.strictEqual(
        requestBody.project_key,
        this.jiraProjects[0].key,
        'Selected project "key" is equal to first item "key" on dropdown list'
      );
      assert.strictEqual(
        requestBody.project_name,
        this.jiraProjects[0].name,
        'Selected project "name" is equal to first item name on dropdown list'
      );
    });

    await render(hbs`<JiraProject @project={{this.project}} />`);
    await click('[data-test-select-project-button]');

    await clickTrigger('.select-repo-class');
    // Select first repo in power select dropdown
    await selectChoose('.select-repo-class', '.ember-power-select-option', 0);

    await clickTrigger('.select-threshold-class');
    // Select second threshold in power select dropdown
    await selectChoose(
      '.select-threshold-class',
      '.ember-power-select-option',
      1
    );

    await click('[data-test-modal-save-button]');

    assert
      .dom('[data-test-jira-project-key-name]')
      .containsText(`${this.jiraProjects[0].key}-${this.jiraProjects[0].name}`);
    assert.dom('[data-test-jira-project-risk]').containsText(`Medium`);
    assert.dom('[data-test-delete-project-trigger]').exists();
    assert.dom('[data-test-edit-project-trigger]').exists();

    assert.strictEqual(
      this.notifyService.get('successMsg'),
      `t:integratedJIRA:()`
    );
  });

  test('it deletes selected project when delete trigger is clicked', async function (assert) {
    this.server.get('/organizations/:id/jira_projects', () => {
      return this.jiraProjects;
    });
    this.server.post('/projects/:id/jira', () => {
      return {
        id: 1,
        ...this.jiraProjects[0],
      };
    });
    this.server.delete('/projects/:id/jira', () => {
      return {};
    });

    await render(hbs`<JiraProject @project={{this.project}} />`);
    await click('[data-test-select-project-button]');

    await clickTrigger('.select-repo-class');
    // Select first repo in power select dropdown
    await selectChoose('.select-repo-class', '.ember-power-select-option', 0);

    await clickTrigger('.select-threshold-class');
    // Select first threshold in power select dropdown
    await selectChoose(
      '.select-threshold-class',
      '.ember-power-select-option',
      0
    );

    await click('[data-test-modal-save-button]');

    assert
      .dom('[data-test-jira-project-key-name]')
      .containsText(`${this.jiraProjects[0].key}-${this.jiraProjects[0].name}`);
    assert.dom('[data-test-jira-project-risk]').containsText(`Low`);
    assert.dom('[data-test-delete-project-trigger]').exists();
    assert.dom('[data-test-edit-project-trigger]').exists();

    await click('[data-test-delete-project-trigger]');
    assert.dom(`[data-test-delete-modal]`).hasClass('is-active');

    // TODO: Modify to a better implementation
    const deleteConfirmButton = this.element
      .querySelector(`[data-test-delete-modal]`)
      .querySelectorAll('button[data-ember-action]')[1];

    await click(deleteConfirmButton);
    assert.strictEqual(
      this.notifyService.get('successMsg'),
      `t:projectRemoved:()`,
      'Displays the right success message'
    );

    assert.dom('[data-test-jira-project-key-name]').doesNotExist();
    assert.dom('[data-test-jira-project-risk]').doesNotExist();
    assert.dom('[data-test-delete-project-trigger]').doesNotExist();
    assert.dom('[data-test-edit-project-trigger]').doesNotExist();

    // Check for select button
    assert.dom('[data-test-select-project-button]').exists();
    assert
      .dom('[data-test-select-project-button]')
      .hasText('t:selectProject:()');
  });

  test('it closes the delete modal when cancel is clicked', async function (assert) {
    this.server.get('/organizations/:id/jira_projects', () => {
      return this.jiraProjects;
    });
    this.server.post('/projects/:id/jira', () => {
      return {
        ...this.jiraProjects[0],
        id: 1,
      };
    });

    await render(hbs`<JiraProject @project={{this.project}} />`);
    await click('[data-test-select-project-button]');

    await clickTrigger('.select-repo-class');
    // Select first repo in power select dropdown
    await selectChoose('.select-repo-class', '.ember-power-select-option', 0);

    await clickTrigger('.select-threshold-class');
    // Select first threshold in power select dropdown
    await selectChoose(
      '.select-threshold-class',
      '.ember-power-select-option',
      0
    );

    await click('[data-test-modal-save-button]');

    assert
      .dom('[data-test-jira-project-key-name]')
      .containsText(`${this.jiraProjects[0].key}-${this.jiraProjects[0].name}`);
    assert.dom('[data-test-jira-project-risk]').containsText(`Low`);
    assert.dom('[data-test-delete-project-trigger]').exists();
    assert.dom('[data-test-edit-project-trigger]').exists();

    await click('[data-test-delete-project-trigger]');
    assert.dom(`[data-test-delete-modal]`).hasClass('is-active');

    // TODO: Modify to a better implementation
    const deleteCancelButton = this.element
      .querySelector(`[data-test-delete-modal]`)
      .querySelectorAll('button[data-ember-action]')[0];

    await click(deleteCancelButton);

    assert.dom(`[data-test-delete-modal]`).doesNotHaveClass('is-active');
    assert
      .dom('[data-test-jira-project-key-name]')
      .containsText(`${this.jiraProjects[0].key}-${this.jiraProjects[0].name}`);
    assert.dom('[data-test-jira-project-risk]').containsText(`Low`);
    assert.dom('[data-test-delete-project-trigger]').exists();
    assert.dom('[data-test-edit-project-trigger]').exists();
  });

  test('it edits the project when a new repo is selected', async function (assert) {
    this.server.get('/organizations/:id/jira_projects', () => {
      return this.jiraProjects;
    });

    this.server.post('/projects/:id/jira', () => {
      return { id: 1, ...this.jiraProjects[0] };
    });

    this.server.put('/projects/:id/jira', (_, request) => {
      const requestBody = JSON.parse(request.requestBody);
      const targetedProject = this.jiraProjects.find(
        (project) => project.key === requestBody.project_key
      );
      return { ...targetedProject };
    });

    await render(hbs`<JiraProject @project={{this.project}} />`);
    await click('[data-test-select-project-button]');

    await clickTrigger('.select-repo-class');
    // Select first repo in power select dropdown
    await selectChoose('.select-repo-class', '.ember-power-select-option', 0);

    await clickTrigger('.select-threshold-class');
    // Select second threshold in power select dropdown
    await selectChoose(
      '.select-threshold-class',
      '.ember-power-select-option',
      1
    );

    await click('[data-test-modal-save-button]');

    assert
      .dom('[data-test-jira-project-key-name]')
      .containsText(`${this.jiraProjects[0].key}-${this.jiraProjects[0].name}`);
    assert.dom('[data-test-jira-project-risk]').containsText(`Medium`);
    assert.dom('[data-test-delete-project-trigger]').exists();
    assert.dom('[data-test-edit-project-trigger]').exists();

    assert.strictEqual(
      this.notifyService.get('successMsg'),
      `t:integratedJIRA:()`
    );

    // Flow for updating the existing JiraIntegration
    await click('[data-test-edit-project-trigger]');

    await clickTrigger('.select-repo-class');
    // Select first repo in power select dropdown
    await selectChoose('.select-repo-class', '.ember-power-select-option', 1);

    await clickTrigger('.select-threshold-class');
    // Select second threshold in power select dropdown
    await selectChoose(
      '.select-threshold-class',
      '.ember-power-select-option',
      0
    );

    // Triggers PUT request
    await click('[data-test-modal-save-button]');

    assert
      .dom('[data-test-jira-project-key-name]')
      .containsText(`${this.jiraProjects[1].key}-${this.jiraProjects[1].name}`);
    assert.dom('[data-test-jira-project-risk]').containsText(`Low`);
    assert.dom('[data-test-delete-project-trigger]').exists();
    assert.dom('[data-test-edit-project-trigger]').exists();
    assert.dom(`[data-test-edit-modal]`).doesNotHaveClass('is-active');
  });
});
