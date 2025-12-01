import Service from '@ember/service';
import { isEmpty } from '@ember/utils';
import { fillIn, findAll, render, click, waitFor } from '@ember/test-helpers';
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

    this.server.get('/profiles/:id/unknown_analysis_status', (schema, req) => {
      return { id: req.params.id, status: faker.datatype.boolean() };
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

    this.server.get('/profiles/:id/unknown_analysis_status', (schema, req) => {
      return { id: req.params.id, status: faker.datatype.boolean() };
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

    this.server.get('/profiles/:id/unknown_analysis_status', (schema, req) => {
      return { id: req.params.id, status: faker.datatype.boolean() };
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

      this.server.get(
        '/profiles/:id/unknown_analysis_status',
        (schema, req) => {
          return { id: req.params.id, status: faker.datatype.boolean() };
        }
      );

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

    this.server.get('/profiles/:id/unknown_analysis_status', (schema, req) => {
      return { id: req.params.id, status: faker.datatype.boolean() };
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

    this.server.get('/profiles/:id/unknown_analysis_status', (schema, req) => {
      return { id: req.params.id, status: faker.datatype.boolean() };
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

    this.server.get('/profiles/:id/unknown_analysis_status', (schema, req) => {
      return { id: req.params.id, status: faker.datatype.boolean() };
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
});
