import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { Response } from 'miragejs';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  root: '[data-test-fileDetails-overdueVulnerabilities]',
  icon: '[data-test-fileDetails-overdueVulnerabilities-icon]',
  count: '[data-test-fileDetails-overdueVulnerabilities-count]',
  reviewLink: '[data-test-fileDetails-overdueVulnerabilities-reviewLink]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<FileDetails::OverdueVulnerabilities @file={{this.file}} />`;

const COUNT_URL = '/v3/projects/:id/overdue_vulnerabilities_count';

// ─── Test suite ────────────────────────────────────────────────────────────────
module(
  'Integration | Component | file-details/overdue-vulnerabilities',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');

      const file = this.server.create('file', { project: '1' });
      this.server.create('project', { id: '1', last_file: file });

      this.server.create('project-overdue-vulnerabilities-count', {
        id: '1',
      });

      this.server.get('/v3/projects/:id', (schema, req) =>
        schema.projects.find(req.params.id).toJSON()
      );

      this.server.get(COUNT_URL, (schema) => {
        const { count } = schema.projectOverdueVulnerabilitiesCounts
          .find('1')
          .toJSON();

        return { count };
      });

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        overdue: () =>
          this.server.db.projectOverdueVulnerabilitiesCounts.find('1'),
        requests: [],
      });
    });

    // ─── Visibility ──────────────────────────────────────────────────────────
    test('it renders the overdue count and the review link', async function (assert) {
      await render(TEMPLATE);

      const { count } = this.overdue();

      assert.dom(selectors.icon).hasAttribute('icon', /notifications/);

      assert
        .dom(selectors.count)
        .hasText(t('overdueVulnerabilities.count', { count }));

      assert
        .dom(selectors.reviewLink)
        .hasText(t('overdueVulnerabilities.review'))
        .hasAttribute(
          'href',
          new RegExp(`/dashboard/file/${this.file.id}/overdue-vulnerabilities$`)
        );
    });

    test('it uses the singular label for a single overdue vulnerability', async function (assert) {
      this.server.db.projectOverdueVulnerabilitiesCounts.update('1', {
        count: 1,
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.count)
        .hasText(t('overdueVulnerabilities.count', { count: 1 }));

      assert.notStrictEqual(
        t('overdueVulnerabilities.count', { count: 1 }),
        t('overdueVulnerabilities.count', { count: 2 }),
        'singular and plural labels differ'
      );
    });

    test('it renders nothing when no vulnerability is overdue', async function (assert) {
      this.server.db.projectOverdueVulnerabilitiesCounts.update('1', {
        count: 0,
      });

      await render(TEMPLATE);

      assert.dom(selectors.root).doesNotExist();
    });

    test('it renders nothing when the count cannot be loaded', async function (assert) {
      this.server.get(
        COUNT_URL,
        () => new Response(500, {}, { detail: 'Server error' })
      );

      await render(TEMPLATE);

      assert.dom(selectors.root).doesNotExist();
    });

    // ─── Request ─────────────────────────────────────────────────────────────
    test('it requests the overdue count of the file project', async function (assert) {
      this.server.get(COUNT_URL, (schema, request) => {
        this.requests.push(request);

        return { count: 0 };
      });

      await render(TEMPLATE);

      assert.strictEqual(this.requests.length, 1);
      assert.strictEqual(this.requests[0].params.id, '1');

      assert.true(
        this.requests[0].url.endsWith(
          '/api/v3/projects/1/overdue_vulnerabilities_count'
        ),
        `expected the project overdue count endpoint, got ${this.requests[0].url}`
      );
    });
  }
);
