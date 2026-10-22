import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  root: '[data-test-akRichTextContent]',
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<AkRichTextContent @value={{this.value}} />`;

module('Integration | Component | ak-rich-text-content', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.renderValue = async (value) => {
      this.set('value', value);

      await render(TEMPLATE);

      // Glimmer leaves a marker comment where empty content would be.
      return find(selectors.root).innerHTML.replaceAll('<!---->', '').trim();
    };
  });

  // ─── Empty input ───────────────────────────────────────────────────────────

  test.each(
    'it renders nothing for an absent value',
    [[undefined], [null], ['']],
    async function (assert, [value]) {
      assert.strictEqual(await this.renderValue(value), '');
    }
  );

  // ─── Plain text ────────────────────────────────────────────────────────────

  test('it renders plain text unchanged', async function (assert) {
    assert.strictEqual(
      await this.renderValue('A finding with no markup'),
      'A finding with no markup'
    );
  });

  test('it escapes characters that are not markup', async function (assert) {
    assert.strictEqual(
      await this.renderValue('5 > 3 && 2 < 4'),
      '5 &gt; 3 &amp;&amp; 2 &lt; 4'
    );
  });

  // ─── Allowed marks ─────────────────────────────────────────────────────────

  test.each(
    'it keeps every mark the editor can produce',
    [
      ['<p>Paragraph</p>'],
      ['<strong>Bold</strong>'],
      ['<em>Italic</em>'],
      ['<u>Underline</u>'],
      ['<s>Strike</s>'],
      ['<code>inline()</code>'],
      ['<pre><code>block()</code></pre>'],
      ['<ul><li><p>Item</p></li></ul>'],
      ['<ol><li><p>Item</p></li></ol>'],
      ['Line<br>Break'],
    ],
    async function (assert, [html]) {
      assert.strictEqual(await this.renderValue(html), html);
    }
  );

  test('it keeps nested marks', async function (assert) {
    const html = '<p>A <strong>bold <em>and italic</em></strong> claim</p>';

    assert.strictEqual(await this.renderValue(html), html);
  });

  // ─── Disallowed markup ─────────────────────────────────────────────────────

  test('it drops a script tag and its content', async function (assert) {
    assert.strictEqual(
      await this.renderValue(
        '<p>Before</p><script>alert(1)</script><p>After</p>'
      ),
      '<p>Before</p><p>After</p>'
    );
  });

  test('it unwraps an unknown tag, keeping its text', async function (assert) {
    assert.strictEqual(
      await this.renderValue('<p>A <span class="x">kept</span> word</p>'),
      '<p>A kept word</p>'
    );
  });

  test('it unwraps an iframe rather than embedding it', async function (assert) {
    assert.strictEqual(
      await this.renderValue('<iframe src="https://evil.test"></iframe>'),
      ''
    );
  });

  test.each(
    'it strips a dangerous attribute',
    [
      ['<p onclick="alert(1)">Click</p>', '<p>Click</p>'],
      ['<strong style="position:fixed">Bold</strong>', '<strong>Bold</strong>'],
      [
        '<ul><li onmouseover="alert(1)"><p>Item</p></li></ul>',
        '<ul><li><p>Item</p></li></ul>',
      ],
    ],
    async function (assert, [html, expected]) {
      assert.strictEqual(await this.renderValue(html), expected);
    }
  );

  // ─── Links ─────────────────────────────────────────────────────────────────

  test.each(
    'it rebuilds a link with a safe scheme',
    [
      ['https://www.example.com'],
      ['http://www.example.com'],
      ['mailto:team@example.com'],
    ],
    async function (assert, [href]) {
      assert.strictEqual(
        await this.renderValue(`<a href="${href}">Link</a>`),
        `<a href="${href}" target="_blank" rel="noopener noreferrer nofollow">Link</a>`
      );
    }
  );

  test('it replaces a rel the markup tried to weaken', async function (assert) {
    assert.strictEqual(
      await this.renderValue(
        '<a href="https://example.com" target="_blank" rel="">Link</a>'
      ),
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer nofollow">Link</a>'
    );
  });

  test.each(
    'it leaves an unsafe scheme unlinked, keeping the text',
    [
      ['javascript:alert(1)'],
      ['data:text/html;base64,PHNjcmlwdD4='],
      ['vbscript:msgbox(1)'],
    ],
    async function (assert, [href]) {
      assert.strictEqual(
        await this.renderValue(`<a href="${href}">Click</a>`),
        '<a>Click</a>'
      );
    }
  );

  test('it drops every other attribute from a link', async function (assert) {
    assert.strictEqual(
      await this.renderValue(
        '<a href="https://example.com" onclick="alert(1)" download>Link</a>'
      ),
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer nofollow">Link</a>'
    );
  });
});
