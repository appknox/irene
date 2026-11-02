import { click, findAll, render, triggerKeyEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

// ─── Selectors ────────────────────────────────────────────────────────────────
const selectors = {
  root: '[data-test-knoxIqAutofixHistoryRunDrawer-root]',
  title: '[data-test-knoxIqAutofixHistoryRunDrawer-title]',
  subtitle: '[data-test-knoxIqAutofixHistoryRunDrawer-subtitle]',
  close: '[data-test-knoxIqAutofixHistoryRunDrawer-close]',
  baseBranch: '[data-test-knoxIqAutofixHistoryRunDrawer-baseBranch]',
  branch: '[data-test-knoxIqAutofixHistoryRunDrawer-branch]',
  commit: '[data-test-knoxIqAutofixHistoryRunDrawer-commit]',
  commitLink: '[data-test-knoxIqAutofixHistoryRunDrawer-commitLink]',
  commitCreatedOn: '[data-test-knoxIqAutofixHistoryRunDrawer-commitCreatedOn]',
  patchedFilesLabel:
    '[data-test-knoxIqAutofixHistoryRunDrawer-patchedFilesLabel]',
  patchedFile: '[data-test-knoxIqAutofixHistoryRunDrawer-patchedFile]',
  noPatchedFiles: '[data-test-knoxIqAutofixHistoryRunDrawer-noPatchedFiles]',
};

// ─── Template ─────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <KnoxIq::AutofixHistory::RunDrawer @run={{this.run}} @onClose={{this.onClose}} />
`;

const toRun = (pr) => ({
  id: pr.id,
  baseBranch: pr.base_branch,
  branch: pr.branch,
  prUrl: pr.pr_url,
  prLabel: pr.pr_url,
  updatedOn: new Date(pr.updated_on),
  commits: pr.commits.map((commit) => ({
    id: commit.id,
    sha: commit.commit_sha,
    shortSha: commit.commit_sha.slice(0, 7),
    url: `${pr.pr_url}/commits/${commit.commit_sha}`,
    patchedFiles: commit.patched_files,
    createdOn: commit.created_on,
  })),
});

module(
  'Integration | Component | knox-iq/autofix-history/run-drawer',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      const pr = this.server.create('autofix-pr', {
        commits: [
          {
            id: 10,
            file: 20,
            commit_sha: 'a1b2c3d4e5f6789012345678901234567890abcd',
            patched_files: ['app/src/Main.java', 'app/src/Util.java'],
            created_on: new Date().toISOString(),
          },
          {
            id: 11,
            file: 20,
            commit_sha: 'f9e8d7c6b5a4321098765432109876543210fedc',
            patched_files: [],
            created_on: new Date().toISOString(),
          },
        ],
      });

      this.setProperties({
        run: toRun(pr),
        closeCalls: 0,
        onClose: () => this.set('closeCalls', this.closeCalls + 1),
      });
    });

    // ─── Visibility ──────────────────────────────────────────────────────────────

    test('renders nothing without a run', async function (assert) {
      this.set('run', null);

      await render(TEMPLATE);

      assert.dom(selectors.root).doesNotExist();
    });

    // ─── Content ─────────────────────────────────────────────────────────────────

    test('renders the header and run summary', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.title).hasText(t('autofix.detailsTitle'));
      assert.dom(selectors.subtitle).hasText(t('autofix.generatedFromScan'));
      assert.dom(selectors.close).hasAttribute('aria-label', t('close'));
      assert.dom(selectors.baseBranch).hasText(this.run.baseBranch);
      assert.dom(selectors.branch).hasText(this.run.branch);
    });

    test('renders every commit with its patched files', async function (assert) {
      assert.expect(17);

      await render(TEMPLATE);

      const commits = findAll(selectors.commit);

      assert.strictEqual(commits.length, this.run.commits.length);

      this.run.commits.forEach((commit, i) => {
        assert
          .dom(selectors.commitLink, commits[i])
          .hasText(commit.shortSha)
          .hasAttribute('href', commit.url)
          .hasAttribute('target', '_blank')
          .hasAttribute(
            'aria-label',
            t('autofix.openCommit', { sha: commit.sha })
          );
        assert.dom(selectors.commitCreatedOn, commits[i]).hasAnyText();
        assert
          .dom(selectors.patchedFilesLabel, commits[i])
          .includesText(t('autofix.patchedFiles'));

        const files = findAll(selectors.patchedFile, commits[i]);

        assert.strictEqual(files.length, commit.patchedFiles.length);

        commit.patchedFiles.forEach((file, j) => {
          assert.dom(files[j]).hasText(file);
        });
      });
    });

    test('shows the empty patched files message for a commit without files', async function (assert) {
      await render(TEMPLATE);

      const [withFiles, withoutFiles] = findAll(selectors.commit);

      assert.dom(selectors.noPatchedFiles, withFiles).doesNotExist();
      assert
        .dom(selectors.noPatchedFiles, withoutFiles)
        .hasText(t('autofix.noPatchedFiles'));
    });

    // ─── Closing ─────────────────────────────────────────────────────────────────

    test('calls onClose when the close button is clicked', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(this.closeCalls, 0);

      await click(selectors.close);

      assert.strictEqual(this.closeCalls, 1);
    });

    test('calls onClose when Escape is pressed', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(this.closeCalls, 0);

      await triggerKeyEvent(document, 'keydown', 'Escape');

      assert.strictEqual(this.closeCalls, 1);
    });

    test('ignores Escape without a run', async function (assert) {
      this.set('run', null);

      await render(TEMPLATE);
      await triggerKeyEvent(document, 'keydown', 'Escape');

      assert.strictEqual(this.closeCalls, 0);
    });
  }
);
