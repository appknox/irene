/* eslint-disable qunit/no-assert-equal */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | mstg-details', function (hooks) {
  setupRenderingTest(hooks);

  test('it should render MSTG code and title', async function (assert) {
    this.set('mstgData', {
      code: 'MSTG-1',
      title: 'Test MSTG title',
    });

    await render(hbs`<MstgDetails @mstg={{this.mstgData}} />`);

    assert.dom(`[data-test-mstg-code]`).hasText(this.mstgData.code);
    assert.dom(`[data-test-mstg-title]`).hasText(this.mstgData.title);
  });

  test('it renders equal height columns for code & title', async function (assert) {
    this.set('mstgData', {
      code: 'MSTG-1',
      title: 'MSTG'.repeat(500),
    });

    await render(hbs`<MstgDetails @mstg={{this.mstgData}} />`);

    const codeElem = this.element.querySelector('[data-test-mstg-code]');
    const titleElem = this.element.querySelector('[data-test-mstg-title]');
    assert.equal(codeElem.offsetHeight, titleElem.offsetHeight);
  });
});
