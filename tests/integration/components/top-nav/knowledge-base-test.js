import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

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

  test('it opens the configured knowledge base in a new tab', async function (assert) {
    this.configuration.integrationData = { knowledge_base_url: KB_URL };

    await render(hbs`<TopNav::KnowledgeBase />`);

    assert
      .dom('[data-test-topNav-KnowledgeBaseBtn]')
      .exists()
      .hasText(t('knowledgeBase'));

    await click('[data-test-topNav-KnowledgeBaseBtn]');

    assert.deepEqual(this.window.opened, [
      [KB_URL, '_blank', 'noopener,noreferrer'],
    ]);
    assert.strictEqual(this.freshdesk.widgetOpened, 0, 'widget is not used');
  });

  test('the configured url wins over the Freshdesk widget', async function (assert) {
    this.configuration.integrationData = { knowledge_base_url: KB_URL };
    this.freshdesk.supportWidgetIsEnabled = true;

    await render(hbs`<TopNav::KnowledgeBase />`);
    await click('[data-test-topNav-KnowledgeBaseBtn]');

    assert.strictEqual(this.window.opened.length, 1);
    assert.strictEqual(this.freshdesk.widgetOpened, 0);
  });

  test('in widget mode it opens the HubSpot Help tab, not a new tab', async function (assert) {
    this.configuration.integrationData = {
      knowledge_base_url: KB_URL,
      knowledge_base_mode: 'widget',
    };

    await render(hbs`<TopNav::KnowledgeBase />`);

    assert.dom('[data-test-topNav-KnowledgeBaseBtn]').exists();

    await click('[data-test-topNav-KnowledgeBaseBtn]');

    assert.strictEqual(this.hubspot.helpTabOpened, 1);
    assert.strictEqual(this.window.opened.length, 0);
    assert.strictEqual(this.freshdesk.widgetOpened, 0);
  });

  test('widget mode alone shows the button even without a url', async function (assert) {
    this.configuration.integrationData = { knowledge_base_mode: 'widget' };

    await render(hbs`<TopNav::KnowledgeBase />`);

    assert.dom('[data-test-topNav-KnowledgeBaseBtn]').exists();

    await click('[data-test-topNav-KnowledgeBaseBtn]');

    assert.strictEqual(this.hubspot.helpTabOpened, 1);
  });

  test('widget mode falls back to the new tab if the widget is not ready', async function (assert) {
    this.hubspot.widgetReady = false;
    this.configuration.integrationData = {
      knowledge_base_url: KB_URL,
      knowledge_base_mode: 'widget',
    };

    await render(hbs`<TopNav::KnowledgeBase />`);
    await click('[data-test-topNav-KnowledgeBaseBtn]');

    assert.deepEqual(this.window.opened, [
      [KB_URL, '_blank', 'noopener,noreferrer'],
    ]);
  });

  test('without the widget mode the Help tab is never used', async function (assert) {
    this.configuration.integrationData = { knowledge_base_url: KB_URL };

    await render(hbs`<TopNav::KnowledgeBase />`);
    await click('[data-test-topNav-KnowledgeBaseBtn]');

    assert.strictEqual(this.hubspot.helpTabOpened, 0);
    assert.strictEqual(this.window.opened.length, 1);
  });

  test('it falls back to the Freshdesk widget when no url is configured', async function (assert) {
    this.freshdesk.supportWidgetIsEnabled = true;

    await render(hbs`<TopNav::KnowledgeBase />`);

    assert.dom('[data-test-topNav-KnowledgeBaseBtn]').exists();

    await click('[data-test-topNav-KnowledgeBaseBtn]');

    assert.strictEqual(this.freshdesk.widgetOpened, 1);
    assert.strictEqual(this.window.opened.length, 0);
  });

  test('it is hidden when neither a url nor the widget is configured', async function (assert) {
    await render(hbs`<TopNav::KnowledgeBase />`);

    assert.dom('[data-test-topNav-KnowledgeBaseBtn]').doesNotExist();
  });

  test('it ignores an unsafe configured url', async function (assert) {
    this.configuration.integrationData = {
      knowledge_base_url: 'javascript:alert(1)',
    };

    await render(hbs`<TopNav::KnowledgeBase />`);

    assert.dom('[data-test-topNav-KnowledgeBaseBtn]').doesNotExist();
  });
});
