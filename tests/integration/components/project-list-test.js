/* eslint-disable prettier/prettier, qunit/no-commented-tests */
import Service from '@ember/service';
import { underscore } from '@ember/string';
import { render, select, typeIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import {
  clickTrigger,
  selectChoose,
} from 'ember-power-select/test-support/helpers';
import { setupRenderingTest } from 'ember-qunit';
import { Response } from 'miragejs';
import { module, test } from 'qunit';

class OrganizationStub extends Service {
  selected = {
    id: 1,
    features: {
      manualscan: true,
    },
  };
}

function profile_serializer(payload) {
  const serializedPayload = {};
  Object.keys(payload.attrs).forEach((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });

  return serializedPayload;
}

function paginate_object(dataModels, request, searchFilterKey) {
  let page = 1;
  let pageSize = 9;

  if (request.queryParams.limit !== undefined) {
    pageSize = Number(request.queryParams.limit).valueOf();
  }

  let maxPages = dataModels.length / pageSize;

  if (dataModels.length % pageSize > 0) {
    maxPages++;
  }

  if (request.queryParams.offset !== undefined) {
    page = Number(request.queryParams.offset).valueOf();
    if (page > maxPages) {
      return [404, { 'Content-Type': 'text/html' }, '<h1>Page not found</h1>'];
    }
  }

  let nextPage = page + 1;
  let nextUrl = null;
  if (nextPage <= maxPages) {
    nextUrl = '/organizations/1/projects?offset=' + nextPage;
  }

  let previousPage = page - 1;
  let previousUrl = null;
  if (previousPage > 1) {
    previousUrl = '/organizations/1/projects?offset=' + previousPage;
  } else if (previousPage === 1) {
    // The DRF previous URL doesn't always include the page=1 query param in the results for page 2.
    previousUrl = '/organizations/1/projects';
  }

  // Filtering based on search query
  const searchQuery = request.queryParams?.q;
  let filteredResults = [];
  if (searchQuery && searchFilterKey) {
    // Returns only items that match the search query
    filteredResults = dataModels.filter((model) => {
      return model[searchFilterKey]?.toLowerCase().includes(searchQuery);
    });
  }

  let offset = page * pageSize;
  const results = searchQuery ? filteredResults : dataModels;

  return new Response(
    200,
    { 'Content-Type': 'application/json' },
    JSON.stringify({
      count: results.length,
      next: nextUrl,
      previous: previousUrl,
      results: results.slice(offset, offset + pageSize),
    })
  );
}

module('Integration | Component | project list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.owner.register('service:organization', OrganizationStub);
  });

  test('It renders successfully with no projects', async function (assert) {
    this.server.get('/organizations/:id/projects', (schema, request) => {
      return paginate_object([], request);
    });

    await render(hbs`<ProjectList />`);

    assert
      .dom(`[data-test-no-project-container]`)
      .exists('Empty container exists.');
    assert
      .dom(`[data-test-no-project-header]`)
      .exists()
      .hasTextContaining('t:noProject:()');
    assert
      .dom(`[data-test-no-project-uploaded-text]`)
      .exists()
      .hasTextContaining('t:noProjectUploaded:()');
    assert
      .dom(`[data-test-upload-new-project-text]`)
      .exists()
      .hasTextContaining('t:uploadNewProject:()');
  });

  test('It renders successfully with at least one project', async function (assert) {
    this.server.createList('profile', 8);
    this.server.createList('project', 8);

    this.server.get('/organizations/:id/projects', (schema, request) => {
      return paginate_object(schema.projects.all().models, request);
    });

    this.server.get(
      '/profiles/:id/unknown_analysis_status',
      (schema, request) => {
        return profile_serializer(schema['profiles'].find(request.params.id));
      }
    );

    await render(hbs`<ProjectList />`);

    assert
      .dom(`[data-test-no-project-container]`)
      .doesNotExist('Empty container does not exists.');

    const projectListOverviewElements = this.element.querySelectorAll(
      '[data-test-project-overview-container]'
    );
    assert.strictEqual(
      projectListOverviewElements.length,
      8,
      'Contains correct number of project overview cards.'
    );
  });

  test('It renders the team list when the team select dropdown is clicked', async function (assert) {
    this.server.createList('profile', 2);
    this.server.createList('project', 2);
    const teamList = this.server.createList('team', 2);

    this.server.get('/organizations/:id/projects', (schema, request) => {
      return paginate_object(schema.projects.all().models, request);
    });

    this.server.get('/organizations/:id/teams', (schema) => {
      return schema.teams.all().models;
    });

    this.server.get(
      '/profiles/:id/unknown_analysis_status',
      (schema, request) => {
        return profile_serializer(schema['profiles'].find(request.params.id));
      }
    );

    await render(hbs`<ProjectList />`);
    const projectListOverviewElements = this.element.querySelectorAll(
      '[data-test-project-overview-container]'
    );

    assert.strictEqual(
      projectListOverviewElements.length,
      2,
      'Contains correct number of project overview cards.'
    );

    await clickTrigger('[data-test-select-team-container]');

    const teamSelectOptions = this.element.querySelectorAll(
      '[data-test-select-team-container] .ember-power-select-option'
    );

    // Default teams dropdown list is [{ name: 'All' }] which makes it three in all
    assert.strictEqual(
      teamSelectOptions.length,
      3,
      'Team list length is correct.'
    );

    for (let i = 0; i < teamSelectOptions.length; i++) {
      if (i === 0) {
        continue;
      }

      // The assertion starts from index 1 because of the default list ([{ name: 'All' }])
      // is not part of the results being returned

      const teamListOption = teamList[i - 1];
      assert
        .dom(`[data-option-index="${i}"]`) // From power-select api
        .containsText(`${teamListOption.name}`);
    }
  });

  test('It renders the correct project list when a team is selected', async function (assert) {
    this.server.createList('profile', 4);
    this.server.createList('project', 4);
    this.server.createList('team', 2);

    this.server.get('/organizations/:id/projects', (schema, request) => {
      if (request.queryParams.team === '1') {
        // Returns only first two items when the second team on the list is selected
        // Assume that this matches the returned result from the backend when the second team is selected
        return paginate_object(
          schema.projects.all().models.slice(0, 2),
          request
        );
      }

      return paginate_object(schema.projects.all().models, request);
    });

    this.server.get('/organizations/:id/teams', (schema) => {
      return schema.teams.all().models;
    });

    this.server.get(
      '/profiles/:id/unknown_analysis_status',
      (schema, request) => {
        return profile_serializer(schema['profiles'].find(request.params.id));
      }
    );

    await render(hbs`<ProjectList />`);

    await clickTrigger('[data-test-select-team-container]');

    // Select second team in power select dropdown
    await selectChoose('.select-team-class', '.ember-power-select-option', 1);
    const projectListOverviewElements = this.element.querySelectorAll(
      '[data-test-project-overview-container]'
    );

    assert.strictEqual(
      projectListOverviewElements.length,
      2,
      'Contains correct number of project overview cards.'
    );
  });

  test('It filters search list based on the search query', async function (assert) {
    this.server.createList('profile', 7);
    this.server.createList('team', 2);

    // Creating project list with two items containing two similar url values
    const projects = [];
    for (let projectId = 1; projectId <= 7; projectId++) {
      let project = null;

      if (projectId === 5 || projectId === 6) {
        project = this.server.create('project', projectId, {
          url: 'Duplicate Project',
        });
      } else {
        project = this.server.create('project', projectId);
      }

      projects.push(project);
    }

    this.server.get('/organizations/:id/projects', (schema, request) => {
      return paginate_object(schema.projects.all().models, request, 'url');
    });

    this.server.get('/organizations/:id/teams', (schema) => {
      return schema.teams.all().models;
    });

    this.server.get(
      '/profiles/:id/unknown_analysis_status',
      (schema, request) => {
        return profile_serializer(schema['profiles'].find(request.params.id));
      }
    );

    await render(hbs`<ProjectList />`);

    // Search Query is set to URL for the first project item
    await typeIn(`[data-test-search-query-input]`, projects[0].url);

    let projectListOverviewElements = this.element.querySelectorAll(
      '[data-test-project-overview-container]'
    );

    assert.strictEqual(
      projectListOverviewElements.length,
      1,
      'Contains correct number of project overview cards matching search query.'
    );

    await render(hbs`<ProjectList />`);

    // Search for projects with similar keys
    await typeIn(`[data-test-search-query-input]`, 'duplicate');

    projectListOverviewElements = this.element.querySelectorAll(
      '[data-test-project-overview-container]'
    );

    assert.strictEqual(
      projectListOverviewElements.length,
      2,
      'Filters project list for urls with matching values'
    );
  });

  test('It filters project list when platform value changes', async function (assert) {
    this.server.createList('profile', 4);
    this.server.createList('team', 2);

    // Creating project list with atleast two items having platform values of 0
    for (let projectId = 1; projectId <= 4; projectId++) {
      if (projectId === 2 || projectId === 3) {
        this.server.create('project', projectId, {
          platform: 0,
        });
      } else {
        this.server.create('project', projectId);
      }
    }

    this.server.get('/organizations/:id/projects', (schema, request) => {
      const platformFilterValue = request.queryParams?.platform;

      if (platformFilterValue) {
        return paginate_object(
          schema.projects
            .all()
            .models.filter((model) =>
              Number(platformFilterValue) === -1
                ? true
                : model.platform === Number(platformFilterValue)
            ),
          request,
          'url'
        );
      }

      return paginate_object(schema.projects.all().models, request, 'url');
    });

    this.server.get('/organizations/:id/teams', (schema) => {
      return schema.teams.all().models;
    });

    this.server.get(
      '/profiles/:id/unknown_analysis_status',
      (schema, request) => {
        return profile_serializer(schema['profiles'].find(request.params.id));
      }
    );

    await render(hbs`<ProjectList />`);
    const platformFilterOptions = this.element.querySelectorAll(
      `[data-test-platform-filter-option]`
    );

    // Selecting a platform value equal to 0 from the plaform filter options
    await select(`[data-test-platform-filter]`, platformFilterOptions[1].value);

    let projectListOverviewElements = this.element.querySelectorAll(
      '[data-test-project-overview-container]'
    );

    assert.ok(
      projectListOverviewElements.length >= 2,
      'Project list items all have platform values matching "0".'
    );

    // Selecting a platform value equal to -1 from the plaform filter options
    // This should return the entire project list
    await select(`[data-test-platform-filter]`, platformFilterOptions[0].value);
    projectListOverviewElements = this.element.querySelectorAll(
      '[data-test-project-overview-container]'
    );

    assert.strictEqual(
      projectListOverviewElements.length,
      4,
      'Project list defaults to complete list when platform value is "-1".'
    );
  });
});
