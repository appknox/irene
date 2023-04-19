import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-clipboard', function (hooks) {
  setupRenderingTest(hooks);

  test('test ak-clipboard copy (self) success', async function (assert) {
    assert.expect(2);

    this.setProperties({
      id: 'custom-id',
      onSuccess: (event) => {
        assert.strictEqual(event.text, 'copied text');
      },
    });

    await render(hbs`
        <AkClipboard @id={{this.id}} @onSuccess={{this.onSuccess}} as |cb|>
            <button data-test-copy-btn type="button" class="mt-2" data-clipboard-text="copied text" id={{cb.triggerId}}>
                Copy text
            </button>
        </AkClipboard>
    `);

    assert
      .dom(`#${this.id}`)
      .hasAttribute('data-clipboard-text', 'copied text');

    await click('[data-test-copy-btn]');
  });

  test('test ak-clipboard copy (target) success', async function (assert) {
    assert.expect(2);

    this.setProperties({
      onSuccess: (event) => {
        assert.strictEqual(event.text, 'copied text from input');
      },
    });

    await render(hbs`
        <input id="copy-input" type="text" value="copied text from input" />

        <AkClipboard @onSuccess={{this.onSuccess}} as |cb|>
            <button data-test-copy-btn type="button" class="mt-2" data-clipboard-target="#copy-input" id={{cb.triggerId}}>
                Copy text
            </button>
        </AkClipboard>
    `);

    assert
      .dom('[data-test-copy-btn]')
      .hasAttribute('data-clipboard-target', '#copy-input');

    await click('[data-test-copy-btn]');
  });
});
