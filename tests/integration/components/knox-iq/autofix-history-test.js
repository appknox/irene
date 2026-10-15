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
  commitLink: '[data-test-knoxIqAutofixHistory-commitLink]',
  drawer: '[data-test-knoxIqAutofixHistory-drawer]',
  drawerTitle: '[data-test-knoxIqAutofixHistory-drawerTitle]',
  drawerBaseBranch: '[data-test-knoxIqAutofixHistory-drawerBaseBranch]',
  drawerBranch: '[data-test-knoxIqAutofixHistory-drawerBranch]',
  drawerCommitLink: '[data-test-knoxIqAutofixHistory-drawerCommitLink]',
  fileId: '[data-test-knoxIqAutofixHistory-fileId]',
  patchedFile: '[data-test-knoxIqAutofixHistory-patchedFile]',
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

  test('renders pull request and commit details', async function (assert) {
    const commitSha = 'a1b2c3d4e5f6789012345678901234567890abcd';
    const patchedFile = 'app/src/Main.java';

    this.server.create('autofix-pr', {
      project: 1,
      repo: 'appknox/example',
      base_branch: 'main',
      branch: 'appknox-autofix/analysis-1',
      pr_url: 'https://github.com/appknox/example/pull/16',
      commits: [
        {
          id: 10,
          file: 20,
          commit_sha: commitSha,
          patched_files: [patchedFile],
          created_on: new Date().toISOString(),
        },
      ],
    });

    await render(TEMPLATE);
    await waitFor(selectors.row);

    assert.dom(selectors.row).exists({ count: 1 });
    assert.dom(selectors.baseBranch).hasText('main');
    assert.dom(selectors.branch).hasText('appknox-autofix/analysis-1');
    assert.dom(selectors.commitLink).hasText('a1b2c3d');
    assert
      .dom(selectors.commitLink)
      .hasAttribute(
        'href',
        `https://github.com/appknox/example/commit/${commitSha}`
      );
    assert.dom(selectors.commitLink).hasAttribute('target', '_blank');

    await click(selectors.baseBranch);

    assert.dom(selectors.drawer).exists();
    assert.dom(selectors.drawerTitle).hasText(t('autofix.detailsTitle'));
    assert.dom(selectors.drawerBaseBranch).hasText('main');
    assert.dom(selectors.drawerBranch).hasText('appknox-autofix/analysis-1');
    assert
      .dom(selectors.drawerCommitLink)
      .hasAttribute(
        'href',
        `https://github.com/appknox/example/commit/${commitSha}`
      )
      .includesText(commitSha);
    assert.dom(selectors.fileId).hasText('20');
    assert.dom(selectors.patchedFile).hasText(patchedFile);

    await click(selectors.drawerClose);
    await waitUntil(() => !document.querySelector(selectors.drawer));

    assert.dom(selectors.drawer).doesNotExist();
  });

  test('reports an API failure', async function (assert) {
    this.server.get(
      '/knoxiq/project/:projectId/autofix_prs/',
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
