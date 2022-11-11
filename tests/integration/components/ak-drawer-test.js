import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-drawer', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders drawer', async function (assert) {
    this.setProperties({
      open: true,
      onClose: () => {
        this.set('open', false);
      },
    });

    await render(
      hbs`
        <AkDrawer @anchor="left" @open={{this.open}} @onClose={{this.onClose}}>
          <div data-test-drawer-content {{style (hash width="250px")}} />
        </AkDrawer>
      `
    );

    assert.dom('[data-test-drawer-content]').exists();
    assert.dom('[data-test-backdrop]').exists();
  });

  test('it renders drawer with anchor left', async function (assert) {
    this.setProperties({
      open: true,
      onClose: () => {
        this.set('open', false);
      },
    });

    await render(
      hbs`
        <AkDrawer @anchor="left" @open={{this.open}} @onClose={{this.onClose}}>
          <div data-test-drawer-content {{style (hash width="250px")}} />
        </AkDrawer>
      `
    );

    assert
      .dom('[data-test-ak-drawer-container]')
      .hasClass(/drawer-anchor-left/i);
  });

  test('it renders drawer with anchor right', async function (assert) {
    this.setProperties({
      open: true,
      onClose: () => {
        this.set('open', false);
      },
    });

    await render(
      hbs`
        <AkDrawer @anchor="right" @open={{this.open}} @onClose={{this.onClose}}>
          <div data-test-drawer-content {{style (hash width="250px")}} />
        </AkDrawer>
      `
    );

    assert
      .dom('[data-test-ak-drawer-container]')
      .hasClass(/drawer-anchor-right/i);
  });

  test('test drawer backdrop click', async function (assert) {
    this.setProperties({
      open: true,
      onClose: () => {
        this.set('open', false);
      },
      disableBackdropClick: false,
    });

    await render(
      hbs`
        <AkDrawer @anchor="left" @open={{this.open}} @onClose={{this.onClose}} @disableBackdropClick={{this.disableBackdropClick}}>
          <div data-test-drawer-content {{style (hash width="250px")}} />
        </AkDrawer>
      `
    );

    await click('[data-test-backdrop]');

    assert.false(this.open);
    assert.dom('[data-test-ak-drawer-container]').doesNotExist();

    // open drawer again and disableBackdropClick
    this.set('open', true);
    this.set('disableBackdropClick', true);

    assert.dom('[data-test-ak-drawer-container]').exists();

    await click('[data-test-backdrop]');

    assert.dom('[data-test-ak-drawer-container]').exists();
  });

  test('test drawer context close handler', async function (assert) {
    this.setProperties({
      open: true,
      onClose: () => {
        this.set('open', false);
      },
    });

    await render(
      hbs`
        <AkDrawer @anchor="right" @open={{this.open}} @onClose={{this.onClose}} as |dr|>
          <div data-test-drawer-content {{style (hash width="250px")}}>
              <button data-test-close-btn type="button" {{on 'click' dr.closeHandler}}>
                  close
              </button>
          </div>
        </AkDrawer>
      `
    );

    await click('[data-test-close-btn]');

    assert.false(this.open);
    assert.dom('[data-test-ak-drawer-container]').doesNotExist();
  });
});
