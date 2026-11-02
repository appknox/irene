import Service from '@ember/service';
import {
  click,
  findAll,
  render,
  waitFor,
  waitUntil,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { Response } from 'miragejs';
import { module, test } from 'qunit';

class NotificationsStub extends Service {
  errorMsg = null;

  error(message) {
    this.errorMsg = message;
  }
}

class RouterStub extends Service {
  transitionedWith = null;

  transitionTo(args) {
    this.transitionedWith = args;
  }
}

// ─── Selectors ────────────────────────────────────────────────────────────────
const selectors = {
  empty: '[data-test-knoxIqAutofixHistory-empty]',
  emptyTitle: '[data-test-knoxIqAutofixHistory-emptyTitle]',
  emptyDescription: '[data-test-knoxIqAutofixHistory-emptyDescription]',
  loading: '[data-test-knoxIqAutofixHistory-loading]',
  table: '[data-test-knoxIqAutofixHistory-table]',
  header: (valuePath) =>
    `[data-test-knoxIqAutofixHistory-header='${valuePath}']`,
  row: '[data-test-knoxIqAutofixHistory-row]',
  baseBranch: '[data-test-knoxIqAutofixHistory-baseBranch]',
  branch: '[data-test-knoxIqAutofixHistory-branch]',
  prLink: '[data-test-knoxIqAutofixHistory-prLink]',
  updatedOn: '[data-test-knoxIqAutofixHistory-updatedOn]',
  pagination: '[data-test-knoxIqAutofixHistory-pagination]',
  paginationNext: '[data-test-pagination-next-btn]',
  drawer: '[data-test-knoxIqAutofixHistoryRunDrawer-root]',
  drawerBaseBranch: '[data-test-knoxIqAutofixHistoryRunDrawer-baseBranch]',
  drawerCommitLink: '[data-test-knoxIqAutofixHistoryRunDrawer-commitLink]',
};

// ─── Template ─────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <KnoxIq::AutofixHistory
    @project={{this.project}}
    @queryParams={{this.queryParams}}
  />
`;

module('Integration | Component | knox-iq/autofix-history', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.unregister('service:router');
    this.owner.register('service:router', RouterStub);

    const store = this.owner.lookup('service:store');
    const project = this.server.create('project', { id: '1' });

    this.setProperties({
      project: store.push(store.normalize('project', project.toJSON())),
      queryParams: {
        autofix_limit: '10',
        autofix_offset: '0',
      },
    });
  });

  // ─── Empty and error states ──────────────────────────────────────────────────

  test('renders the empty history state', async function (assert) {
    await render(TEMPLATE);
    await waitFor(selectors.empty);

    assert.dom(selectors.emptyTitle).hasText(t('autofix.emptyTitle'));
    assert
      .dom(selectors.emptyDescription)
      .hasText(t('autofix.emptyDescription'));
    assert.dom(selectors.loading).doesNotExist();
    assert.dom(selectors.table).doesNotExist();
  });

  test('reports an API failure', async function (assert) {
    this.server.get(
      '/knoxiq/project/:projectId/knoxfixer_prs/',
      () => new Response(500)
    );

    await render(TEMPLATE);

    const notify = this.owner.lookup('service:notifications');
    await waitUntil(() => notify.errorMsg);

    assert.strictEqual(
      notify.errorMsg,
      'The backend responded with an error',
      'shows the API error'
    );
  });

  // ─── Table ───────────────────────────────────────────────────────────────────

  test('renders the table headers', async function (assert) {
    this.server.create('autofix-pr', { project: 1 });

    await render(TEMPLATE);
    await waitFor(selectors.row);

    assert.dom(selectors.header('baseBranch')).hasText(t('autofix.baseBranch'));
    assert.dom(selectors.header('branch')).hasText(t('autofix.branch'));
    assert.dom(selectors.header('prUrl')).hasText(t('autofix.pullRequest'));
    assert.dom(selectors.header('updatedOn')).hasText(t('autofix.updated'));
  });

  test('renders one row per pull request', async function (assert) {
    const prs = this.server.createList('autofix-pr', 2, { project: 1 });

    await render(TEMPLATE);
    await waitFor(selectors.row);

    const rows = findAll(selectors.row);

    assert.strictEqual(rows.length, prs.length);

    prs.forEach((pr, i) => {
      const prNumber = pr.pr_url.match(/\/pull\/(\d+)/)[1];

      assert.dom(selectors.baseBranch, rows[i]).hasText(pr.base_branch);
      assert.dom(selectors.branch, rows[i]).hasText(pr.branch);
      assert
        .dom(selectors.prLink, rows[i])
        .hasText(`#${prNumber}`)
        .hasAttribute('href', pr.pr_url)
        .hasAttribute('target', '_blank')
        .hasAttribute('aria-label', t('autofix.openPullRequest'));
      assert.dom(selectors.updatedOn, rows[i]).hasAnyText();
    });

    assert.dom(selectors.pagination).exists();
  });

  test('shows the full pull request URL when it has no PR number', async function (assert) {
    const pr = this.server.create('autofix-pr', {
      project: 1,
      pr_url: 'https://github.com/appknox/example/tree/autofix',
    });

    await render(TEMPLATE);
    await waitFor(selectors.row);

    assert.dom(selectors.prLink).hasText(pr.pr_url);
  });

  test('lists only pull requests with commits for the selected file', async function (assert) {
    const matching = this.server.create('autofix-pr', {
      project: 1,
      commits: [
        {
          id: 1,
          file: 20,
          commit_sha: 'a1b2c3d4e5f6789012345678901234567890abcd',
          patched_files: [],
          created_on: new Date().toISOString(),
        },
      ],
    });

    this.server.create('autofix-pr', {
      project: 1,
      commits: [
        {
          id: 2,
          file: 99,
          commit_sha: 'f9e8d7c6b5a4321098765432109876543210fedc',
          patched_files: [],
          created_on: new Date().toISOString(),
        },
      ],
    });

    this.set('queryParams', { ...this.queryParams, file_id: '20' });

    await render(TEMPLATE);
    await waitFor(selectors.row);

    assert.dom(selectors.row).exists({ count: 1 });
    assert.dom(selectors.branch).hasText(matching.branch);
  });

  // ─── Pagination ──────────────────────────────────────────────────────────────

  test('transitions with the next page query params', async function (assert) {
    this.server.createList('autofix-pr', 11, { project: 1 });
    this.set('queryParams', { ...this.queryParams, file_id: '20' });

    const router = this.owner.lookup('service:router');

    await render(TEMPLATE);
    await waitFor(selectors.row);

    assert.strictEqual(router.transitionedWith, null);

    await click(selectors.paginationNext);

    assert.deepEqual(router.transitionedWith, {
      queryParams: {
        autofix_limit: 10,
        autofix_offset: 10,
        file_id: '20',
      },
    });
  });

  // ─── Run drawer ──────────────────────────────────────────────────────────────

  test('opens the run drawer for the clicked row', async function (assert) {
    const pr = this.server.create('autofix-pr', { project: 1 });

    await render(TEMPLATE);
    await waitFor(selectors.row);

    assert.dom(selectors.drawer).doesNotExist();

    await click(selectors.baseBranch);

    assert.dom(selectors.drawerBaseBranch).hasText(pr.base_branch);
    assert
      .dom(selectors.drawerCommitLink)
      .hasAttribute('href', `${pr.pr_url}/commits/${pr.commits[0].commit_sha}`);
  });

  test('links commits to the repository when the pull request URL is missing', async function (assert) {
    const pr = this.server.create('autofix-pr', {
      project: 1,
      pr_url: null,
    });

    await render(TEMPLATE);
    await waitFor(selectors.row);
    await click(selectors.baseBranch);

    assert
      .dom(selectors.drawerCommitLink)
      .hasAttribute(
        'href',
        `https://github.com/${pr.repo}/commit/${pr.commits[0].commit_sha}`
      );
  });
});
