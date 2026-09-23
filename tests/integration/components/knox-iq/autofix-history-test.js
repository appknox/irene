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
  title: '[data-test-knoxIqAutofixHistory-title]',
  description: '[data-test-knoxIqAutofixHistory-description]',
  loading: '[data-test-knoxIqAutofixHistory-loading]',
  empty: '[data-test-knoxIqAutofixHistory-empty]',
  pr: '[data-test-knoxIqAutofixHistory-pr]',
  prSummary: '[data-test-knoxIqAutofixHistory-prSummary]',
  repository: '[data-test-knoxIqAutofixHistory-repository]',
  toggle: '[data-test-knoxIqAutofixHistory-toggle]',
  branch: '[data-test-knoxIqAutofixHistory-branch]',
  baseBranch: '[data-test-knoxIqAutofixHistory-baseBranch]',
  prLink: '[data-test-knoxIqAutofixHistory-prLink]',
  commit: '[data-test-knoxIqAutofixHistory-commit]',
  commitLink: '[data-test-knoxIqAutofixHistory-commitLink]',
  commitFile: '[data-test-knoxIqAutofixHistory-commitFile]',
  patchedFile: '[data-test-knoxIqAutofixHistory-patchedFile]',
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

    assert.dom(selectors.title).hasText(t('autofix.historyTitle'));
    assert
      .dom(selectors.description)
      .hasText(t('autofix.projectHistoryDescription'));
    assert
      .dom(selectors.empty)
      .includesText(t('autofix.emptyTitle'))
      .includesText(t('autofix.emptyDescription'));
    assert.dom(selectors.loading).doesNotExist();
  });

  test('renders pull request and commit details', async function (assert) {
    const commitSha = 'a1b2c3d4e5f6789012345678901234567890abcd';
    const prUrl = 'https://github.com/appknox/example/pull/16';
    const patchedFile = 'app/src/Main.java';

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
          commit_sha: commitSha,
          patched_files: [patchedFile],
          created_on: new Date().toISOString(),
        },
      ],
    });

    await render(TEMPLATE);
    await waitFor(selectors.pr);

    assert.dom(selectors.pr).exists({ count: 1 });
    assert.dom(selectors.prSummary).exists();
    assert.dom(selectors.repository).hasText('appknox/example');
    assert.dom(selectors.branch).hasText('appknox-autofix/analysis-1');
    assert.dom(selectors.baseBranch).hasText('main');
    assert.dom(selectors.prLink).hasAttribute('href', prUrl);

    await click(selectors.toggle);

    assert.dom(selectors.commit).exists({ count: 1 });
    assert
      .dom(selectors.commitLink)
      .hasAttribute(
        'href',
        `https://github.com/appknox/example/commit/${commitSha}`
      );
    assert
      .dom(selectors.commitFile)
      .includesText(t('autofix.fileId', { fileId: 20 }));
    assert.dom(selectors.patchedFile).hasText(patchedFile);
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
