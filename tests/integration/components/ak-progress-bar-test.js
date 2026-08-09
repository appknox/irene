import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import styles from 'irene/components/ak-progress-bar/index.scss';

const STRIPED_CLASS = styles['segment--striped'];

module('Integration | Component | ak-progress-bar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the root container', async function (assert) {
    this.set('segments', [{ key: 'a', count: 1 }]);

    await render(hbs`<AkProgressBar @segments={{this.segments}} />`);

    assert.dom('[data-test-ak-progress-bar]').exists();
  });

  test('it renders one segment per positive entry with the matching key', async function (assert) {
    this.set('segments', [
      { key: 'failed', count: 2 },
      { key: 'passed', count: 3 },
    ]);

    await render(hbs`<AkProgressBar @segments={{this.segments}} />`);

    assert.dom('[data-test-ak-progress-bar-segment="failed"]').exists();
    assert.dom('[data-test-ak-progress-bar-segment="passed"]').exists();

    assert.strictEqual(
      findAll('[data-test-ak-progress-bar-segment]').length,
      2,
      'renders exactly two segments'
    );
  });

  test('it distributes raw counts proportionally across the full bar', async function (assert) {
    this.set('segments', [
      { key: 'a', count: 1 },
      { key: 'b', count: 3 },
    ]);

    await render(hbs`<AkProgressBar @segments={{this.segments}} />`);

    const a = find('[data-test-ak-progress-bar-segment="a"]');
    const b = find('[data-test-ak-progress-bar-segment="b"]');

    assert.ok(
      a.getAttribute('style')?.includes('width: 25%'),
      `"a" occupies 25% of the bar (1 of 4), got: ${a.getAttribute('style')}`
    );

    assert.ok(
      b.getAttribute('style')?.includes('width: 75%'),
      `"b" occupies 75% of the bar (3 of 4), got: ${b.getAttribute('style')}`
    );
  });

  test('it treats `share` as a fixed percentage regardless of counts', async function (assert) {
    this.set('segments', [
      { key: 'fixed', share: 30 },
      { key: 'rest', count: 1 },
    ]);

    await render(hbs`<AkProgressBar @segments={{this.segments}} />`);

    const fixed = find('[data-test-ak-progress-bar-segment="fixed"]');
    const rest = find('[data-test-ak-progress-bar-segment="rest"]');

    assert.ok(
      fixed.getAttribute('style')?.includes('width: 30%'),
      '`share` is rendered as a fixed 30% width'
    );

    assert.ok(
      rest.getAttribute('style')?.includes('width: 70%'),
      'remaining count-driven segment fills the 70% remainder'
    );
  });

  test('it reserves `share` first and splits the remainder across counts proportionally', async function (assert) {
    this.set('segments', [
      { key: 'a', count: 1 },
      { key: 'b', count: 3 },
      { key: 'loading', share: 50, striped: true },
    ]);

    await render(hbs`<AkProgressBar @segments={{this.segments}} />`);

    const a = find('[data-test-ak-progress-bar-segment="a"]');
    const b = find('[data-test-ak-progress-bar-segment="b"]');
    const loading = find('[data-test-ak-progress-bar-segment="loading"]');

    assert.ok(
      loading.getAttribute('style')?.includes('width: 50%'),
      'loading slice keeps its reserved 50%'
    );

    assert.ok(
      a.getAttribute('style')?.includes('width: 12.5%'),
      '"a" gets 1/4 of the 50% remainder = 12.5%'
    );

    assert.ok(
      b.getAttribute('style')?.includes('width: 37.5%'),
      '"b" gets 3/4 of the 50% remainder = 37.5%'
    );
  });

  test('it clamps total reserved share at 100% and drops count-driven segments when fully reserved', async function (assert) {
    this.set('segments', [
      { key: 'left', share: 60 },
      { key: 'right', share: 60 },
      { key: 'starved', count: 5 },
    ]);

    await render(hbs`<AkProgressBar @segments={{this.segments}} />`);

    assert.dom('[data-test-ak-progress-bar-segment="left"]').exists();
    assert.dom('[data-test-ak-progress-bar-segment="right"]').exists();

    assert
      .dom('[data-test-ak-progress-bar-segment="starved"]')
      .doesNotExist(
        'count-driven segment is dropped because there is no remainder left'
      );
  });

  test('it filters out zero-count and zero-share entries', async function (assert) {
    this.set('segments', [
      { key: 'visible', count: 1 },
      { key: 'zero-count', count: 0 },
      { key: 'zero-share', share: 0 },
    ]);

    await render(hbs`<AkProgressBar @segments={{this.segments}} />`);

    assert.dom('[data-test-ak-progress-bar-segment="visible"]').exists();

    assert
      .dom('[data-test-ak-progress-bar-segment="zero-count"]')
      .doesNotExist();

    assert
      .dom('[data-test-ak-progress-bar-segment="zero-share"]')
      .doesNotExist();
  });

  test('it renders no segments when nothing is positive', async function (assert) {
    this.set('segments', [
      { key: 'a', count: 0 },
      { key: 'b', count: 0 },
    ]);

    await render(hbs`<AkProgressBar @segments={{this.segments}} />`);

    assert.dom('[data-test-ak-progress-bar]').exists();

    assert.strictEqual(
      findAll('[data-test-ak-progress-bar-segment]').length,
      0,
      'no segments rendered when all inputs are zero'
    );
  });

  test('it adds the striped class only to segments with `striped: true`', async function (assert) {
    this.set('segments', [
      { key: 'plain', count: 1 },
      { key: 'stripe', share: 50, striped: true },
    ]);

    await render(hbs`<AkProgressBar @segments={{this.segments}} />`);

    assert
      .dom('[data-test-ak-progress-bar-segment="stripe"]')
      .hasClass(STRIPED_CLASS);

    assert
      .dom('[data-test-ak-progress-bar-segment="plain"]')
      .doesNotHaveClass(STRIPED_CLASS);
  });

  test('it applies the `background` value inline on each segment', async function (assert) {
    this.set('segments', [
      { key: 'red', count: 1, background: 'rgb(255, 0, 0)' },
      { key: 'blue', count: 1, background: 'rgb(0, 0, 255)' },
    ]);

    await render(hbs`<AkProgressBar @segments={{this.segments}} />`);

    const red = find('[data-test-ak-progress-bar-segment="red"]');
    const blue = find('[data-test-ak-progress-bar-segment="blue"]');

    assert.ok(
      red.getAttribute('style')?.includes('rgb(255, 0, 0)'),
      'red segment has the supplied background colour'
    );

    assert.ok(
      blue.getAttribute('style')?.includes('rgb(0, 0, 255)'),
      'blue segment has the supplied background colour'
    );
  });

  test('it tolerates an empty segments array', async function (assert) {
    this.set('segments', []);

    await render(hbs`<AkProgressBar @segments={{this.segments}} />`);

    assert.dom('[data-test-ak-progress-bar]').exists();

    assert.strictEqual(
      findAll('[data-test-ak-progress-bar-segment]').length,
      0,
      'renders the root with no segments'
    );
  });
});
