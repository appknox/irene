import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, render, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// ─── Selectors ───────────────────────────────────────────────────────────

const selectors = {
  knowledgeBaseBtn: '[data-test-topNav-KnowledgeBaseBtn]',
  knowledgeBaseBtnIcon:
    '[data-test-topNav-KnowledgeBaseBtn] [data-test-ak-icon]',
  panelTitle: '[data-test-topNav-knowledgeBase-panel-title]',
  panelCloseBtn: '[data-test-topNav-knowledgeBase-panel-closeBtn]',
};

// ─── Fixtures ────────────────────────────────────────────────────────────

const TEMPLATE = hbs`<TopNav::KnowledgeBase />`;

const KB_URL = 'https://help.appknox.com/en/knowledge';

class WindowStub extends Service {
  opened = [];

  open(...args) {
    this.opened.push(args);
  }
}

class ConfigurationStub extends Service {
  integrationData = { knowledge_base_url: '' };
}

class HubspotStub extends Service {
  chatEnabled = true;
  widgetReady = true;
  helpTabOpened = 0;

  openKnowledgeBase() {
    if (!this.widgetReady) {
      return false;
    }

    this.helpTabOpened += 1;

    return true;
  }
}

class FreshdeskStub extends Service {
  supportWidgetIsEnabled = false;
  widgetOpened = 0;

  openSupportWidget() {
    this.widgetOpened += 1;
  }
}

module('Integration | Component | top-nav/knowledge-base', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.owner.register('service:browser/window', WindowStub);
    this.owner.register('service:configuration', ConfigurationStub);
    this.owner.register('service:freshdesk', FreshdeskStub);
    this.owner.register('service:hubspot', HubspotStub);

    this.window = this.owner.lookup('service:browser/window');
    this.configuration = this.owner.lookup('service:configuration');
    this.freshdesk = this.owner.lookup('service:freshdesk');
    this.hubspot = this.owner.lookup('service:hubspot');
  });

  test('in panel mode it opens the article panel and closes it again', async function (assert) {
    this.configuration.integrationData = {
      knowledge_base_url: KB_URL,
      knowledge_base_mode: 'panel',
    };

    this.server.get('/v2/hubspot/kb/', () => ({
      suggested: [],
      categories: [],
    }));

    await render(TEMPLATE);

    assert.dom(selectors.panelTitle).doesNotExist();

    await click(selectors.knowledgeBaseBtn);

    assert.dom(selectors.panelTitle).hasText(t('knowledgeBasePanel.welcome'));

    assert.strictEqual(this.window.opened.length, 0, 'no new tab');
    assert.strictEqual(this.hubspot.helpTabOpened, 0, 'no Help tab');
    assert.strictEqual(this.freshdesk.widgetOpened, 0, 'no Freshdesk');

    const knowledgeBase = this.owner.lookup('service:knowledge-base');

    await click(selectors.panelCloseBtn);
    await waitUntil(() => !knowledgeBase.isPanelOpen, { timeout: 1000 });

    assert.dom(selectors.panelTitle).doesNotExist();
  });

  test('it opens the configured knowledge base in a new tab', async function (assert) {
    this.configuration.integrationData = { knowledge_base_url: KB_URL };

    await render(TEMPLATE);

    assert.dom(selectors.knowledgeBaseBtn).hasText(t('knowledgeBase'));

    await click(selectors.knowledgeBaseBtn);

    assert.deepEqual(this.window.opened, [
      [KB_URL, '_blank', 'noopener,noreferrer'],
    ]);
    assert.strictEqual(this.freshdesk.widgetOpened, 0, 'widget is not used');
  });

  test('the configured url wins over the Freshdesk widget', async function (assert) {
    this.configuration.integrationData = { knowledge_base_url: KB_URL };
    this.freshdesk.supportWidgetIsEnabled = true;

    await render(TEMPLATE);
    await click(selectors.knowledgeBaseBtn);

    assert.strictEqual(this.window.opened.length, 1);
    assert.strictEqual(this.freshdesk.widgetOpened, 0);
  });

  test('in widget mode it opens the HubSpot Help tab, not a new tab', async function (assert) {
    this.configuration.integrationData = {
      knowledge_base_url: KB_URL,
      knowledge_base_mode: 'widget',
    };

    await render(TEMPLATE);

    assert.dom(selectors.knowledgeBaseBtn).hasText(t('knowledgeBase'));
    assert
      .dom(selectors.knowledgeBaseBtnIcon)
      .hasAttribute('icon', /import-contacts/);

    await click(selectors.knowledgeBaseBtn);

    assert.strictEqual(this.hubspot.helpTabOpened, 1);
    assert.strictEqual(this.window.opened.length, 0);
    assert.strictEqual(this.freshdesk.widgetOpened, 0);
  });

  test('widget mode alone shows the button even without a url', async function (assert) {
    this.configuration.integrationData = { knowledge_base_mode: 'widget' };

    await render(TEMPLATE);

    assert.dom(selectors.knowledgeBaseBtn).hasText(t('knowledgeBase'));

    await click(selectors.knowledgeBaseBtn);

    assert.strictEqual(this.hubspot.helpTabOpened, 1);
  });

  test('widget mode falls back to the new tab if the widget is not ready', async function (assert) {
    this.hubspot.widgetReady = false;
    this.configuration.integrationData = {
      knowledge_base_url: KB_URL,
      knowledge_base_mode: 'widget',
    };

    await render(TEMPLATE);
    await click(selectors.knowledgeBaseBtn);

    assert.deepEqual(this.window.opened, [
      [KB_URL, '_blank', 'noopener,noreferrer'],
    ]);
  });

  test('without the widget mode the Help tab is never used', async function (assert) {
    this.configuration.integrationData = { knowledge_base_url: KB_URL };

    await render(TEMPLATE);
    await click(selectors.knowledgeBaseBtn);

    assert.strictEqual(this.hubspot.helpTabOpened, 0);
    assert.strictEqual(this.window.opened.length, 1);
  });

  test('it falls back to the Freshdesk widget when no url is configured', async function (assert) {
    this.freshdesk.supportWidgetIsEnabled = true;

    await render(TEMPLATE);

    assert.dom(selectors.knowledgeBaseBtn).hasText(t('knowledgeBase'));

    await click(selectors.knowledgeBaseBtn);

    assert.strictEqual(this.freshdesk.widgetOpened, 1);
    assert.strictEqual(this.window.opened.length, 0);
  });

  test('it is hidden when neither a url nor the widget is configured', async function (assert) {
    await render(TEMPLATE);

    assert.dom(selectors.knowledgeBaseBtn).doesNotExist();
  });

  test('it ignores an unsafe configured url', async function (assert) {
    this.configuration.integrationData = {
      knowledge_base_url: 'javascript:alert(1)',
    };

    await render(TEMPLATE);

    assert.dom(selectors.knowledgeBaseBtn).doesNotExist();
  });
});
