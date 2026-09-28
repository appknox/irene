import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import {
  click,
  find,
  findAll,
  render,
  waitFor,
  waitUntil,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { Response } from 'miragejs';

class RouterStub extends Service {
  currentRouteName = 'authenticated.dashboard.file.overdue-vulnerabilities';
  transitionedTo = null;

  transitionTo(...args) {
    this.transitionedTo = args;
  }

  urlFor() {
    return '/';
  }
}

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  setDefaultAutoClear() {}
}

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  title: '[data-test-overdueVulnerabilities-title]',
  countChip: '[data-test-overdueVulnerabilities-countChip]',
  count: '[data-test-overdueVulnerabilities-count]',
  slaPolicyBtn: '[data-test-overdueVulnerabilities-slaPolicyBtn]',
  empty: '[data-test-overdueVulnerabilities-empty]',
  emptyTitle: '[data-test-overdueVulnerabilities-emptyTitle]',
  emptyDescription: '[data-test-overdueVulnerabilities-emptyDescription]',
  tableLoading: '[data-test-overdueVulnerabilities-table-loading]',
  table: '[data-test-overdueVulnerabilities-table]',
  rows: '[data-test-overdueVulnerabilities-table-row]',
  headerCells: '[data-test-overdueVulnerabilities-table-headerCell]',
  drawer: '[data-test-overdueVulnerabilities-slaPolicyDrawer]',
  drawerTitle: '[data-test-overdueVulnerabilities-slaPolicyDrawer-title]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<OverdueVulnerabilities
  @file={{this.file}}
  @queryParams={{this.queryParams}}
/>`;

const LIST_URL = '/v3/projects/:id/overdue_vulnerabilities';

// ─── Test suite ────────────────────────────────────────────────────────────────
module('Integration | Component | overdue-vulnerabilities', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.owner.unregister('service:router');
    this.owner.register('service:router', RouterStub);
    this.owner.register('service:notifications', NotificationsStub);

    this.server.createList('organization', 1);
    this.server.createList('organization-me', 1);

    this.server.get('/organizations/:id/me', (schema, req) =>
      schema.organizationMes.find(`${req.params.id}`)?.toJSON()
    );

    await this.owner.lookup('service:organization').load();

    const store = this.owner.lookup('service:store');
    const file = this.server.create('file', { project: '1' });

    this.server.create('project', { id: '1', last_file: file });
    this.server.createList('project-overdue-vulnerability', 3);

    this.server.get('/v3/projects/:id', (schema, req) =>
      schema.projects.find(req.params.id).toJSON()
    );

    this.server.get(LIST_URL, (schema, request) => {
      this.requests.push(request);

      const results = schema.projectOverdueVulnerabilities
        .all()
        .models.map((m) => m.toJSON());

      return { count: results.length, next: null, previous: null, results };
    });

    this.setProperties({
      file: store.push(store.normalize('file', file.toJSON())),
      queryParams: {},
      requests: [],
      router: this.owner.lookup('service:router'),
      notify: this.owner.lookup('service:notifications'),
    });
  });

  // ─── Rendering ─────────────────────────────────────────────────────────────
  test('it renders the title, the count and the overdue vulnerabilities', async function (assert) {
    await render(TEMPLATE);

    assert.dom(selectors.title).hasText(t('overdueVulnerabilities.title'));
    assert.dom(selectors.count).hasText('3');

    assert
      .dom(selectors.slaPolicyBtn)
      .hasText(t('overdueVulnerabilities.slaPolicy'));

    assert.strictEqual(findAll(selectors.rows).length, 3);
    assert.dom(selectors.empty).doesNotExist();
  });

  test('it renders the empty state when nothing is overdue', async function (assert) {
    this.server.db.projectOverdueVulnerabilities.remove();

    await render(TEMPLATE);

    assert.dom(selectors.count).hasText('0');

    assert
      .dom(selectors.emptyTitle)
      .hasText(t('overdueVulnerabilities.emptyTitle'));

    assert
      .dom(selectors.emptyDescription)
      .hasText(t('overdueVulnerabilities.emptyDescription'));

    assert.dom(selectors.table).doesNotExist();
  });

  test('it shows the loading table while the list loads', async function (assert) {
    this.server.get(
      LIST_URL,
      () => ({ count: 0, next: null, previous: null, results: [] }),
      { timing: 150 }
    );

    render(TEMPLATE);

    await waitFor(selectors.tableLoading, { timeout: 500 });

    assert.dom(selectors.tableLoading).exists();
    assert.dom(selectors.countChip).doesNotExist();

    await waitUntil(() => !find(selectors.tableLoading), { timeout: 1000 });

    assert.dom(selectors.tableLoading).doesNotExist();
  });

  test('a failed load notifies the error', async function (assert) {
    this.server.get(
      LIST_URL,
      () => new Response(404, {}, { detail: 'Not found.' })
    );

    await render(TEMPLATE);

    assert.strictEqual(this.notify.errorMsg, 'Not found.');
    assert.dom(selectors.table).doesNotExist();
  });

  // ─── Request ───────────────────────────────────────────────────────────────
  test('it requests the project list with the default page and ordering', async function (assert) {
    await render(TEMPLATE);

    assert.strictEqual(this.requests.length, 1);

    assert.true(
      this.requests[0].url.includes(
        '/api/v3/projects/1/overdue_vulnerabilities'
      ),
      `expected the project overdue endpoint, got ${this.requests[0].url}`
    );

    assert.deepEqual(this.requests[0].queryParams, {
      limit: '10',
      offset: '0',
      ordering: '-severity',
    });

    assert.strictEqual(this.router.transitionedTo, null);
  });

  test('it requests the page and ordering from the query params', async function (assert) {
    this.set('queryParams', { limit: 25, offset: 25, ordering: 'overdue_by' });

    await render(TEMPLATE);

    assert.deepEqual(this.requests[0].queryParams, {
      limit: '25',
      offset: '25',
      ordering: 'overdue_by',
    });
  });

  test('changing the ordering reloads the first page and updates the URL', async function (assert) {
    this.set('queryParams', { limit: 10, offset: 10 });

    await render(TEMPLATE);

    await click(findAll(selectors.headerCells)[2]);

    assert.strictEqual(this.requests.length, 2);

    assert.deepEqual(this.requests[1].queryParams, {
      limit: '10',
      offset: '0',
      ordering: 'overdue_by',
    });

    assert.deepEqual(this.router.transitionedTo, [
      { queryParams: { limit: 10, offset: 0, ordering: 'overdue_by' } },
    ]);
  });

  // ─── SLA policy ────────────────────────────────────────────────────────────
  test('the SLA policy button opens the policy drawer', async function (assert) {
    this.server.create('organization-vulnerability-sla', 'withEnabled', {
      id: '1',
    });

    this.server.create('profile', { id: '1' });
    this.server.db.projects.update('1', { active_profile_id: 1 });

    this.server.get('/profiles/:id', (schema, req) =>
      schema.profiles.find(req.params.id).toJSON()
    );

    this.server.get('/profiles/:id/sla_policy', (schema) =>
      schema.profileSlaPolicies.create().toJSON()
    );

    await render(TEMPLATE);

    assert.dom(selectors.drawer).doesNotExist();

    await click(selectors.slaPolicyBtn);

    assert
      .dom(selectors.drawerTitle)
      .hasText(t('overdueVulnerabilities.slaPolicy'));
  });
});
