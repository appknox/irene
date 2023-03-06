import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-typography', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-typography', async function (assert) {
    this.setProperties({
      content: 'hello world',
    });

    await render(hbs`<AkTypography>{{this.content}}</AkTypography>`);

    assert.dom('[data-test-ak-typography]').exists().hasText(this.content);
  });

  test.each(
    'it renders ak-typography with different variants',
    [
      { variant: 'h1', tagName: 'h1', className: /ak-typography-h1/i },
      { variant: 'h2', tagName: 'h2', className: /ak-typography-h2/i },
      { variant: 'h3', tagName: 'h3', className: /ak-typography-h3/i },
      { variant: 'h4', tagName: 'h4', className: /ak-typography-h4/i },
      { variant: 'h5', tagName: 'h5', className: /ak-typography-h5/i },
      { variant: 'h6', tagName: 'h6', className: /ak-typography-h6/i },
      {
        variant: 'subtitle1',
        tagName: 'h6',
        className: /ak-typography-subtitle1/i,
      },
      {
        variant: 'subtitle2',
        tagName: 'h6',
        className: /ak-typography-subtitle2/i,
      },
      {
        variant: 'body1',
        tagName: 'p',
        className: /ak-typography-body1/i,
      },
      {
        variant: 'body2',
        tagName: 'p',
        className: /ak-typography-body2/i,
      },
      {
        variant: 'non-existent-variant',
        tagName: 'span',
        className: /ak-typography-body1/i,
      },
    ],
    async function (assert, data) {
      this.setProperties({
        content: 'hello world',
        variant: data.variant,
      });

      await render(
        hbs`<AkTypography @variant={{this.variant}}>{{this.content}}</AkTypography>`
      );

      assert
        .dom('[data-test-ak-typography]')
        .exists()
        .hasText(this.content)
        .hasTagName(data.tagName)
        .hasClass(data.className);
    }
  );

  test.each(
    'it renders ak-typography with different colors',
    [
      ['', /ak-typography-color-textPrimary/i],
      ['textPrimary', /ak-typography-color-textPrimary/i],
      ['textSecondary', /ak-typography-color-textSecondary/i],
      ['primary', /ak-typography-color-primary/i],
      ['secondary', /ak-typography-color-secondary/i],
      ['success', /ak-typography-color-success/i],
      ['error', /ak-typography-color-error/i],
      ['warn', /ak-typography-color-warn/i],
      ['info', /ak-typography-color-info/i],
      ['inherit', /ak-typography-color-inherit/i],
    ],
    async function (assert, [color, expectedClassName]) {
      this.setProperties({
        content: 'hello world',
        color,
      });

      await render(
        hbs`<AkTypography @color={{this.color}}>{{this.content}}</AkTypography>`
      );

      assert
        .dom('[data-test-ak-typography]')
        .exists()
        .hasText(this.content)
        .hasClass(expectedClassName);
    }
  );

  test.each(
    'it renders ak-typography with different font-weight',
    ['medium', 'regular', 'bold', 'light'],
    async function (assert, fontWeight) {
      this.setProperties({
        content: 'hello world',
        fontWeight,
      });

      await render(
        hbs`<AkTypography @fontWeight={{this.fontWeight}}>{{this.content}}</AkTypography>`
      );

      assert
        .dom('[data-test-ak-typography]')
        .exists()
        .hasText(this.content)
        .hasClass(
          new RegExp(`ak-typography-font-weight-${this.fontWeight}`, 'i')
        );
    }
  );

  test.each(
    'it renders ak-typography with different alignments',
    [
      ['', /ak-typography-align-inherit/i],
      ['left', /ak-typography-align-left/i],
      ['right', /ak-typography-align-right/i],
      ['center', /ak-typography-align-center/i],
      ['justify', /ak-typography-align-justify/i],
      ['inherit', /ak-typography-align-inherit/i],
    ],
    async function (assert, [align, expectedClassName]) {
      this.setProperties({
        content: 'hello world',
        align,
      });

      await render(
        hbs`<AkTypography @align={{this.align}}>{{this.content}}</AkTypography>`
      );

      assert
        .dom('[data-test-ak-typography]')
        .exists()
        .hasText(this.content)
        .hasClass(expectedClassName);
    }
  );

  test.each(
    'it renders ak-typography with different underline states',
    [
      ['', /ak-typography-underline-none/i],
      ['none', /ak-typography-underline-none/i],
      ['always', /ak-typography-underline-always/i],
      ['hover', /ak-typography-underline-hover/i],
    ],
    async function (assert, [underline, expectedClassName]) {
      this.setProperties({
        content: 'hello world',
        underline,
      });

      await render(
        hbs`<AkTypography @underline={{this.underline}}>{{this.content}}</AkTypography>`
      );

      assert
        .dom('[data-test-ak-typography]')
        .exists()
        .hasText(this.content)
        .hasClass(expectedClassName);
    }
  );

  test.each(
    'it renders ak-typography with and without gutterBottom',
    [
      [false, /ak-typography-no-gutter-bottom/i],
      [true, /ak-typography-gutter-bottom/i],
      [undefined, /ak-typography-no-gutter-bottom/i],
    ],
    async function (assert, [gutterBottom, expectedClassName]) {
      this.setProperties({
        content: 'hello world',
        gutterBottom,
      });

      await render(
        hbs`<AkTypography @gutterBottom={{this.gutterBottom}}>{{this.content}}</AkTypography>`
      );

      assert
        .dom('[data-test-ak-typography]')
        .exists()
        .hasText(this.content)
        .hasClass(expectedClassName);
    }
  );

  test('it renders ak-typography with no wrap', async function (assert) {
    this.setProperties({
      content: 'hello world',
      noWrap: false,
    });

    await render(
      hbs`<AkTypography @noWrap={{this.noWrap}}>{{this.content}}</AkTypography>`
    );

    assert
      .dom('[data-test-ak-typography]')
      .exists()
      .hasText(this.content)
      .doesNotHaveClass(/no-wrap/i);

    this.set('noWrap', true);

    assert.dom('[data-test-ak-typography]').hasClass(/no-wrap/i);
  });
});
