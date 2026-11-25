import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import {
  click,
  fillIn,
  findAll,
  render,
  settled,
  waitFor,
  waitUntil,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// ─── Selectors ───────────────────────────────────────────────────────────

const P = '[data-test-topNav-knowledgeBase-panel';

const selectors = {
  title: `${P}-title]`,
  gotQuestions: `${P}-gotQuestions]`,
  searchInput: `${P}-searchInput]`,
  listLabel: `${P}-listLabel]`,
  loader: `${P}-loader]`,
  noArticles: `${P}-noArticles]`,
  articleItem: `${P}-articleItem]`,
  articleItemById: (id) => `${P}-articleItem="${id}"]`,
  articleTitle: `${P}-articleTitle]`,
  articleSnippet: `${P}-articleSnippet]`,
  article: `${P}-article]`,
  articleHeading: `${P}-articleHeading]`,
  articleBody: `${P}-articleBody]`,
  openInHelpCenter: `${P}-openInHelpCenter]`,
  backBtn: `${P}-backBtn]`,
  closeBtn: `${P}-closeBtn]`,
  error: `${P}-error]`,
  errorTitle: `${P}-errorTitle]`,
  errorDescription: `${P}-errorDescription]`,
  bodyLink: (href) => `${P}-articleBody] a[href="${href}"]`,
};

// ─── Fixtures ────────────────────────────────────────────────────────────

const TEMPLATE = hbs`<TopNav::KnowledgeBase::Panel @onClose={{this.onClose}} />`;

const SUGGESTED = [
  {
    id: '1',
    title: 'Test cases executed during SAST',
    description: '',
    url: 'https://help.appknox.com/en/knowledge/sast',
    category_id: '10',
  },
  {
    id: '2',
    title: 'Roles & Privileges',
    description: '',
    url: 'https://help.appknox.com/en/knowledge/roles',
    category_id: '10',
  },
];

const SEARCH_RESULT = {
  id: '3',
  title: 'Unsecured KeyChain Data',
  description: '',
  url: 'https://help.appknox.com/en/knowledge/keychain',
  category_id: '10',
  snippet: 'Keychain is an encrypted container',
};

const ARTICLE = {
  ...SUGGESTED[0],
  body: '<p>Here is the list.</p><a href="https://owasp.org/x">OWASP</a><a href="/en/knowledge/other">Other</a><a href="#Steps">Steps</a><h2 id="Steps">Steps</h2>',
};

class WindowStub extends Service {
  opened = [];

  open(...args) {
    this.opened.push(args);
  }
}

module(
  'Integration | Component | top-nav/knowledge-base/panel',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:browser/window', WindowStub);
      this.window = this.owner.lookup('service:browser/window');

      this.closed = 0;
      this.onClose = () => (this.closed += 1);
      this.searchQueries = [];

      this.server.get('/v2/hubspot/kb/', () => ({
        suggested: SUGGESTED,
        categories: [],
      }));

      this.server.get('/v2/hubspot/kb/search/', (_, req) => {
        this.searchQueries.push(req.queryParams.q);

        return {
          results: req.queryParams.q === 'keychain' ? [SEARCH_RESULT] : [],
        };
      });

      this.server.get('/v2/hubspot/kb/:id/', () => ARTICLE);
    });

    test('it shows the welcome header, search and suggested articles', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.title).hasText(t('knowledgeBasePanel.welcome'));

      assert
        .dom(selectors.gotQuestions)
        .hasText(t('knowledgeBasePanel.gotQuestions'));

      assert
        .dom(selectors.searchInput)
        .hasAttribute('placeholder', t('knowledgeBasePanel.searchPlaceholder'));

      assert
        .dom(selectors.listLabel)
        .hasText(t('knowledgeBasePanel.suggestedArticles'));

      const titles = findAll(selectors.articleTitle);

      assert.strictEqual(titles.length, SUGGESTED.length);

      assert.deepEqual(
        titles.map((el) => el.textContent.trim()),
        SUGGESTED.map((a) => a.title)
      );

      assert.dom(selectors.articleSnippet).doesNotExist();
      assert.dom(selectors.backBtn).doesNotExist();
    });

    test('it shows a loader while the suggested articles load', async function (assert) {
      this.server.timing = 200;

      render(TEMPLATE);

      await waitFor(selectors.loader);

      assert.dom(selectors.loader).exists();
      assert.dom(selectors.articleItem).doesNotExist();

      await settled();

      assert.dom(selectors.loader).doesNotExist();
      assert.dom(selectors.articleItem).exists({ count: SUGGESTED.length });
    });

    test('it shows no list when there are no suggested articles', async function (assert) {
      this.server.get('/v2/hubspot/kb/', () => ({
        suggested: [],
        categories: [],
      }));

      await render(TEMPLATE);

      assert.dom(selectors.articleItem).doesNotExist();
      assert.dom(selectors.noArticles).doesNotExist();
      assert.dom(selectors.searchInput).exists();
    });

    test('search shows matching articles with a snippet', async function (assert) {
      await render(TEMPLATE);

      assert.deepEqual(this.searchQueries, []);

      await fillIn(selectors.searchInput, 'keychain');

      assert
        .dom(selectors.listLabel)
        .hasText(t('knowledgeBasePanel.searchResults'));

      assert.dom(selectors.articleItem).exists({ count: 1 });
      assert.dom(selectors.articleTitle).hasText(SEARCH_RESULT.title);
      assert.dom(selectors.articleSnippet).hasText(SEARCH_RESULT.snippet);
      assert.deepEqual(this.searchQueries, ['keychain']);
    });

    test('search with no matches says so', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.noArticles).doesNotExist();

      await fillIn(selectors.searchInput, 'xyzzy');

      assert
        .dom(selectors.noArticles)
        .hasText(t('knowledgeBasePanel.noArticles'));
    });

    test('clearing the search shows the suggested articles again', async function (assert) {
      await render(TEMPLATE);
      await fillIn(selectors.searchInput, 'keychain');

      assert.dom(selectors.articleItem).exists({ count: 1 });

      await fillIn(selectors.searchInput, '');

      assert
        .dom(selectors.listLabel)
        .hasText(t('knowledgeBasePanel.suggestedArticles'));

      assert.dom(selectors.articleItem).exists({ count: SUGGESTED.length });
    });

    test('a failed search shows the error and keeps the search box', async function (assert) {
      this.server.get('/v2/hubspot/kb/search/', {}, 503);

      await render(TEMPLATE);

      assert.dom(selectors.error).doesNotExist();

      await fillIn(selectors.searchInput, 'keychain');

      assert
        .dom(selectors.errorTitle)
        .hasText(t('knowledgeBasePanel.errorTitle'));

      assert
        .dom(selectors.errorDescription)
        .hasText(t('knowledgeBasePanel.errorDescription'));

      assert.dom(selectors.searchInput).exists();

      await fillIn(selectors.searchInput, '');

      assert.dom(selectors.error).doesNotExist();
      assert.dom(selectors.articleItem).exists({ count: SUGGESTED.length });
    });

    test('a throttled (429) search is shown as an error', async function (assert) {
      // The real service starts a countdown timer, which never settles.
      this.owner.register(
        'service:rate-limit',
        class extends Service {
          handleResponse() {}
          clearCountdown() {}
        }
      );

      this.server.get('/v2/hubspot/kb/search/', { detail: 'slow down' }, 429);

      await render(TEMPLATE);
      await fillIn(selectors.searchInput, 'keychain');

      assert
        .dom(selectors.errorTitle)
        .hasText(t('knowledgeBasePanel.errorTitle'));

      assert.dom(selectors.articleItem).doesNotExist();
    });

    test('it shows the error when the knowledge base is unavailable', async function (assert) {
      this.server.get('/v2/hubspot/kb/', {}, 503);

      await render(TEMPLATE);

      assert
        .dom(selectors.errorTitle)
        .hasText(t('knowledgeBasePanel.errorTitle'));

      assert.dom(selectors.searchInput).exists();
      assert.dom(selectors.articleItem).doesNotExist();
    });

    test('opening an article shows it inline, and Back returns to the list', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.article).doesNotExist();

      await click(selectors.articleItemById('1'));

      assert.dom(selectors.articleHeading).hasText(ARTICLE.title);
      assert.dom(selectors.articleBody).containsText('Here is the list.');

      assert
        .dom(selectors.openInHelpCenter)
        .hasAttribute('href', ARTICLE.url)
        .hasAttribute('target', '_blank')
        .hasAttribute('rel', 'noopener noreferrer');

      assert
        .dom(selectors.openInHelpCenter)
        .hasAttribute('aria-label', t('knowledgeBasePanel.openInHelpCenter'))
        .hasAttribute('title', t('knowledgeBasePanel.openInHelpCenter'));

      assert.dom(selectors.title).doesNotExist();
      assert.dom(selectors.backBtn).hasText(t('back'));

      await click(selectors.backBtn);

      assert.dom(selectors.article).doesNotExist();
      assert.dom(selectors.title).exists();
      assert.dom(selectors.articleItem).exists({ count: SUGGESTED.length });
    });

    test('a failed article shows the error, and Back returns to the list', async function (assert) {
      this.server.get('/v2/hubspot/kb/:id/', {}, 500);

      await render(TEMPLATE);
      await click(selectors.articleItemById('1'));

      assert.dom(selectors.article).doesNotExist();
      assert
        .dom(selectors.errorTitle)
        .hasText(t('knowledgeBasePanel.errorTitle'));

      await click(selectors.backBtn);

      assert.dom(selectors.error).doesNotExist();
      assert.dom(selectors.articleItem).exists({ count: SUGGESTED.length });
    });

    test('links open in a new tab against the help center, anchors scroll in the panel', async function (assert) {
      await render(TEMPLATE);
      await click(selectors.articleItemById('1'));

      assert.deepEqual(this.window.opened, []);

      await click(selectors.bodyLink('https://owasp.org/x'));
      await click(selectors.bodyLink('/en/knowledge/other'));

      assert.deepEqual(this.window.opened, [
        ['https://owasp.org/x', '_blank', 'noopener,noreferrer'],
        [
          'https://help.appknox.com/en/knowledge/other',
          '_blank',
          'noopener,noreferrer',
        ],
      ]);

      const heading = document.querySelector(`${selectors.articleBody} #Steps`);
      let scrolled = false;

      heading.scrollIntoView = () => (scrolled = true);

      await click(selectors.bodyLink('#Steps'));

      assert.true(scrolled, 'the anchor target is scrolled into view');
      assert.strictEqual(this.window.opened.length, 2, 'anchor does not open');
    });

    test('the close button closes the panel', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(this.closed, 0);
      assert.dom(selectors.closeBtn).hasAttribute('aria-label', t('close'));

      await click(selectors.closeBtn);
      await waitUntil(() => this.closed === 1, { timeout: 1000 });

      assert.strictEqual(this.closed, 1);
    });
    test('it shows a loader while an article loads', async function (assert) {
      await render(TEMPLATE);

      this.server.timing = 200;

      click(selectors.articleItemById('1'));

      await waitFor(selectors.loader);

      assert.dom(selectors.loader).exists();
      assert.dom(selectors.article).doesNotExist();

      await settled();

      assert.dom(selectors.loader).doesNotExist();
      assert.dom(selectors.articleHeading).hasText(ARTICLE.title);
    });

    test('a suggested-articles error stays after searching and clearing', async function (assert) {
      this.server.get('/v2/hubspot/kb/', {}, 503);

      await render(TEMPLATE);

      assert.dom(selectors.error).exists();

      await fillIn(selectors.searchInput, 'keychain');

      assert.dom(selectors.error).doesNotExist();
      assert.dom(selectors.articleItem).exists({ count: 1 });

      await fillIn(selectors.searchInput, '');

      assert
        .dom(selectors.errorTitle)
        .hasText(t('knowledgeBasePanel.errorTitle'));
    });

    test('an unexpected suggested-articles payload is shown as an error', async function (assert) {
      this.server.get('/v2/hubspot/kb/', () => ({ unexpected: true }));

      await render(TEMPLATE);

      assert
        .dom(selectors.errorTitle)
        .hasText(t('knowledgeBasePanel.errorTitle'));
    });

    test('an unexpected article payload is shown as an error', async function (assert) {
      this.server.get('/v2/hubspot/kb/:id/', () => ({ id: '1' }));

      await render(TEMPLATE);
      await click(selectors.articleItemById('1'));

      assert.dom(selectors.article).doesNotExist();
      assert
        .dom(selectors.errorTitle)
        .hasText(t('knowledgeBasePanel.errorTitle'));
    });

    test('list items show the article icon', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(`${selectors.articleItemById('1')} [data-test-ak-icon]`)
        .hasAttribute('icon', /import-contacts/);
    });
  }
);
