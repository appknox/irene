import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

const KB_URL = 'https://help.appknox.com/en/knowledge';

class WindowStub extends Service {
  opened = [];

  open(...args) {
    this.opened.push(args);
  }
}

class ConfigurationStub extends Service {
  integrationData = { knowledge_base_url: '', knowledge_base_mode: '' };
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

module('Unit | Service | knowledge-base', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:browser/window', WindowStub);
    this.owner.register('service:configuration', ConfigurationStub);
    this.owner.register('service:hubspot', HubspotStub);

    this.service = this.owner.lookup('service:knowledge-base');
    this.window = this.owner.lookup('service:browser/window');
    this.configuration = this.owner.lookup('service:configuration');
    this.hubspot = this.owner.lookup('service:hubspot');

    this.configure = (data) => {
      this.configuration.integrationData = {
        knowledge_base_url: '',
        knowledge_base_mode: '',
        ...data,
      };
    };
  });

  test('it exists', function (assert) {
    assert.ok(this.service);
  });

  test('it has no url when none is configured', function (assert) {
    assert.strictEqual(this.service.url, '');
    assert.false(this.service.hasUrl);
    assert.false(this.service.isAvailable);
  });

  test('it reads the url from the runtime config', function (assert) {
    this.configure({ knowledge_base_url: KB_URL });

    assert.strictEqual(this.service.url, KB_URL);
    assert.true(this.service.hasUrl);
    assert.true(this.service.isAvailable);
  });

  test('switching hosts is only a config change', function (assert) {
    this.configure({ knowledge_base_url: KB_URL });

    assert.strictEqual(this.service.url, KB_URL);

    this.configure({
      knowledge_base_url: 'https://support.appknox.com/en/knowledge',
    });

    assert.strictEqual(
      this.service.url,
      'https://support.appknox.com/en/knowledge'
    );
  });

  test('it ignores a configured value that is not an http(s) url', function (assert) {
    assert.expect(10);

    for (const value of [
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'ftp://help.appknox.com',
      'help.appknox.com/en/knowledge',
      'not a url',
    ]) {
      this.configure({ knowledge_base_url: value });

      assert.strictEqual(this.service.url, '', `ignores ${value}`);
      assert.false(this.service.hasUrl, `no url for ${value}`);
    }
  });

  test('it tolerates a missing integration config', function (assert) {
    this.configuration.integrationData = undefined;

    assert.strictEqual(this.service.url, '');
    assert.false(this.service.usesHubspotWidget);
  });

  test('open opens the url in a new tab without access to this one', function (assert) {
    this.configure({ knowledge_base_url: KB_URL });

    this.service.open();

    assert.deepEqual(this.window.opened, [
      [KB_URL, '_blank', 'noopener,noreferrer'],
    ]);
    assert.strictEqual(this.hubspot.helpTabOpened, 0);
  });

  test('open does nothing when nothing is configured', function (assert) {
    this.service.open();

    assert.strictEqual(this.window.opened.length, 0);
    assert.strictEqual(this.hubspot.helpTabOpened, 0);
  });

  test('widget mode uses the HubSpot Help tab when chat is enabled', function (assert) {
    this.configure({ knowledge_base_mode: 'widget' });

    assert.true(this.service.usesHubspotWidget);
    assert.true(this.service.isAvailable);

    this.service.open();

    assert.strictEqual(this.hubspot.helpTabOpened, 1);
    assert.strictEqual(this.window.opened.length, 0, 'no new tab');
  });

  test('widget mode does nothing unless HubSpot chat is enabled', function (assert) {
    this.hubspot.chatEnabled = false;
    this.configure({ knowledge_base_mode: 'widget' });

    assert.false(this.service.usesHubspotWidget);
    assert.false(this.service.isAvailable);
  });

  test('the Help tab is not used when the mode is not set', function (assert) {
    this.configure({ knowledge_base_mode: '' });

    assert.false(this.service.usesHubspotWidget);
    assert.false(this.service.isAvailable);
  });

  test('widget mode falls back to the new tab when the widget is not ready', function (assert) {
    this.hubspot.widgetReady = false;
    this.configure({
      knowledge_base_mode: 'widget',
      knowledge_base_url: KB_URL,
    });

    this.service.open();

    assert.strictEqual(this.hubspot.helpTabOpened, 0);
    assert.deepEqual(this.window.opened, [
      [KB_URL, '_blank', 'noopener,noreferrer'],
    ]);
  });

  test('widget mode opens nothing when the widget is not ready and there is no url', function (assert) {
    this.hubspot.widgetReady = false;
    this.configure({ knowledge_base_mode: 'widget' });

    this.service.open();

    assert.strictEqual(this.hubspot.helpTabOpened, 0);
    assert.strictEqual(this.window.opened.length, 0);
  });
});
