import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-loader', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-loader', async function (assert) {
    await render(hbs`<AkLoader />`);

    assert
      .dom('[data-test-ak-loader]')
      .exists()
      .hasStyle({ width: '40px', height: '40px' });
  });

  test('test ak-loader svg attributes', async function (assert) {
    const VIEW_PORT_SIZE = 44;
    const THICKNESS = 4;

    await render(
      hbs`<AkLoader @size={{this.size}} @thickness={{this.thickness}} />`
    );

    const svg = find('[data-test-ak-loader-svg]');
    const circle = svg.querySelector('[data-test-ak-loader-circle-foreground]');

    assert.dom(circle).exists();

    assert.strictEqual(circle.attributes.cx.value, `${VIEW_PORT_SIZE}`);
    assert.strictEqual(circle.attributes.cy.value, `${VIEW_PORT_SIZE}`);

    assert.strictEqual(circle.attributes['stroke-width'].value, `${THICKNESS}`);

    assert.strictEqual(
      circle.attributes.r.value,
      `${(VIEW_PORT_SIZE - THICKNESS) / 2}`
    );

    this.set('size', 20);
    this.set('thickness', 5);

    assert
      .dom('[data-test-ak-loader]')
      .exists()
      .hasStyle({ width: `${this.size}px`, height: `${this.size}px` });

    assert.strictEqual(circle.attributes.cx.value, `${VIEW_PORT_SIZE}`);
    assert.strictEqual(circle.attributes.cy.value, `${VIEW_PORT_SIZE}`);

    assert.strictEqual(
      circle.attributes['stroke-width'].value,
      `${this.thickness}`
    );

    assert.strictEqual(
      circle.attributes.r.value,
      `${(VIEW_PORT_SIZE - this.thickness) / 2}`
    );
  });
});
