import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { find, findAll, waitFor } from '@ember/test-helpers';

module(
  'Integration | Component | security/project-search-list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const projects = this.server.createList('project', 5);
      const packageName = projects[0].packageName;

      this.setProperties({
        projects,
        queryParams: {
          component_limit: 10,
          component_offset: 0,
          component_query: '',
        },
        queryParamsWhileSearch: {
          component_limit: 10,
          component_offset: 0,
          component_query: packageName,
        },
      });
    });

    test('it shows project search list page with elements', async function (assert) {
      await render(
        hbs`<Security::ProjectSearchList @queryParams={{this.queryParams}} />`
      );

      assert
        .dom('[data-test-security-project-search-list-heading]')
        .exists()
        .hasText('Projects');

      assert
        .dom('[data-test-security-project-search-list-description]')
        .exists()
        .hasText(
          'Here you can view all the projects that have been uploaded to the dashboard.'
        );

      assert.dom('[data-test-security-project-search-list-input]').exists();
    });

    test('it renders project list', async function (assert) {
      this.server.get('/hudson-api/projects', (schema) => {
        const results = schema.projects.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(
        hbs`<Security::ProjectSearchList @queryParams={{this.queryParams}} />`
      );

      assert.dom('[data-test-security-project-list-table]').exists();

      const headerRow = find(
        '[data-test-security-project-list-thead] tr'
      ).querySelectorAll('th');

      // assert header row
      assert.dom(headerRow[0]).hasText('Project ID');
      assert.dom(headerRow[1]).hasText('Project Name');
      assert.dom(headerRow[2]).hasText('View All Files');

      const contentRows = findAll('[data-test-security-project-list-row]');

      assert.strictEqual(contentRows.length, this.projects.length);
    });

    test('it renders project list loading & empty state', async function (assert) {
      this.server.get(
        '/hudson-api/projects',
        () => {
          return { count: 0, next: null, previous: null, results: [] };
        },
        { timing: 500 }
      );

      // not awaiting here as it stops execution till delayed response is recieved
      render(hbs`
        <Security::ProjectSearchList @queryParams={{this.queryParams}} />
      `);

      await waitFor('[data-test-security-project-search-list-heading]', {
        timeout: 500,
      });

      assert.dom('[data-test-security-project-list-table]').doesNotExist();

      assert.dom('[data-test-security-project-list-loadingSvg]').exists();

      assert.dom('[data-test-security-project-list-loader]').exists();
      assert
        .dom('[data-test-security-project-list-loadingText]')
        .hasText('Loading...');
    });
  }
);
