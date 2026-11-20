import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

const PORTAL_ID = '1683437';
const CHAT_TOKEN_ENDPOINT = '/api/v2/hubspot/chat-token/';

class WindowStub extends Service {
  hsConversationsSettings = undefined;
  hsConversationsOnReady = undefined;
  HubSpotConversations = undefined;
  appended = [];

  document = {
    getElementById: (id) => this.appended.find((el) => el.id === id) || null,
    createElement: (tag) => ({ tag }),
    body: { appendChild: (el) => this.appended.push(el) },
  };
}

class ConfigurationStub extends Service {
  integrationData = { hubspot_portal_id: PORTAL_ID };
}

class AjaxStub extends Service {
  calls = [];
  response = {};
  error = null;

  async request(url) {
    this.calls.push(url);

    if (this.error) {
      throw this.error;
    }

    return this.response;
  }
}

const buildWidgetStub = () => {
  const calls = [];

  return {
    calls,
    widget: {
      load: () => calls.push('load'),
      open: () => calls.push('open'),
      remove: () => calls.push('remove'),
      openToKnowledgeBase: () => calls.push('openToKnowledgeBase'),
    },
    clear: (options) => calls.push(['clear', options]),
  };
};

module('Unit | Service | hubspot', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:browser/window', WindowStub);
    this.owner.register('service:configuration', ConfigurationStub);
    this.owner.register('service:ajax', AjaxStub);

    this.service = this.owner.lookup('service:hubspot');
    this.window = this.owner.lookup('service:browser/window');
    this.configuration = this.owner.lookup('service:configuration');
    this.ajax = this.owner.lookup('service:ajax');
  });

  test('it exists', function (assert) {
    assert.ok(this.service);
  });

  test('chat is enabled only when a portal id is configured', function (assert) {
    assert.true(this.service.chatEnabled);
    assert.strictEqual(this.service.portalId, PORTAL_ID);

    this.configuration.integrationData = { hubspot_portal_id: '' };

    assert.false(this.service.chatEnabled);
  });

  test('configureChat does nothing when chat is disabled', async function (assert) {
    this.configuration.integrationData = { hubspot_portal_id: '' };

    await this.service.configureChat();

    assert.strictEqual(this.ajax.calls.length, 0, 'no token is requested');
    assert.strictEqual(this.window.appended.length, 0, 'no script is added');
    assert.strictEqual(this.window.hsConversationsSettings, undefined);
  });

  test('configureChat identifies the visitor and adds the script', async function (assert) {
    this.ajax.response = { email: 'user@example.com', token: 'visitor-token' };

    await this.service.configureChat();

    assert.deepEqual(this.ajax.calls, [CHAT_TOKEN_ENDPOINT]);

    assert.deepEqual(this.window.hsConversationsSettings, {
      loadImmediately: false,
      identificationEmail: 'user@example.com',
      identificationToken: 'visitor-token',
    });

    assert.strictEqual(this.window.appended.length, 1);

    const [script] = this.window.appended;

    assert.strictEqual(script.id, 'hs-script-loader');
    assert.strictEqual(script.src, `https://js.hs-scripts.com/${PORTAL_ID}.js`);
    assert.true(script.async);
    assert.true(script.defer);
  });

  test('the widget is loaded once HubSpot reports it is ready', async function (assert) {
    this.ajax.response = { email: 'user@example.com', token: 'visitor-token' };

    await this.service.configureChat();

    const hubspot = buildWidgetStub();

    this.window.HubSpotConversations = hubspot;

    assert.strictEqual(this.window.hsConversationsOnReady.length, 1);

    this.window.hsConversationsOnReady[0]();

    assert.deepEqual(hubspot.calls, ['load']);
  });

  test('configureChat loads the chat unidentified when the backend returns no token', async function (assert) {
    // The backend answers 204 when HubSpot fails, which parses to {}
    this.ajax.response = {};

    await this.service.configureChat();

    assert.deepEqual(this.window.hsConversationsSettings, {
      loadImmediately: false,
    });

    assert.strictEqual(this.window.appended.length, 1, 'the chat still loads');
  });

  test('configureChat loads the chat unidentified when the request fails', async function (assert) {
    this.ajax.error = { status: 404 };

    await this.service.configureChat();

    assert.deepEqual(this.window.hsConversationsSettings, {
      loadImmediately: false,
    });

    assert.strictEqual(this.window.appended.length, 1, 'the chat still loads');
  });

  test('configureChat does not add the script twice and reloads the widget with the new identity', async function (assert) {
    this.ajax.response = { email: 'first@example.com', token: 'token-1' };

    await this.service.configureChat();

    const hubspot = buildWidgetStub();

    this.window.HubSpotConversations = hubspot;
    this.ajax.response = { email: 'second@example.com', token: 'token-2' };

    await this.service.configureChat();

    assert.strictEqual(this.window.appended.length, 1, 'script added once');
    assert.deepEqual(hubspot.calls, ['load']);

    assert.deepEqual(this.window.hsConversationsSettings, {
      loadImmediately: false,
      identificationEmail: 'second@example.com',
      identificationToken: 'token-2',
    });
  });

  test('openChat opens the widget when it is loaded', function (assert) {
    const hubspot = buildWidgetStub();

    this.window.HubSpotConversations = hubspot;

    assert.true(this.service.chatIsIntegrated);

    this.service.openChat();

    assert.deepEqual(hubspot.calls, ['open']);
  });

  test('openKnowledgeBase opens the Help tab when the widget offers it', function (assert) {
    const hubspot = buildWidgetStub();

    this.window.HubSpotConversations = hubspot;

    assert.true(this.service.openKnowledgeBase());
    assert.deepEqual(hubspot.calls, ['openToKnowledgeBase']);
  });

  test('openKnowledgeBase reports false before the widget is loaded', function (assert) {
    assert.false(this.service.openKnowledgeBase());
  });

  test('openKnowledgeBase reports false when the widget has no knowledge base', function (assert) {
    this.window.HubSpotConversations = {
      widget: { load: () => {}, open: () => {}, remove: () => {} },
      clear: () => {},
    };

    assert.false(this.service.openKnowledgeBase());
  });

  test('openChat does nothing before the widget is loaded', function (assert) {
    assert.false(this.service.chatIsIntegrated);

    this.service.openChat();

    assert.ok(true, 'no error is thrown');
  });

  test('clearChat clears the conversation then removes the widget', function (assert) {
    const hubspot = buildWidgetStub();

    this.window.HubSpotConversations = hubspot;

    this.service.clearChat();

    assert.deepEqual(hubspot.calls, [
      ['clear', { resetWidget: true }],
      'remove',
    ]);
  });

  test('clearChat does nothing when the widget was never loaded', function (assert) {
    this.service.clearChat();

    assert.ok(true, 'no error is thrown');
  });

  test('clearChat never throws, so logout is not blocked by the widget', function (assert) {
    this.window.HubSpotConversations = {
      widget: { remove: () => {} },
      clear: () => {
        throw new Error('HubSpot failed');
      },
    };

    this.service.clearChat();

    assert.ok(true, 'the error is swallowed');
  });
});
