import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

class ConfigurationStub extends Service {
  integrationData = { freshdesk_configuration: { widget_id: '' } };
}

class KnowledgeBaseStub extends Service {
  isAvailable = false;
}

module('Unit | Service | freshdesk', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:configuration', ConfigurationStub);
    this.owner.register('service:knowledge-base', KnowledgeBaseStub);

    this.service = this.owner.lookup('service:freshdesk');
    this.configuration = this.owner.lookup('service:configuration');
    this.knowledgeBase = this.owner.lookup('service:knowledge-base');
  });

  test('the widget is enabled when a widget id is configured', function (assert) {
    this.configuration.integrationData = {
      freshdesk_configuration: { widget_id: '88000000574' },
    };

    assert.strictEqual(this.service.supportWidgetKey, '88000000574');
    assert.true(this.service.supportWidgetIsEnabled);
  });

  test('the widget is disabled without a widget id', function (assert) {
    assert.strictEqual(this.service.supportWidgetKey, '');
    assert.false(this.service.supportWidgetIsEnabled);
  });

  test('the HubSpot knowledge base replaces the widget', function (assert) {
    this.configuration.integrationData = {
      freshdesk_configuration: { widget_id: '88000000574' },
    };
    this.knowledgeBase.isAvailable = true;

    assert.false(this.service.supportWidgetIsEnabled);
  });
});
