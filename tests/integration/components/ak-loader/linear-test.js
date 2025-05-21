import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-loader/linear', function (hooks) {
  setupRenderingTest(hooks);

  test('test indeterminate linear loader', async function (assert) {
    this.set('height', 10);

    await render(hbs`<AkLoader::Linear @height={{this.height}} />`);

    assert
      .dom('[data-test-ak-loader-linear]')
      .exists()
      .hasStyle({ height: `${this.height}px` });
  });

  test('test determinate ak-loader-linear progress', async function (assert) {
    this.setProperties({
      progress: 30,
      // Divides the loader to 100 equal units for test purposes
      width: 100,
    });

    await render(
      hbs`
      <AkLoader::Linear 
        @variant="determinate"  
        @progress={{this.progress}} 
        {{style width=(concat this.width "px")}} 
      />`
    );

    assert
      .dom(`[data-test-ak-loader-linear-progress='${this.progress}']`)
      .exists();

    // The progress indicator is positioned absolutely
    const linearProgressIndicator = find(
      '[data-test-ak-loader-linear-indicator]'
    );

    assert.dom(linearProgressIndicator).exists();

    assert.strictEqual(
      linearProgressIndicator.style.transform,
      `translateX(${this.progress}%)`
    );

    this.set('progress', 45.5);

    assert.strictEqual(
      linearProgressIndicator.style.transform,
      `translateX(${this.progress}%)`
    );
  });

  test('test ak-loader linear label', async function (assert) {
    this.setProperties({
      progress: 30,
      label: 'Label',
    });

    await render(
      hbs`
      <AkLoader::Linear
        @variant='determinate'
        @height={{this.height}}
        @progress={{this.progress}}
      >
        <:label>
          <AkTypography @variant="h6" data-test-ak-loader-linear-label>
            {{this.progress}}%
          </AkTypography>
        </:label>
      </AkLoader::Linear>
      `
    );

    assert
      .dom(`[data-test-ak-loader-linear-progress="${this.progress}"]`)
      .exists();

    assert
      .dom('[data-test-ak-loader-linear-label]')
      .exists()
      .containsText(this.progress);
  });

  test('determinate ak-loader progress defaults to lower (0) and upper (100) limits if out of range', async function (assert) {
    // Progress is lesser than 0
    this.setProperties({
      progress: -30,
    });

    await render(
      hbs`
        <AkLoader::Linear 
          @variant="determinate"  
          @progress={{this.progress}} 
        />
      `
    );

    assert.dom("[data-test-ak-loader-linear-progress='0']").exists();

    // Progress is greater than 100
    this.set('progress', 1000);

    assert.dom("[data-test-ak-loader-linear-progress='100']").exists();
  });

  test.each(
    'it renders ak-loader linear in different colors',
    [
      '',
      'primary',
      'secondary',
      'success',
      'error',
      'warn',
      'warn-dark',
      'info',
      'info-dark',
    ],
    async function (assert, color) {
      this.setProperties({
        color,
      });

      this.set('height', 10);

      await render(
        hbs`<AkLoader::Linear @color={{this.color}} @height={{this.height}} />`
      );

      assert
        .dom('[data-test-ak-loader-linear-indicator]')
        .exists()
        .hasClass(RegExp(`ak-loader-linear-color-${color || 'primary'}`));
    }
  );
});
