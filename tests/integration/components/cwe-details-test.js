/* eslint-disable qunit/no-assert-equal */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | cwe-details', function (hooks) {
  setupRenderingTest(hooks);

  test('it should render CWE code and url', async function (assert) {
    this.set('cwe', {
      code: 'CWE-1',
      url: 'http://cwe/dummy/url',
    });

    await render(hbs`<CweDetails @cwe={{this.cwe}} />`);

    assert.dom(`[data-test-cwe-code]`).hasText(this.cwe.code);
    assert.dom(`[data-test-cwe-url]`).hasText(this.cwe.url);
  });

  test('it should hyperlink to url and open in new tab', async function (assert) {
    this.set('cwe', {
      code: 'CWE-1',
      url: 'http://cwe/dummy/url',
    });

    await render(hbs`<CweDetails @cwe={{this.cwe}} />`);

    const urlElem = this.element.querySelector('[data-test-cwe-url]');
    assert.equal(urlElem.getAttribute('href'), this.cwe.url);
    assert.equal(urlElem.getAttribute('target'), '_blank');
  });
});
