import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | body-class', function (hooks) {
  setupRenderingTest(hooks);

  test('it should add class via var', async function (assert) {
    this.set('inputValue', 'test-body-class');
    await render(hbs`{{body-class inputValue}}`);
    assert.dom(this.element.ownerDocument.body).hasClass('test-body-class');
  });

  test('it should add class directly', async function (assert) {
    await render(hbs`{{body-class "direct-body-class"}}`);
    assert.dom(this.element.ownerDocument.body).hasClass('direct-body-class');
  });

  test('it should be able to handle empty var', async function (assert) {
    this.set('inputValue', 'test-body-class');
    await render(hbs`{{body-class inputValue}}`);
    assert.dom(this.element.ownerDocument.body).hasClass('test-body-class');

    this.set('inputValue', '');
    await render(hbs`{{body-class inputValue}}`);
    assert
      .dom(this.element.ownerDocument.body)
      .doesNotHaveClass('test-body-class');
  });

  test('it should be able to handle direct empty value', async function (assert) {
    this.set('inputValue', 'test-body-class');
    await render(hbs`{{body-class inputValue}}`);
    assert.dom(this.element.ownerDocument.body).hasClass('test-body-class');

    await render(hbs`{{body-class ""}}`);
    assert
      .dom(this.element.ownerDocument.body)
      .doesNotHaveClass('test-body-class');
  });
});
