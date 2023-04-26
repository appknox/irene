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
    const circle = svg.querySelector('[data-test-ak-loader-circle-indicator]');

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

  test('test determinate ak-loader svg attributes', async function (assert) {
    const VIEW_PORT_SIZE = 44;
    const THICKNESS = 4;

    this.set('progress', 30);

    await render(
      hbs`<AkLoader @variant="determinate" @size={{this.size}} @thickness={{this.thickness}} @progress={{this.progress}} />`
    );

    const svg = find('[data-test-ak-loader-svg]');
    const circle = svg.querySelector('[data-test-ak-loader-circle-indicator]');

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

    const radius = (VIEW_PORT_SIZE - this.thickness) / 2;
    const strokeDashArray = 2 * Math.PI * radius;
    const strokeDashOffset = strokeDashArray * ((100 - this.progress) / 100);

    assert.strictEqual(circle.attributes.r.value, `${radius}`);
    assert.strictEqual(
      circle.attributes['stroke-dasharray'].value,
      `${strokeDashArray}`
    );
    assert.strictEqual(
      circle.attributes['stroke-dashoffset'].value,
      `${strokeDashOffset}`
    );
  });

  test('test ak-loader label', async function (assert) {
    this.set('progress', 30);
    this.set('size', 100);
    this.set('thickness', 4);
    this.set('label', 'This is the loading text');

    await render(
      hbs`
      <AkLoader 
        @size={{this.size}} 
        @thickness={{this.thickness}} 
        @progress={{this.progress}}
      >
        <:label>
          <AkTypography @variant="h6" data-test-ak-loader-label>
            {{this.label}}
          </AkTypography>
        </:label>
      </AkLoader>
      `
    );

    assert.dom('[data-test-ak-loader-label]').exists().hasText(this.label);
  });

  test('determinate ak-loader progress defaults to lower (0) and upper (100) limits if out of range', async function (assert) {
    // Progress is lesser than 0
    this.set('progress', -30);
    this.set('size', 100);
    this.set('thickness', 4);

    await render(
      hbs`
      <AkLoader 
        @size={{this.size}} 
        @thickness={{this.thickness}} 
        @progress={{this.progress}}
      >
        <:label>
          <AkTypography @variant="h6" data-test-ak-loader-label>
            {{this.label}}
          </AkTypography>
        </:label>
      </AkLoader>
      `
    );

    assert.dom(`[data-test-ak-loader-progress='0']`).exists();

    // Progress is greater than 100
    this.set('progress', 3000);

    assert.dom(`[data-test-ak-loader-progress='100']`).exists();
  });
});
