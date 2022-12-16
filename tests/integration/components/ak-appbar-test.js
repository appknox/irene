import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-appbar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-appbar', async function (assert) {
    this.setProperties({
      title: 'Appbar title',
    });

    await render(hbs`
        <AkAppbar>
            <h5>{{this.title}}</h5>
        </AkAppbar>
    `);

    assert.dom('[data-test-ak-appbar]').exists().hasText(this.title);
  });

  test('it renders ak-appbar with gutter', async function (assert) {
    this.setProperties({
      title: 'Appbar title',
    });

    await render(hbs`
        <AkAppbar @gutter={{this.gutter}}>
            <h5>{{this.title}}</h5>
        </AkAppbar>
    `);

    assert
      .dom('[data-test-ak-appbar]')
      .exists()
      .hasText(this.title)
      .hasClass(/ak-appbar-gutter/);

    this.set('gutter', false);

    assert.dom('[data-test-ak-appbar]').doesNotHaveClass(/ak-appbar-gutter/);
  });

  test('it renders ak-appbar with elevation', async function (assert) {
    this.setProperties({
      title: 'Appbar title',
    });

    await render(hbs`
        <AkAppbar @elevation={{this.elevation}}>
            <h5>{{this.title}}</h5>
        </AkAppbar>
    `);

    assert
      .dom('[data-test-ak-appbar]')
      .exists()
      .hasText(this.title)
      .doesNotHaveClass(/ak-appbar-bottom-elevation/);

    this.set('elevation', true);

    assert.dom('[data-test-ak-appbar]').hasClass(/ak-appbar-bottom-elevation/);
  });

  test.each(
    'it renders ak-appbar with different colors',
    ['', 'light', 'default', 'dark', 'inherit'],
    async function (assert, color) {
      this.setProperties({
        title: 'Appbar title',
        color,
      });

      await render(hbs`
        <AkAppbar @color={{this.color}} @justfyContent="space-between" as |ab|>
            <h5>{{this.title}}</h5>
            <span data-test-icon-btn class={{ab.classes.defaultIconBtn}}></span>
        </AkAppbar>
    `);

      assert
        .dom('[data-test-ak-appbar]')
        .exists()
        .hasClass(RegExp(`ak-appbar-color-${color || 'inherit'}`))
        .hasText(this.title);

      assert
        .dom('[data-test-icon-btn]')
        .hasClass(/ak-appbar-default-icon-button/);
    }
  );

  test.each(
    'it renders ak-appbar with different position',
    ['', 'static', 'fixed', 'absolute', 'sticky', 'relative'],
    async function (assert, position) {
      this.setProperties({
        title: 'Appbar title',
        position,
      });

      await render(hbs`
        <AkAppbar @position={{this.position}}>
            <h5>{{this.title}}</h5>
        </AkAppbar>
    `);

      assert
        .dom('[data-test-ak-appbar]')
        .exists()
        .hasClass(RegExp(`ak-appbar-position-${position || 'static'}`))
        .hasText(this.title);
    }
  );

  test.each(
    'it renders ak-appbar with different placement',
    ['', 'top', 'bottom'],
    async function (assert, placement) {
      this.setProperties({
        title: 'Appbar title',
        placement,
      });

      await render(hbs`
        <AkAppbar @placement={{this.placement}}>
            <h5>{{this.title}}</h5>
        </AkAppbar>
    `);

      assert
        .dom('[data-test-ak-appbar]')
        .exists()
        .hasClass(RegExp(`ak-appbar-placement-${placement || 'top'}`))
        .hasText(this.title);
    }
  );
});
