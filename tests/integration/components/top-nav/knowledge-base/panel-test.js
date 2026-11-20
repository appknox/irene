import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, fillIn, findAll, render, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

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

const ARTICLE = {
  ...SUGGESTED[0],
  body: '<p>Here is the list.</p><a href="https://owasp.org/x">OWASP</a><a href="#Steps">Steps</a><h2 id="Steps">Steps</h2>',
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

        return req.queryParams.q === 'keychain'
          ? {
              results: [
                {
                  id: '3',
                  title: 'Unsecured KeyChain Data',
                  description: '',
                  url: 'https://help.appknox.com/en/knowledge/keychain',
                  category_id: '10',
                  snippet: 'Keychain is an encrypted container',
                },
              ],
            }
          : { results: [] };
      });

      this.server.get('/v2/hubspot/kb/:id/', () => ARTICLE);
    });

    test('it shows the welcome header, search and suggested articles', async function (assert) {
      await render(
        hbs`<TopNav::KnowledgeBase::Panel @onClose={{this.onClose}} />`
      );

      assert
        .dom('[data-test-knowledgeBasePanel-title]')
        .hasText(t('knowledgeBasePanel.welcome'));

      assert
        .dom('[data-test-knowledgeBasePanel-gotQuestions]')
        .hasText(t('knowledgeBasePanel.gotQuestions'));

      assert
        .dom('[data-test-knowledgeBasePanel-searchInput]')
        .hasAttribute('placeholder', t('knowledgeBasePanel.searchPlaceholder'));

      assert
        .dom('[data-test-knowledgeBasePanel-listLabel]')
        .hasText(t('knowledgeBasePanel.suggestedArticles'));

      const titles = findAll('[data-test-knowledgeBasePanel-articleTitle]');

      assert.deepEqual(
        titles.map((el) => el.textContent.trim()),
        SUGGESTED.map((a) => a.title)
      );

      assert.dom('[data-test-knowledgeBasePanel-backBtn]').doesNotExist();
    });

    test('search shows matching articles with a snippet', async function (assert) {
      await render(
        hbs`<TopNav::KnowledgeBase::Panel @onClose={{this.onClose}} />`
      );

      await fillIn('[data-test-knowledgeBasePanel-searchInput]', 'keychain');

      assert
        .dom('[data-test-knowledgeBasePanel-listLabel]')
        .hasText(t('knowledgeBasePanel.searchResults'));

      assert
        .dom('[data-test-knowledgeBasePanel-articleTitle]')
        .exists({ count: 1 })
        .hasText('Unsecured KeyChain Data');

      assert
        .dom('[data-test-knowledgeBasePanel-articleSnippet]')
        .hasText('Keychain is an encrypted container');

      assert.deepEqual(this.searchQueries, ['keychain']);
    });

    test('search with no matches says so', async function (assert) {
      await render(
        hbs`<TopNav::KnowledgeBase::Panel @onClose={{this.onClose}} />`
      );

      await fillIn('[data-test-knowledgeBasePanel-searchInput]', 'xyzzy');

      assert
        .dom('[data-test-knowledgeBasePanel-noArticles]')
        .hasText(t('knowledgeBasePanel.noArticles'));
    });

    test('opening an article shows it inline, and Back returns to the list', async function (assert) {
      await render(
        hbs`<TopNav::KnowledgeBase::Panel @onClose={{this.onClose}} />`
      );

      await click('[data-test-knowledgeBasePanel-articleItem="1"]');

      assert
        .dom('[data-test-knowledgeBasePanel-articleHeading]')
        .hasText(ARTICLE.title);

      assert
        .dom('[data-test-knowledgeBasePanel-articleBody]')
        .containsText('Here is the list.');

      assert
        .dom('[data-test-knowledgeBasePanel-openInHelpCenter]')
        .hasAttribute('href', ARTICLE.url)
        .hasAttribute('target', '_blank')
        .hasAttribute('rel', 'noopener noreferrer');

      assert.dom('[data-test-knowledgeBasePanel-title]').doesNotExist();

      await click('[data-test-knowledgeBasePanel-backBtn]');

      assert.dom('[data-test-knowledgeBasePanel-article]').doesNotExist();
      assert
        .dom('[data-test-knowledgeBasePanel-articleItem]')
        .exists({ count: 2 });
    });

    test('links in an article open in a new tab, anchors stay in the panel', async function (assert) {
      await render(
        hbs`<TopNav::KnowledgeBase::Panel @onClose={{this.onClose}} />`
      );

      await click('[data-test-knowledgeBasePanel-articleItem="1"]');
      await click(
        '[data-test-knowledgeBasePanel-articleBody] a[href^="https"]'
      );

      assert.deepEqual(this.window.opened, [
        ['https://owasp.org/x', '_blank', 'noopener,noreferrer'],
      ]);

      await click(
        '[data-test-knowledgeBasePanel-articleBody] a[href="#Steps"]'
      );

      assert.strictEqual(this.window.opened.length, 1, 'anchor does not open');
    });

    test('it shows an error when the knowledge base is unavailable', async function (assert) {
      this.server.get('/v2/hubspot/kb/', {}, 503);

      await render(
        hbs`<TopNav::KnowledgeBase::Panel @onClose={{this.onClose}} />`
      );

      assert
        .dom('[data-test-knowledgeBasePanel-errorTitle]')
        .hasText(t('knowledgeBasePanel.errorTitle'));

      assert.dom('[data-test-knowledgeBasePanel-searchInput]').doesNotExist();
    });

    test('the close button closes the panel', async function (assert) {
      await render(
        hbs`<TopNav::KnowledgeBase::Panel @onClose={{this.onClose}} />`
      );

      await click('[data-test-knowledgeBasePanel-closeBtn]');
      await waitUntil(() => this.closed === 1, { timeout: 1000 });

      assert.strictEqual(this.closed, 1);
    });
  }
);
