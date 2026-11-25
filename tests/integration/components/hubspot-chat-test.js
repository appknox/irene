import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const selectors = {
  panel: '[data-test-hubspotChat-panel]',
  closeBtn: '[data-test-hubspotChat-closeBtn]',
  embed: '[data-test-hubspotChat-embed]',
};

class HubspotStub extends Service {
  EMBED_ID = 'hubspot-chat-embed';
  @tracked isOpen = false;
  embedInserted = 0;

  handleEmbedInserted = () => {
    this.embedInserted += 1;
  };

  closeChat() {
    this.isOpen = false;
  }
}

module('Integration | Component | hubspot-chat', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.owner.register('service:hubspot', HubspotStub);
    this.hubspot = this.owner.lookup('service:hubspot');
  });

  test('it renders the embed target and reports it is in the page', async function (assert) {
    await render(hbs`<HubspotChat />`);

    assert.dom(selectors.embed).hasAttribute('id', 'hubspot-chat-embed');
    assert.strictEqual(this.hubspot.embedInserted, 1);

    assert
      .dom(selectors.panel)
      .hasAttribute('aria-label', t('chatSupport'))
      .hasAttribute('aria-hidden', 'true');
  });

  test('it shows the panel while the chat is open and closes it', async function (assert) {
    await render(hbs`<HubspotChat />`);

    this.hubspot.isOpen = true;
    await settled();

    assert.dom(selectors.panel).hasAttribute('aria-hidden', 'false');
    assert.dom(selectors.closeBtn).hasAttribute('aria-label', t('close'));

    await click(selectors.closeBtn);

    assert.false(this.hubspot.isOpen);
    assert.dom(selectors.panel).hasAttribute('aria-hidden', 'true');
  });
});
