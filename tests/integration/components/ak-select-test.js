import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, findAll } from '@ember/test-helpers';
import styles from 'irene/components/ak-select/index.scss';
import { selectChoose } from 'ember-power-select/test-support';
import { hbs } from 'ember-cli-htmlbars';

const selectItems = [
  { label: 'Maintainer', value: 'maintainer' },
  { label: 'Developer', value: 'developer' },
  { label: 'Reporter', value: 'reporter' },
];

const classes = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

module('Integration | Component | ak-select', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-select', async function (assert) {
    this.setProperties({
      selectItems,
      value: selectItems[0],
      handleSelectChange: (value) => {
        this.set('value', value);
      },
    });

    await render(hbs`
        <AkSelect 
            @onChange={{this.handleSelectChange}} 
            @options={{this.selectItems}} 
            @selected={{this.value}} as |aks|>
            {{aks.label}}
        </AkSelect>
    `);

    assert.dom(`.${classes.trigger}`).exists();

    await click(`.${classes.trigger}`);

    assert.dom(`.${classes.dropdown}`).exists();
  });

  test('it renders ak-select disabled', async function (assert) {
    this.setProperties({
      selectItems,
      value: selectItems[0],
      handleSelectChange: (value) => {
        this.set('value', value);
      },
    });

    await render(hbs`
      <AkSelect 
        @disabled={{true}}
        @onChange={{this.handleSelectChange}} 
        @options={{this.selectItems}} 
        @selected={{this.value}} as |aks|>
        {{aks.label}}
      </AkSelect>
    `);

    assert.dom(`.${classes.trigger}`).exists().hasAria('disabled', 'true');

    await click(`.${classes.trigger}`);

    assert.dom(`.${classes.dropdown}`).doesNotExist();
  });

  test('it renders ak-select with label', async function (assert) {
    this.setProperties({
      selectItems,
      value: selectItems[0],
      handleSelectChange: (value) => {
        this.set('value', value);
      },
      label: 'Test label',
    });

    await render(hbs`
      <AkSelect 
        @label={{this.label}}
        @onChange={{this.handleSelectChange}} 
        @options={{this.selectItems}} 
        @selected={{this.value}} as |aks|>
        {{aks.label}}
      </AkSelect>
    `);

    assert.dom(`.${classes.trigger}`).exists();
    assert.dom('[data-test-form-label]').exists();

    this.set('label', '');

    assert.dom('[data-test-form-label]').doesNotExist();
  });

  test('it renders ak-select with helper text', async function (assert) {
    this.setProperties({
      selectItems,
      value: selectItems[0],
      handleSelectChange: (value) => {
        this.set('value', value);
      },
      helperText: 'Test helper text',
    });

    await render(hbs`
      <AkSelect 
        @helperText={{this.helperText}}
        @onChange={{this.handleSelectChange}} 
        @options={{this.selectItems}} 
        @selected={{this.value}} as |aks|>
        {{aks.label}}
      </AkSelect>
    `);

    assert.dom(`.${classes.trigger}`).exists();
    assert.dom('[data-test-helper-text]').exists();

    this.set('helperText', '');

    assert.dom('[data-test-helper-text]').doesNotExist();
  });

  test('it renders ak-select in error state', async function (assert) {
    this.setProperties({
      selectItems,
      value: selectItems[0],
      handleSelectChange: (value) => {
        this.set('value', value);
      },
      helperText: 'Test helper text',
      error: true,
    });

    await render(hbs`
        <AkSelect 
          @error={{this.error}}
          @helperText={{this.helperText}}
          @onChange={{this.handleSelectChange}} 
          @options={{this.selectItems}} 
          @selected={{this.value}} as |aks|>
          {{aks.label}}
        </AkSelect>
    `);

    assert.dom(`.${classes.trigger}`).exists().hasClass(classes.triggerError);

    assert
      .dom('[data-test-helper-text]')
      .exists()
      .hasClass(/ak-error-form-helper-text/i);

    this.set('error', false);

    assert.dom(`.${classes.trigger}`).doesNotHaveClass(classes.triggerError);

    assert
      .dom('[data-test-helper-text]')
      .doesNotHaveClass(/ak-error-form-helper-text/i);
  });

  test.each(
    'test ak-select for placeholder & value',
    [
      ['', '', ''],
      ['', 'test placeholder', 'test placeholder'],
      [selectItems[0], 'test placeholder', selectItems[0].label],
    ],
    async function (assert, [value, placeholder, expectedText]) {
      this.setProperties({
        selectItems,
        value,
        placeholder,
        handleSelectChange: (value) => {
          this.set('value', value);
        },
      });

      await render(hbs`
        <AkSelect 
          @placeholder={{this.placeholder}}
          @onChange={{this.handleSelectChange}} 
          @options={{this.selectItems}} 
          @selected={{this.value}} as |aks|>
          {{aks.label}}
        </AkSelect>
    `);

      assert.dom(`.${classes.trigger}`).exists().hasText(expectedText);

      await selectChoose(`.${classes.trigger}`, selectItems[2].label);

      assert.dom(`.${classes.trigger}`).exists().hasText(selectItems[2].label);
    }
  );

  test('test ak-select selection', async function (assert) {
    // for testing purpose
    const selectedIndex = 0;

    this.setProperties({
      selectItems,
      value: selectItems[selectedIndex],
      handleSelectChange: (value) => {
        this.set('value', value);
      },
    });

    await render(hbs`
        <AkSelect 
          @onChange={{this.handleSelectChange}} 
          @options={{this.selectItems}} 
          @selected={{this.value}} as |aks|>
          {{aks.label}}
        </AkSelect>
    `);

    assert.dom(`.${classes.trigger}`).exists();

    await click(`.${classes.trigger}`);

    assert.dom(`.${classes.dropdown}`).exists();

    const selectListItems = findAll('.ember-power-select-option');

    assert.dom(selectListItems[selectedIndex]).hasAria('selected', 'true');

    const nextSelectIndex = 2;

    assert.dom(selectListItems[nextSelectIndex]).hasAria('selected', 'false');

    await selectChoose(
      `.${classes.trigger}`,
      selectItems[nextSelectIndex].label
    );

    assert.dom(selectListItems[nextSelectIndex]).hasAria('selected', 'true');
  });

  test('test ak-select onOpen & onClose', async function (assert) {
    let onOpenCalled = false;
    let onCloseCalled = false;

    this.setProperties({
      selectItems,
      value: selectItems[0],
      handleSelectChange: (value) => {
        this.set('value', value);
      },
      onOpen: () => {
        onOpenCalled = true;
      },
      onClose: () => {
        onCloseCalled = true;
      },
    });

    await render(hbs`
      <AkSelect 
        @onChange={{this.handleSelectChange}} 
        @options={{this.selectItems}} 
        @onOpen={{this.onOpen}}
        @onClose={{this.onClose}}
        @selected={{this.value}} as |aks|>
          {{aks.label}}
      </AkSelect>
    `);

    assert.dom(`.${classes.trigger}`).exists();

    await click(`.${classes.trigger}`);

    assert.dom(`.${classes.dropdown}`).exists();
    assert.true(onOpenCalled);

    await click(`.${classes.trigger}`);

    assert.true(onCloseCalled);
  });
});
