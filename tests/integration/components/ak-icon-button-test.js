import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-icon-button', function (hooks) {
  setupRenderingTest(hooks);

  test.each(
    'it renders ak-icon-button in all variants',
    [
      { variant: 'default', className: /ak-icon-button-variant-default/i },
      { variant: 'outlined', className: /ak-icon-button-variant-outlined/i },
    ],
    async function (assert, { variant, className }) {
      this.setProperties({ variant });

      await render(hbs`
        <AkIconButton @variant={{this.variant}}>
            <AkIcon @iconName="close" />
        </AkIconButton>
      `);

      assert
        .dom('[data-test-ak-icon-button]')
        .exists()
        .isNotDisabled()
        .hasClass(className);
    }
  );

  test.each(
    'it renders ak-icon-button in different sizes',
    [
      { size: '', className: /ak-icon-button-size-medium/i },
      { size: 'small', className: /ak-icon-button-size-small/i },
      { size: 'medium', className: /ak-icon-button-size-medium/i },
    ],
    async function (assert, { size, className }) {
      this.setProperties({ size });

      await render(hbs`
        <AkIconButton @size={{this.size}}>
            <AkIcon @iconName="close" />
        </AkIconButton>
      `);

      assert
        .dom('[data-test-ak-icon-button]')
        .exists()
        .isNotDisabled()
        .hasClass(className);
    }
  );

  test('it render button with disabled state', async function (assert) {
    this.set('disabled', true);

    await render(hbs`
        <AkIconButton disabled={{this.disabled}}>
            <AkIcon @iconName="close" />
        </AkIconButton>
    `);

    assert.dom('[data-test-ak-icon-button]').exists().isDisabled();
  });

  test('it render icon button with different types', async function (assert) {
    this.set('type', 'button');

    await render(hbs`
        <AkIconButton @type={{this.type}}>
            <AkIcon @iconName="close" />
        </AkIconButton>
    `);

    assert
      .dom('[data-test-ak-icon-button]')
      .exists()
      .hasProperty('type', 'button');

    this.set('type', 'submit');

    assert.dom('[data-test-ak-icon-button]').hasProperty('type', 'submit');
  });

  test('it handle click event from icon btn', async function (assert) {
    assert.expect(1);

    this.set('onClick', () => {
      assert.ok(true, 'click event handled');
    });

    await render(hbs`
        <AkIconButton {{on 'click' this.onClick}}>
            <AkIcon @iconName="close" />
        </AkIconButton>
    `);

    await click('[data-test-ak-icon-button]');
  });
});
