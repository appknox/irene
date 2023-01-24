import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-tooltip', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-tooltip', async function (assert) {
    await render(hbs`
        <AkTooltip @title="ak-tooltip">
            <button data-test-button type="button">Show tooltip</button>
        </AkTooltip>
    `);

    const tooltipRoot = find('[data-test-ak-tooltip-root]');

    assert.dom(tooltipRoot).exists();

    await triggerEvent(tooltipRoot, 'mouseenter');

    assert.dom('[data-test-ak-tooltip-content]').exists().hasText('ak-tooltip');

    await triggerEvent(tooltipRoot, 'mouseleave');

    assert.dom('[data-test-ak-tooltip-content]').doesNotExist();
  });

  test('it renders ak-tooltip with enterDelay & leaveDelay', async function (assert) {
    await render(hbs`
        <AkTooltip @title="ak-tooltip" @enterDelay={{500}} @leaveDelay={{200}}>
            <button data-test-button type="button">Show tooltip</button>
        </AkTooltip>
    `);

    const tooltipRoot = find('[data-test-ak-tooltip-root]');

    assert.dom(tooltipRoot).exists();

    await triggerEvent(tooltipRoot, 'mouseenter');

    assert.dom('[data-test-ak-tooltip-content]').exists().hasText('ak-tooltip');

    await triggerEvent(tooltipRoot, 'mouseleave');

    assert.dom('[data-test-ak-tooltip-content]').doesNotExist();
  });

  test('it renders ak-tooltip with tootip content block', async function (assert) {
    await render(hbs`
        <AkTooltip>
            <:tooltipContent>
                <span data-test-tooltip-content>ak-tooltip content</span>
            </:tooltipContent>

            <:default>
                <button data-test-button type="button">Show tooltip</button>
            </:default>
        </AkTooltip>
    `);

    const tooltipRoot = find('[data-test-ak-tooltip-root]');

    assert.dom(tooltipRoot).exists();

    await triggerEvent(tooltipRoot, 'mouseenter');

    assert.dom('[data-test-ak-tooltip-content]').exists();

    assert
      .dom('[data-test-tooltip-content]')
      .exists()
      .hasText('ak-tooltip content');

    await triggerEvent(tooltipRoot, 'mouseleave');

    assert.dom('[data-test-ak-tooltip-content]').doesNotExist();
    assert.dom('[data-test-tooltip-content]').doesNotExist();
  });

  test('it renders ak-tooltip with arrow', async function (assert) {
    await render(hbs`
        <AkTooltip @title="ak-tooltip" @arrow={{this.arrow}}>
            <button data-test-button type="button">Show tooltip</button>
        </AkTooltip>
    `);

    const tooltipRoot = find('[data-test-ak-tooltip-root]');

    await triggerEvent(tooltipRoot, 'mouseenter');

    assert
      .dom('[data-test-ak-tooltip-popover]')
      .exists()
      .doesNotHaveClass(/ak-tooltip-arrow-popover-root/i);

    assert.dom('[data-test-ak-tooltip-content]').exists().hasText('ak-tooltip');
    assert.dom('[data-popper-arrow]').doesNotExist();

    this.set('arrow', true);

    assert.dom('[data-popper-arrow]').exists();

    assert
      .dom('[data-test-ak-tooltip-popover]')
      .hasClass(/ak-tooltip-arrow-popover-root/i);
  });

  test('it renders ak-tooltip in dark & light color', async function (assert) {
    await render(hbs`
        <AkTooltip @title="ak-tooltip" @color={{this.color}}>
            <button data-test-button type="button">Show tooltip</button>
        </AkTooltip>
    `);

    const tooltipRoot = find('[data-test-ak-tooltip-root]');

    assert.dom(tooltipRoot).exists();

    await triggerEvent(tooltipRoot, 'mouseenter');

    assert
      .dom('[data-test-ak-tooltip-content]')
      .exists()
      .hasText('ak-tooltip')
      .hasClass(/ak-tooltip-color-dark/i);

    this.set('color', 'light');

    assert
      .dom('[data-test-ak-tooltip-content]')
      .hasClass(/ak-tooltip-color-light/i);
  });

  test('test ak-tooltip onOpen & onClose called', async function (assert) {
    let onOpenEvent = null;
    let onCloseEvent = null;

    this.setProperties({
      onOpen: (event) => {
        onOpenEvent = event;
      },
      onClose: (event) => {
        onCloseEvent = event;
      },
    });

    await render(hbs`
        <AkTooltip @onOpen={{this.onOpen}} @onClose={{this.onClose}} @title="ak-tooltip">
            <button data-test-button type="button">Show tooltip</button>
        </AkTooltip>
    `);

    const tooltipRoot = find('[data-test-ak-tooltip-root]');

    assert.dom(tooltipRoot).exists();
    assert.notOk(onOpenEvent);
    assert.notOk(onCloseEvent);

    await triggerEvent(tooltipRoot, 'mouseenter');

    assert.dom('[data-test-ak-tooltip-content]').exists().hasText('ak-tooltip');
    assert.ok(onOpenEvent);
    assert.notOk(onCloseEvent);

    await triggerEvent(tooltipRoot, 'mouseleave');

    assert.dom('[data-test-ak-tooltip-content]').doesNotExist();
    assert.ok(onCloseEvent);
  });

  test('test ak-tooltip disabled', async function (assert) {
    let onOpenEvent = null;
    let onCloseEvent = null;

    this.setProperties({
      onOpen: (event) => {
        onOpenEvent = event;
      },
      onClose: (event) => {
        onCloseEvent = event;
      },
      disabled: true,
    });

    await render(hbs`
        <AkTooltip @disabled={{this.disabled}} @onOpen={{this.onOpen}} @onClose={{this.onClose}} @title="ak-tooltip">
            <button data-test-button type="button">Show tooltip</button>
        </AkTooltip>
    `);

    const tooltipRoot = find('[data-test-ak-tooltip-root]');

    assert.dom(tooltipRoot).exists();
    assert.notOk(onOpenEvent);
    assert.notOk(onCloseEvent);

    // tooltip should not be visible and events should not trigger
    await triggerEvent(tooltipRoot, 'mouseenter');

    assert.dom('[data-test-ak-tooltip-content]').doesNotExist();
    assert.notOk(onOpenEvent);
    assert.notOk(onCloseEvent);

    await triggerEvent(tooltipRoot, 'mouseleave');

    assert.notOk(onOpenEvent);
    assert.notOk(onCloseEvent);

    // tooltip should work now
    this.set('disabled', false);

    await triggerEvent(tooltipRoot, 'mouseenter');

    assert.dom('[data-test-ak-tooltip-content]').exists().hasText('ak-tooltip');
    assert.ok(onOpenEvent);
    assert.notOk(onCloseEvent);

    await triggerEvent(tooltipRoot, 'mouseleave');

    assert.dom('[data-test-ak-tooltip-content]').doesNotExist();
    assert.ok(onCloseEvent);
  });
});
