import Service from '@ember/service';
import { isEmpty } from '@ember/utils';
import {
  fillIn,
  findAll,
  render,
  click,
  waitFor,
  find,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { selectChoose } from 'ember-power-select/test-support';

import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { faker } from '@faker-js/faker';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

class OrganizationStub extends Service {
  selected = {
    id: 1,
    features: {
      manualscan: true,
    },
  };
}

module('Integration | Component | project list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    setupFileModelEndpoints(this.server);

    const store = this.owner.lookup('service:store');
    const projectService = this.owner.lookup('service:project');

    projectService.setViewType('card');

    this.setProperties({
      projectService,
      store,
    });

    this.owner.register('service:organization', OrganizationStub);
  });

  test('It renders successfully with no projects', async function (assert) {
    this.server.get('/v3/projects/', () => {
      const results = [];

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v3/risk', () => {
      const results = [];

      return { count: results.length, next: null, previous: null, results };
    });

    await render(hbs`<ProjectList />`);

    assert
      .dom('[data-test-no-project-container]')
      .exists('Empty container exists.');

    assert
      .dom('[data-test-no-project-header]')
      .hasTextContaining(t('uploadAnApp'));

    assert
      .dom('[data-test-no-project-text]')
      .hasTextContaining(t('noProjectExists'));
  });

  test('It renders successfully with at least one project', async function (assert) {
    const projects = this.server.createList('project', 8);

    this.server.get('/v3/projects', (schema) => {
      const results = schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v3/risk', (schema) => {
      const results = schema.fileRisks.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await render(hbs`<ProjectList />`);

    assert
      .dom('[data-test-no-project-container]')
      .doesNotExist('Empty container does not exists.');

    const projectContainerList = findAll(
      '[data-test-project-overview-container]'
    );

    assert.strictEqual(
      projectContainerList.length,
      projects.length,
      'Contains correct number of project overview cards.'
    );
  });

  test('It renders the team list when the team select dropdown is clicked', async function (assert) {
    const projects = this.server.createList('project', 2);
    const teams = this.server.createList('team', 2);

    this.server.get('/v3/projects', (schema) => {
      const results = schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v3/risk', (schema) => {
      const results = schema.fileRisks.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/organizations/:id/teams', (schema) => {
      const results = schema.teams.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await render(hbs`<ProjectList />`);

    const projectContainerList = findAll(
      '[data-test-project-overview-container]'
    );

    assert.strictEqual(
      projectContainerList.length,
      projects.length,
      'Contains correct number of project overview cards.'
    );

    await clickTrigger('[data-test-select-team-container]');

    const teamSelectOptions = findAll(
      '[data-test-select-team-container] .ember-power-select-option'
    );

    // Default teams dropdown list is [{ name: 'All' }] so +1
    assert.strictEqual(
      teamSelectOptions.length,
      teams.length + 1,
      'Team list length is correct.'
    );

    assert.dom(teamSelectOptions[0]).containsText('All');

    teams.forEach((t, i) => {
      assert.dom(teamSelectOptions[i + 1]).containsText(t.name);
    });
  });

  test('It renders the correct project list when a team is selected', async function (assert) {
    const projects = this.server.createList('project', 4);
    this.server.createList('team', 4);

    this.server.get('/v3/projects', (schema, request) => {
      const team = request.queryParams.team;

      const results = team
        ? schema.projects.all().models.slice(0, team === '1' ? 1 : 2) // simulate team filter
        : schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v3/risk', (schema) => {
      const results = schema.fileRisks.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/organizations/:id/teams', (schema) => {
      const results = schema.teams.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await render(hbs`<ProjectList />`);

    await clickTrigger('[data-test-select-team-container]');

    // Select second team in power select dropdown
    await selectChoose('.select-team-class', '.ember-power-select-option', 1);

    let projectContainerList = findAll(
      '[data-test-project-overview-container]'
    );

    // for second team 1 card
    assert.strictEqual(
      projectContainerList.length,
      1,
      'Renders correct number of project overview cards.'
    );

    await clickTrigger('[data-test-select-team-container]');

    // Select third team in power select dropdown
    await selectChoose('.select-team-class', '.ember-power-select-option', 2);

    projectContainerList = findAll('[data-test-project-overview-container]');

    // for all other teams 2 cards
    assert.strictEqual(
      projectContainerList.length,
      2,
      'Contains correct number of project overview cards.'
    );

    // Select all team in power select dropdown
    await selectChoose('.select-team-class', '.ember-power-select-option', 0);

    projectContainerList = findAll('[data-test-project-overview-container]');

    // all projects should be rendered
    assert.strictEqual(
      projectContainerList.length,
      projects.length,
      'Contains all project overview cards.'
    );
  });

  test.each(
    'it renders with correct sortBy selected',
    [
      [() => `${t('dateUpdated')}${t('mostRecent')}`, 0],
      [() => `${t('dateUpdated')}${t('leastRecent')}`, 1],
      [() => `${t('dateCreated')}${t('mostRecent')}`, 2],
      [() => `${t('dateCreated')}${t('leastRecent')}`, 3],
      [() => `${t('packageName')} (Z -> A)`, 4],
      [() => `${t('packageName')} (A -> Z)`, 5],
    ],
    async function (assert, [sortLabel, index]) {
      const projects = this.server.createList('project', 4);

      this.server.get('/v3/projects', (schema) => {
        const results = schema.projects.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/v3/risk', (schema) => {
        const results = schema.fileRisks.all().models;

        return {
          count: results.length,
          next: null,
          previous: null,
          results,
        };
      });

      await render(hbs`<ProjectList />`);

      let projectContainerList = findAll(
        '[data-test-project-overview-container]'
      );

      assert.strictEqual(projects.length, projectContainerList.length);

      await clickTrigger('[data-test-project-sort-property]');

      await selectChoose(
        '.select-sort-class',
        '.ember-power-select-option',
        index
      );

      assert.dom('[data-test-project-sort-property]').containsText(sortLabel());
    }
  );

  test('It filters search list based on the search query', async function (assert) {
    // Creating project list with two items containing two similar url values
    const projects = this.server.createList('project', 8);

    this.server.db.projects.update(projects[5].id, {
      url: 'Duplicate Project',
    });

    this.server.db.projects.update(projects[6].id, {
      url: 'Duplicate Project',
    });

    this.server.get('/v3/projects', (schema, req) => {
      this.set('searchQuery', req.queryParams.q);

      const results = req.queryParams.q
        ? schema.projects.where((p) =>
            p.url.toLowerCase().includes(req.queryParams.q)
          ).models
        : schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await render(hbs`<ProjectList />`);

    // Search Query is set to URL for the first project item
    await fillIn('[data-test-search-query-input]', projects[0].url);

    assert.strictEqual(this.searchQuery, projects[0].url);

    let projectContainerList = findAll(
      '[data-test-project-overview-container]'
    );

    assert.strictEqual(
      projectContainerList.length,
      1,
      'Contains correct number of project overview cards matching search query.'
    );

    // Search for projects with similar keys
    await fillIn('[data-test-search-query-input]', 'duplicate');

    assert.strictEqual(this.searchQuery, 'duplicate');

    projectContainerList = findAll('[data-test-project-overview-container]');

    assert.strictEqual(
      projectContainerList.length,
      2,
      'Filters project list for urls with matching values'
    );
  });

  test('It filters project list when platform value changes', async function (assert) {
    // Creating project list with atleast 1 item having platform value of 0
    const projects = Array.from(new Array(8)).map((_, i) => {
      return this.server.create('project', {
        platform: i === 2 ? 0 : faker.helpers.arrayElement([0, 1]),
      });
    });

    const files = [];
    projects.forEach((project, index) => {
      const fileId = 200 + index + 1;

      const file = this.server.create('file', {
        projectId: project.id,
        id: fileId,
      });
      files.push(file);

      this.server.create('file-risk', {
        file: fileId,
        id: fileId,
      });
    });

    this.server.get('/v3/projects', (schema, req) => {
      const platform = req.queryParams.platform;

      this.set('platform', platform);

      const results =
        !isEmpty(platform) && parseInt(platform) !== -1
          ? schema.projects.where((p) => p.platform === parseInt(platform))
              .models
          : schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v3/risk', (schema, req) => {
      const platform = req.queryParams.platform;

      this.set('platform', platform);

      let results = schema.fileRisks.all().models;

      // Only return risks that map to an existing project's file.
      // `setupFileModelEndpoints` creates a standalone file-risk which would otherwise
      // inflate the risk count for "All" filters.
      results = results.filter((fileRisk) => {
        const fileId = String(fileRisk.id);
        const file = schema.db.files.find(fileId);

        if (!file || !file.projectId) {
          return false;
        }

        const project = schema.db.projects.find(String(file.projectId));
        return Boolean(project);
      });

      if (!isEmpty(platform) && parseInt(platform) !== -1) {
        const platformFilter = parseInt(platform);
        results = results.filter((fileRisk) => {
          // file-risk uses file ID as primary key (from serializer primaryKey = 'file')
          // So fileRisk.id is the file ID
          const fileId = String(fileRisk.id);
          if (!fileId) {
            return false;
          }

          const file = schema.db.files.find(fileId);
          if (!file || !file.projectId) {
            return false;
          }

          const project = schema.db.projects.find(String(file.projectId));
          if (!project) {
            return false;
          }

          return project.platform === platformFilter;
        });
      }

      return {
        count: results.length,
        next: null,
        previous: null,
        results: results.map((r) => r.toJSON()),
      };
    });

    await render(hbs`<ProjectList />`);

    let projectContainerList = findAll(
      '[data-test-project-overview-container]'
    );

    assert.strictEqual(
      projectContainerList.length,
      projects.length,
      'Contains correct number of project overview cards.'
    );

    assert.strictEqual(
      this.projectService.riskQueryResponse.length,
      projects.length,
      'Risk list contains one risk per project for default platform filter.'
    );

    await waitFor('[data-test-select-platform-container]', { timeout: 1000 });

    await clickTrigger('[data-test-select-platform-container]');

    await waitFor('.ember-power-select-option', { timeout: 1000 });

    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      1
    );

    assert.strictEqual(this.platform, '0');

    projectContainerList = findAll('[data-test-project-overview-container]');

    assert.strictEqual(
      projects.filter((p) => p.platform === 0).length,
      projectContainerList.length,
      'Project list items all have platform values matching "0".'
    );

    assert.strictEqual(
      this.projectService.riskQueryResponse.length,
      projects.filter((p) => p.platform === 0).length,
      'Risk list contains one risk per project for platform 0.'
    );

    // Selecting a platform value equal to 1 from the plaform filter options
    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      2
    );

    assert.strictEqual(this.platform, '1');

    projectContainerList = findAll('[data-test-project-overview-container]');

    assert.strictEqual(
      projects.filter((p) => p.platform === 1).length,
      projectContainerList.length,
      'Project list items all have platform values matching "1".'
    );

    // Selecting a platform value equal to -1 from the plaform filter options
    // This should return the entire project list
    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      0
    );

    assert.strictEqual(typeof this.platform, 'undefined');

    projectContainerList = findAll('[data-test-project-overview-container]');

    assert.strictEqual(
      projects.length,
      projectContainerList.length,
      'Project list defaults to complete list when platform value is "-1".'
    );

    assert.strictEqual(
      this.projectService.riskQueryResponse.length,
      projects.length,
      'Risk list contains one risk per project when platform filter is cleared.'
    );
  });

  test('It clears filter after filter is applied', async function (assert) {
    // Creating project list with atleast 1 item having platform value of 0
    const projects = Array.from(new Array(8)).map((_, i) => {
      return this.server.create('project', {
        platform: i === 2 ? 0 : faker.helpers.arrayElement([0, 1]),
      });
    });

    this.server.get('/v3/projects', (schema, req) => {
      const platform = req.queryParams.platform;

      this.set('platform', platform);

      const results =
        !isEmpty(platform) && parseInt(platform) !== -1
          ? schema.projects.where((p) => p.platform === parseInt(platform))
              .models
          : schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await render(hbs`<ProjectList />`);

    assert.dom('[data-test-project-list-header-clear-filter]').doesNotExist();

    await clickTrigger('[data-test-select-platform-container]');

    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      1
    );

    assert.dom('[data-test-project-list-header-clear-filter]').exists();

    // Clear Filter
    await click('[data-test-project-list-header-clear-filter]');

    let projectContainerList = findAll(
      '[data-test-project-overview-container]'
    );

    assert.strictEqual(
      projects.length,
      projectContainerList.length,
      'Project list defaults to complete list when platform value is "-1".'
    );

    assert.dom('[data-test-project-list-header-clear-filter]').doesNotExist();

    await clickTrigger('[data-test-select-platform-container]');

    await selectChoose(
      '.select-platform-class',
      '.ember-power-select-option',
      1
    );

    await clickTrigger('[data-test-select-team-container]');

    // Select third team in power select dropdown
    await selectChoose('.select-team-class', '.ember-power-select-option', 2);

    assert.dom('[data-test-project-list-header-clear-filter]').exists();

    //change again to all and still it exists as platform filter is still applied
    await clickTrigger('[data-test-select-team-container]');

    // Select third team in power select dropdown
    await selectChoose('.select-team-class', '.ember-power-select-option', 0);

    assert.dom('[data-test-project-list-header-clear-filter]').exists();
  });

  test('It switches between card and list views', async function (assert) {
    this.server.createList('project', 3);

    this.server.get('/v3/projects', (schema) => {
      const results = schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await render(hbs`<ProjectList />`);

    // Initially should be in card view (default)
    assert
      .dom('[data-test-project-overview-container]')
      .exists({ count: 3 }, 'Shows 3 project cards in card view');

    assert
      .dom('[data-test-project-list-table]')
      .doesNotExist('Table view is not shown initially');

    await click('[data-test-project-list-header-list-view-btn]');

    assert
      .dom('[data-test-project-overview-container]')
      .doesNotExist('Card view is hidden after switching to list view');

    assert
      .dom('[data-test-project-list-table]')
      .exists('Table view is shown after clicking list view button');

    assert
      .dom('[data-test-project-list-table-row]')
      .exists({ count: 3 }, 'Shows 3 project rows in table view');

    await click('[data-test-project-list-header-card-view-btn]');

    assert
      .dom('[data-test-project-overview-container]')
      .exists(
        { count: 3 },
        'Shows 3 project cards after switching back to card view'
      );
    assert
      .dom('[data-test-project-list-table]')
      .doesNotExist('Table view is hidden after switching back to card view');
  });

  test('It manages columns in list view', async function (assert) {
    this.server.createList('project', 2);

    this.server.get('/v3/projects', (schema) => {
      const results = schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await render(hbs`<ProjectList />`);

    // Switch to list view and open column manager
    await click('[data-test-project-list-header-list-view-btn]');
    await click('[data-test-projectList-header-columnManagerBtn]');

    // Find a hideable column that is currently selected
    const hideableColumns = [
      'packageName',
      'lastFile.version',
      'lastFile.versionCode',
      'severityLevel',
      'scanStatus',
      'lastFile.createdOnDateTime',
      'tags',
    ];

    let columnToToggle;

    for (const field of hideableColumns) {
      const checkbox = find(
        `[data-test-projectList-columnManager-columnCheckbox="${field}"]`
      );

      if (checkbox && checkbox.checked) {
        columnToToggle = field;
        break;
      }
    }

    assert.ok(columnToToggle, 'Found a hideable column that is selected');

    // Uncheck the column
    await click(
      `[data-test-projectList-columnManager-columnCheckbox="${columnToToggle}"]`
    );

    await click('[data-test-projectList-columnManager-apply]');

    // Get columns after hiding one
    const headerAfterHide = find('[data-test-project-list-column-header]');

    const visibleColumnsAfterHide = Array.from(
      headerAfterHide.querySelectorAll('th')
    )
      .map((th) => th.textContent.trim())
      .filter(Boolean);

    // Verify the column is hidden
    assert.notOk(
      visibleColumnsAfterHide.some((col) => col.includes(t(columnToToggle))),
      `"${t(columnToToggle)}" column should be hidden`
    );

    // Reopen column manager and re-enable the column
    await click('[data-test-projectList-header-columnManagerBtn]');

    // Find the checkbox again after re-opening
    const updatedCheckbox = find(
      `[data-test-projectList-columnManager-columnCheckbox="${columnToToggle}"]`
    );

    assert.ok(
      updatedCheckbox,
      'Should find the column checkbox after re-opening'
    );

    await click(updatedCheckbox);
    await click('[data-test-projectList-columnManager-apply]');

    // Get columns after re-enabling
    const headerAfterReenable = find('[data-test-project-list-column-header]');
    const visibleColumnsAfterReenable = Array.from(
      headerAfterReenable.querySelectorAll('th')
    )
      .map((th) => th.textContent.trim())
      .filter(Boolean);

    // Verify the column is visible again
    assert.ok(
      visibleColumnsAfterReenable.some((col) =>
        col.includes(t(columnToToggle))
      ),
      `"${t(columnToToggle)}" column should be visible again`
    );
  });

  test('It resets columns to default when reset button is clicked', async function (assert) {
    assert.expect(9);

    this.server.createList('project', 2);

    this.server.get('/v3/projects', (schema) => {
      const results = schema.projects.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await render(hbs`<ProjectList />`);

    // Switch to list view and open column manager
    await click('[data-test-project-list-header-list-view-btn]');
    await click('[data-test-projectList-header-columnManagerBtn]');

    // Get the initial state of columns
    const initialHeader = find('[data-test-project-list-column-header]');

    const initialColumns = Array.from(initialHeader.querySelectorAll('th'))
      .map((th) => th.textContent.trim())
      .filter(Boolean);

    // Hide a column
    const columnToHide = 'packageName';

    await click(
      `[data-test-projectList-columnManager-columnCheckbox="${columnToHide}"]`
    );

    await click('[data-test-projectList-columnManager-apply]');

    // Get visible columns after hiding one
    const headerAfterHide = find('[data-test-project-list-column-header]');
    const visibleColumnsAfterHide = Array.from(
      headerAfterHide.querySelectorAll('th')
    )
      .map((th) => th.textContent.trim())
      .filter(Boolean);

    // Verify the column is hidden
    assert.notOk(
      visibleColumnsAfterHide.some((col) => col.includes(columnToHide)),
      `"${columnToHide}" column should be hidden`
    );

    // Reopen column manager and click reset
    await click('[data-test-projectList-header-columnManagerBtn]');
    await click('[data-test-projectList-columnManager-reset]');
    await click('[data-test-projectList-columnManager-apply]');

    // Get visible columns after reset
    const headerAfterReset = find('[data-test-project-list-column-header]');
    const visibleColumnsAfterReset = Array.from(
      headerAfterReset.querySelectorAll('th')
    )
      .map((th) => th.textContent.trim())
      .filter(Boolean);

    // Verify all default columns are visible again
    initialColumns.forEach((columnName, index) => {
      assert.strictEqual(
        visibleColumnsAfterReset[index],
        columnName,
        `Column "${columnName}" should be visible at position ${index}`
      );
    });
  });
});
