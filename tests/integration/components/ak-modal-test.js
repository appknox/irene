import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-modal', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-modal', async function (assert) {
    this.setProperties({
      open: false,
      handleOpen: () => {
        this.set('open', true);
      },
      showHeader: true,
      headerTitle: 'Header title',
    });

    await render(hbs`
        <button data-test-button type="button" {{on 'click' this.handleOpen}}>Open modal</button>

        {{#if this.open}}
            <AkModal @showHeader={{this.showHeader}} @headerTitle={{this.headerTitle}}>
                modal content
            </AkModal>
        {{/if}}
    `);

    await click('[data-test-button]');

    assert
      .dom('[data-test-ak-modal-header]')
      .exists()
      .hasText(this.headerTitle);

    assert.dom('[data-test-ak-modal-body]').exists().hasText('modal content');
  });

  test('it renders ak-modal with/without header', async function (assert) {
    this.setProperties({
      open: false,
      handleOpen: () => {
        this.set('open', true);
      },
      showHeader: false,
      headerTitle: 'Header title',
    });

    await render(hbs`
        <button data-test-button type="button" {{on 'click' this.handleOpen}}>Open modal</button>

        {{#if this.open}}
            <AkModal @showHeader={{this.showHeader}} @headerTitle={{this.headerTitle}}>
                modal content
            </AkModal>
        {{/if}}
    `);

    await click('[data-test-button]');

    assert.dom('[data-test-ak-modal-header]').doesNotExist();

    this.set('showHeader', true);

    assert
      .dom('[data-test-ak-modal-header]')
      .exists()
      .hasText(this.headerTitle);
  });

  test('test ak-modal with disable overlay click', async function (assert) {
    this.setProperties({
      open: false,
      handleOpen: () => {
        this.set('open', true);
      },
      handleClose: () => {
        this.set('open', false);
      },
      disableOverlayClick: true,
      showHeader: true,
      headerTitle: 'Header title',
    });

    await render(hbs`
        <button data-test-button type="button" {{on 'click' this.handleOpen}}>Open modal</button>

        {{#if this.open}}
            <AkModal 
                @disableOverlayClick={{this.disableOverlayClick}}
                @onClose={{this.handleClose}}
                @showHeader={{this.showHeader}} 
                @headerTitle={{this.headerTitle}}>
                modal content
            </AkModal>
        {{/if}}
    `);

    // overlay click does not close modal
    await click('[data-test-button]');

    assert
      .dom('[data-test-ak-modal-header]')
      .exists()
      .hasText(this.headerTitle);

    const overlay = find('.ak-modal-overlay');

    await click(overlay);

    assert
      .dom('[data-test-ak-modal-header]')
      .exists()
      .hasText(this.headerTitle);

    // now it should close
    this.set('disableOverlayClick', false);

    await click(overlay);

    assert.dom('[data-test-ak-modal-header]').doesNotExist();

    // close button should still be able to close
    this.set('disableOverlayClick', true);

    await click('[data-test-button]');

    assert.dom('[data-test-ak-modal-header]').exists();
    assert.dom('[data-test-modal-close-btn]').exists();

    await click('[data-test-modal-close-btn]');

    assert.dom('[data-test-ak-modal-header]').doesNotExist();
  });

  test('test ak-modal disable close', async function (assert) {
    this.setProperties({
      open: false,
      handleOpen: () => {
        this.set('open', true);
      },
      handleClose: () => {
        this.set('open', false);
      },
      disableClose: true,
      showHeader: true,
      headerTitle: 'Header title',
    });

    await render(hbs`
        <button data-test-button type="button" {{on 'click' this.handleOpen}}>Open modal</button>

        {{#if this.open}}
            <AkModal 
                @disableClose={{this.disableClose}}
                @onClose={{this.handleClose}}
                @showHeader={{this.showHeader}} 
                @headerTitle={{this.headerTitle}}>
                modal content
            </AkModal>
        {{/if}}
    `);

    await click('[data-test-button]');

    assert
      .dom('[data-test-ak-modal-header]')
      .exists()
      .hasText(this.headerTitle);

    assert.dom('[data-test-modal-close-btn]').exists().isDisabled();

    const overlay = find('.ak-modal-overlay');

    await click(overlay);

    assert
      .dom('[data-test-ak-modal-header]')
      .exists()
      .hasText(this.headerTitle);

    this.set('disableClose', false);

    assert.dom('[data-test-modal-close-btn]').exists().isNotDisabled();

    await click(overlay);

    assert.dom('[data-test-ak-modal-header]').doesNotExist();
  });
});
