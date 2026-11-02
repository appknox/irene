import Service from '@ember/service';
import { click, render, waitFor, waitUntil } from '@ember/test-helpers';
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

// ─── Selectors ────────────────────────────────────────────────────────────────
const selectors = {
  loading: '[data-test-knoxIqAutofixHistory-loading]',
  empty: '[data-test-knoxIqAutofixHistory-empty]',
  row: '[data-test-knoxIqAutofixHistory-row]',
  branch: '[data-test-knoxIqAutofixHistory-branch]',
  baseBranch: '[data-test-knoxIqAutofixHistory-baseBranch]',
  prLink: '[data-test-knoxIqAutofixHistory-prLink]',
  drawer: '[data-test-knoxIqAutofixHistory-drawer]',
  drawerTitle: '[data-test-knoxIqAutofixHistory-drawerTitle]',
  drawerBaseBranch: '[data-test-knoxIqAutofixHistory-drawerBaseBranch]',
  drawerBranch: '[data-test-knoxIqAutofixHistory-drawerBranch]',
  drawerSubtitle: '[data-test-knoxIqAutofixHistory-drawerSubtitle]',
  commit: (id) => `[data-test-knoxIqAutofixHistory-commit='${id}']`,
  commitLink: '[data-test-knoxIqAutofixHistory-commitLink]',
  patchedFile: '[data-test-knoxIqAutofixHistory-patchedFile]',
  noPatchedFiles: '[data-test-knoxIqAutofixHistory-noPatchedFiles]',
  drawerClose: '[data-test-knoxIqAutofixHistory-drawerClose]',
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

  test('renders the empty project history state', async function (assert) {
    await render(TEMPLATE);
    await waitFor(selectors.empty);

    assert
      .dom(selectors.empty)
      .includesText(t('autofix.emptyTitle'))
      .includesText(t('autofix.emptyDescription'));
    assert.dom(selectors.loading).doesNotExist();
  });

  test('renders one row per pull request with its commits in the drawer', async function (assert) {
    const prUrl = 'https://github.com/appknox/example/pull/16';
    const firstSha = 'a1b2c3d4e5f6789012345678901234567890abcd';
    const secondSha = 'f9e8d7c6b5a4321098765432109876543210fedc';

    this.server.create('autofix-pr', {
      project: 1,
      repo: 'appknox/example',
      base_branch: 'main',
      branch: 'appknox-autofix/analysis-1',
      pr_url: prUrl,
      commits: [
        {
          id: 10,
          file: 20,
          commit_sha: firstSha,
          patched_files: ['app/src/Main.java', 'app/src/Util.java'],
          created_on: new Date().toISOString(),
        },
        {
          id: 11,
          file: 20,
          commit_sha: secondSha,
          patched_files: [],
          created_on: new Date().toISOString(),
        },
      ],
    });

    await render(TEMPLATE);
    await waitFor(selectors.row);

    assert.dom(selectors.row).exists({ count: 1 }, 'one row per pull request');
    assert.dom(selectors.baseBranch).hasText('main');
    assert.dom(selectors.branch).hasText('appknox-autofix/analysis-1');
    assert
      .dom(selectors.prLink)
      .hasText('#16')
      .hasAttribute('href', prUrl)
      .hasAttribute('target', '_blank');

    await click(selectors.baseBranch);

    assert.dom(selectors.drawer).exists();
    assert.dom(selectors.drawerTitle).hasText(t('autofix.detailsTitle'));
    assert
      .dom(selectors.drawerSubtitle)
      .hasText(t('autofix.generatedFromScan'));
    assert.dom(selectors.drawerBaseBranch).hasText('main');
    assert.dom(selectors.drawerBranch).hasText('appknox-autofix/analysis-1');
    assert.dom(selectors.commitLink).exists({ count: 2 });

    const firstCommit = selectors.commit(10);
    const secondCommit = selectors.commit(11);

    assert
      .dom(`${firstCommit} ${selectors.commitLink}`)
      .hasText('a1b2c3d')
      .hasAttribute('href', `${prUrl}/commits/${firstSha}`);
    assert.dom(`${firstCommit} ${selectors.patchedFile}`).exists({ count: 2 });
    assert
      .dom(`${firstCommit} ${selectors.patchedFile}`)
      .hasText('app/src/Main.java');

    assert
      .dom(`${secondCommit} ${selectors.commitLink}`)
      .hasText('f9e8d7c')
      .hasAttribute('href', `${prUrl}/commits/${secondSha}`);
    assert.dom(`${secondCommit} ${selectors.patchedFile}`).doesNotExist();
    assert
      .dom(`${secondCommit} ${selectors.noPatchedFiles}`)
      .hasText(t('autofix.noPatchedFiles'));

    await click(selectors.drawerClose);
    await waitUntil(() => !document.querySelector(selectors.drawer));

    assert.dom(selectors.drawer).doesNotExist();
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
});
