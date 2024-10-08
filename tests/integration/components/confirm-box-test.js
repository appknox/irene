import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { setupIntl, t } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | confirm-box', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders confirm-box', async function (assert) {
    this.setProperties({
      open: false,
      handleOpen: () => {
        this.set('open', true);
      },
    });

    await render(hbs`
        <button data-test-button type="button" {{on 'click' this.handleOpen}}>Open modal</button>

        <ConfirmBox @isActive={{this.open}} />
    `);

    await click('[data-test-button]');

    assert.dom('[data-test-ak-modal-header]').exists().hasText(t('confirm'));
    assert.dom('[data-test-confirmbox-description]').doesNotExist();

    assert.dom('[data-test-confirmbox-confirmBtn]').exists().hasText(t('ok'));

    assert
      .dom('[data-test-confirmbox-cancelBtn]')
      .exists()
      .hasText(t('cancel'));
  });

  test('it renders confirm-box disabled', async function (assert) {
    this.setProperties({
      open: true,
      disabled: true,
    });

    await render(hbs`
        <ConfirmBox @isActive={{this.open}} @disabled={{this.disabled}} />
    `);

    assert.dom('[data-test-ak-modal-header]').exists().hasText(t('confirm'));
    assert.dom('[data-test-confirmbox-description]').doesNotExist();

    assert
      .dom('[data-test-confirmbox-confirmBtn]')
      .exists()
      .isDisabled()
      .hasText(t('ok'));

    assert.dom('[data-test-ak-button-loader]').exists();

    assert
      .dom('[data-test-confirmbox-cancelBtn]')
      .isDisabled()
      .exists()
      .hasText(t('cancel'));
  });

  test('it renders confirm-box with custom values', async function (assert) {
    this.setProperties({
      open: false,
      handleOpen: () => {
        this.set('open', true);
      },
      title: 'Header title',
      description: 'description',
      confirmText: 'confirm text',
      cancelText: 'cancel text',
    });

    await render(hbs`
        <button data-test-button type="button" {{on 'click' this.handleOpen}}>Open modal</button>

        <ConfirmBox 
            @isActive={{this.open}} 
            @title={{this.title}} 
            @description={{this.description}}
            @confirmText={{this.confirmText}}
            @cancelText={{this.cancelText}} />
    `);

    await click('[data-test-button]');

    assert.dom('[data-test-ak-modal-header]').exists().hasText(this.title);

    assert
      .dom('[data-test-confirmbox-description]')
      .exists()
      .hasText(this.description);

    assert
      .dom('[data-test-confirmbox-confirmBtn]')
      .exists()
      .hasText(this.confirmText);

    assert
      .dom('[data-test-confirmbox-cancelBtn]')
      .exists()
      .hasText(this.cancelText);
  });

  test('test confirm-box cancel without cancelAction', async function (assert) {
    this.setProperties({
      open: false,
      handleOpen: () => {
        this.set('open', true);
      },
    });

    await render(hbs`
        <button data-test-button type="button" {{on 'click' this.handleOpen}}>Open modal</button>

        <ConfirmBox @isActive={{this.open}} />
    `);

    await click('[data-test-button]');

    assert.dom('[data-test-ak-modal-header]').exists().hasText(t('confirm'));
    assert.dom('[data-test-confirmbox-description]').doesNotExist();

    assert.dom('[data-test-confirmbox-confirmBtn]').exists().hasText(t('ok'));

    assert
      .dom('[data-test-confirmbox-cancelBtn]')
      .exists()
      .hasText(t('cancel'));

    await click('[data-test-confirmbox-confirmBtn]');

    await click('[data-test-confirmbox-cancelBtn]');

    assert.dom('[data-test-ak-modal-header]').doesNotExist();
    assert.dom('[data-test-confirmbox-confirmBtn]').doesNotExist();
    assert.dom('[data-test-confirmbox-cancelBtn]').doesNotExist();
  });

  test('test confirm-box cancel with confirmAction & cancelAction', async function (assert) {
    this.setProperties({
      open: false,
      handleOpen: () => {
        this.set('open', true);
      },
      confirmCalled: false,
      cancelCalled: false,
      handleConfirm: () => {
        this.set('confirmCalled', true);
      },
      handleCancel: () => {
        this.set('cancelCalled', true);
      },
    });

    await render(hbs`
        <button data-test-button type="button" {{on 'click' this.handleOpen}}>Open modal</button>

        <ConfirmBox @isActive={{this.open}} @confirmAction={{this.handleConfirm}} @cancelAction={{this.handleCancel}} />
    `);

    await click('[data-test-button]');

    assert.dom('[data-test-ak-modal-header]').exists().hasText(t('confirm'));
    assert.dom('[data-test-confirmbox-description]').doesNotExist();

    assert.dom('[data-test-confirmbox-confirmBtn]').exists().hasText(t('ok'));

    assert
      .dom('[data-test-confirmbox-cancelBtn]')
      .exists()
      .hasText(t('cancel'));

    await click('[data-test-confirmbox-confirmBtn]');

    assert.true(this.confirmCalled);

    await click('[data-test-confirmbox-cancelBtn]');

    assert.true(this.cancelCalled);

    assert.dom('[data-test-ak-modal-header]').doesNotExist();
    assert.dom('[data-test-confirmbox-confirmBtn]').doesNotExist();
    assert.dom('[data-test-confirmbox-cancelBtn]').doesNotExist();
  });

  test('it renders confirm-box with content block', async function (assert) {
    this.setProperties({
      open: false,
      handleOpen: () => {
        this.set('open', true);
      },
    });

    await render(hbs`
        <button data-test-button type="button" {{on 'click' this.handleOpen}}>Open modal</button>

        <ConfirmBox @isActive={{this.open}}>
          <:content>
            <span data-test-description-block>description</span>
          </:content>
        </ConfirmBox>
    `);

    await click('[data-test-button]');

    assert.dom('[data-test-ak-modal-header]').exists().hasText(t('confirm'));
    assert.dom('[data-test-description-block]').exists().hasText('description');
    assert.dom('[data-test-confirmbox-description]').doesNotExist();

    assert.dom('[data-test-confirmbox-confirmBtn]').exists().hasText(t('ok'));

    assert
      .dom('[data-test-confirmbox-cancelBtn]')
      .exists()
      .hasText(t('cancel'));
  });
});
