import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-autocomplete', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-autocomplete with string menu items', async function (assert) {
    this.setProperties({
      options: [
        'username',
        'password',
        'email',
        'phone',
        'phone2',
        'username2',
      ],
      searchQuery: '',
      onChange: (searchValue) => {
        this.set('searchQuery', searchValue);
      },
    });

    await render(hbs`
      <AkAutocomplete
        @options={{this.options}}
        @searchQuery={{this.searchQuery}}
        @onChange={{this.onChange}}
        as |ac|
      >
        <AkTypography>{{ac}}</AkTypography>
      </AkAutocomplete>
    `);

    assert.dom('[data-test-ak-autocomplete-text-field]').exists();

    await click('[data-test-ak-autocomplete-text-field]');

    assert.dom('[data-test-ak-popover-root]').exists();
    assert.dom('[data-test-ak-autocomplete]').exists();
    assert.dom('[data-test-ak-autocomplete-item]').exists({ count: 6 });
  });

  test('it renders ak-autocomplete with object menu items and filterKey', async function (assert) {
    this.setProperties({
      options: [
        { label: 'username' },
        { label: 'password' },
        { label: 'email' },
      ],
      searchQuery: '',
      filterKey: 'label',
      onChange: (searchValue) => {
        this.set('searchQuery', searchValue);
      },
    });

    await render(hbs`
      <AkAutocomplete
        @options={{this.options}}
        @searchQuery={{this.searchQuery}}
        @onChange={{this.onChange}}
        @filterKey={{this.filterKey}}
        as |ac|
      >
        <AkTypography>{{ac.label}}</AkTypography>
      </AkAutocomplete>
    `);

    assert.dom('[data-test-ak-autocomplete-text-field]').exists();

    await click('[data-test-ak-autocomplete-text-field]');

    assert.dom('[data-test-ak-autocomplete]').exists();
    assert.dom('[data-test-ak-autocomplete-item]').exists({ count: 3 });

    this.set('searchQuery', 'pass');

    assert.dom('[data-test-ak-autocomplete-item]').exists({ count: 1 });
    assert.dom('[data-test-ak-autocomplete-item]').hasText('password');

    await click('[data-test-ak-autocomplete-item]');

    assert.dom('[data-test-ak-autocomplete]').doesNotExist();
    assert.dom('[data-test-text-input]').exists();
    assert.dom('[data-test-text-input]').hasValue('password');
  });

  test('it renders ak-autocomplete with loading state', async function (assert) {
    this.setProperties({
      options: ['item1', 'item2', 'item3'],
      loadingOptions: true,
      loadingText: 'Loading...',
      searchQuery: '',
      onChange: () => {},
    });

    await render(hbs`
      <AkAutocomplete
        @options={{this.options}}
        @searchQuery={{this.searchQuery}}
        @onChange={{this.onChange}}
        @loading={{this.loadingOptions}}
        as |ac|
      >
          <AkTypography>{{ac}}</AkTypography>
      </AkAutocomplete>
    `);

    assert.dom('[data-test-ak-autocomplete-text-field]').exists();

    await click('[data-test-ak-autocomplete-text-field]');

    assert.dom('[data-test-ak-autocomplete]').exists();

    assert
      .dom('[data-test-ak-autocomplete-loading]')
      .exists()
      .containsText(this.loadingText);

    // With a named loading block
    await render(hbs`
      <AkAutocomplete
        @options={{this.options}}
        @searchQuery={{this.searchQuery}}
        @onChange={{this.onChange}}
        @loading={{this.loadingOptions}} 
      >
        <:loading>
          <span data-test-custom-loading-block>{{this.loadingText}}</span>
        </:loading>

        <:default as |ac|>
          <AkTypography>{{ac}}</AkTypography>
        </:default>    
      </AkAutocomplete>
    `);

    assert.dom('[data-test-ak-autocomplete-text-field]').exists();

    await click('[data-test-ak-autocomplete-text-field]');

    assert
      .dom('[data-test-custom-loading-block]')
      .exists()
      .containsText(this.loadingText);
  });

  test('it renders ak-autocomplete with empty state', async function (assert) {
    this.setProperties({
      options: ['item'],
      searchQuery: 'non-existent-item',
      emptyText: 'No matching items',
      onChange: () => {},
    });

    await render(hbs`
      <AkAutocomplete
        @options={{this.options}}
        @searchQuery={{this.searchQuery}}
        @onChange={{this.onChange}}
        as |ac|
      >
          <AkTypography>{{ac}}</AkTypography>
      </AkAutocomplete>
    `);

    assert.dom('[data-test-ak-autocomplete-text-field]').exists();

    await click('[data-test-ak-autocomplete-text-field]');

    assert
      .dom('[data-test-ak-autocomplete-empty]')
      .exists()
      .containsText(this.emptyText);

    await render(hbs`
      <AkAutocomplete
        @options={{this.options}}
        @searchQuery={{this.searchQuery}}
        @onChange={{this.onChange}}
       
      >
        <:empty>
          <span data-test-custom-empty-block>{{this.emptyText}}</span>
        </:empty>

        <:default as |ac|>
          <AkTypography>{{ac}}</AkTypography>
        </:default>   
      </AkAutocomplete>
    `);

    assert.dom('[data-test-ak-autocomplete-text-field]').exists();

    await click('[data-test-ak-autocomplete-text-field]');

    assert
      .dom('[data-test-custom-empty-block]')
      .exists()
      .containsText(this.emptyText);
  });

  test('it renders ak-autocomplete with filter function and object menu items', async function (assert) {
    this.setProperties({
      options: [
        { label: 'username' },
        { label: 'password' },
        { label: 'phone' },
        { label: 'email' },
      ],
      searchQuery: 'ph',
      filterKey: 'label',
      filterFn: (item) => item.label.startsWith('ph'),
      onChange: (searchValue) => {
        this.set('searchQuery', searchValue);
      },
      setInputValueFn: (item) => {
        this.set('searchQuery', item);

        return item.label;
      },
    });

    await render(hbs`
      <AkAutocomplete
        @options={{this.options}}
        @searchQuery={{this.searchQuery}}
        @onChange={{this.onChange}}
        @filterKey={{this.filterKey}}
        @filterFn={{this.filterFn}}
        @setInputValueFn={{this.setInputValueFn}}
        as |ac|
      >
        {{ac.label}}
      </AkAutocomplete>
    `);

    assert.dom('[data-test-ak-autocomplete-text-field]').exists();

    await click('[data-test-ak-autocomplete-text-field]');

    assert.dom('[data-test-ak-autocomplete]').exists();
    assert.dom('[data-test-ak-autocomplete-item]').exists({ count: 1 });
    assert.dom('[data-test-ak-autocomplete-item]').hasText('phone');
  });

  test('it renders ak-autocomplete with custom input click function', async function (assert) {
    assert.expect(4);

    this.setProperties({
      options: [
        'username',
        'password',
        'email',
        'phone',
        'phone2',
        'username2',
      ],
      searchQuery: '',
      onChange: (searchValue) => {
        this.set('searchQuery', searchValue);
      },
      setInputValueFn: () => {
        assert.ok(true, 'setInputValueFn function is called');
      },
    });

    await render(hbs`
      <AkAutocomplete
        @options={{this.options}}
        @searchQuery={{this.searchQuery}}
        @onChange={{this.onChange}}
        @setInputValueFn={{this.setInputValueFn}}
        as |ac|
      >
        <AkTypography>{{ac}}</AkTypography>
      </AkAutocomplete>
    `);

    assert.dom('[data-test-ak-autocomplete-text-field]').exists();

    await click('[data-test-ak-autocomplete-text-field]');

    assert.dom('[data-test-ak-autocomplete]').exists();
    assert.dom('[data-test-ak-autocomplete-item]').exists({ count: 6 });

    await click('[data-test-ak-autocomplete-item]:first-child');
  });

  test('it renders clear button and works as expected', async function (assert) {
    assert.expect(12);

    this.setProperties({
      options: ['username', 'password', 'username2', 'email', 'phone'],
      searchQuery: '',
      onChange: (searchValue) => {
        this.set('searchQuery', searchValue);
      },
      onClear: () => {
        assert.ok(true, 'onClear handler is called');
      },
    });

    await render(hbs`
      <AkAutocomplete
        @options={{this.options}}
        @searchQuery={{this.searchQuery}}
        @onChange={{this.onChange}}
        @onClear={{this.onClear}}
        as |ac|
      >
        <AkTypography>{{ac}}</AkTypography>
      </AkAutocomplete>
    `);

    assert.dom('[data-test-ak-autocomplete-text-field]').exists();

    await click('[data-test-ak-autocomplete-text-field]');

    assert.dom('[data-test-ak-popover-root]').exists();
    assert.dom('[data-test-ak-autocomplete]').exists();
    assert.dom('[data-test-ak-autocomplete-item]').exists({ count: 5 });

    this.set('searchQuery', 'pass');

    assert.dom('[data-test-ak-autocomplete-item]').exists({ count: 1 });
    assert.dom('[data-test-ak-autocomplete-item]').hasText('password');

    await click('[data-test-ak-autocomplete-item]');

    assert.dom('[data-test-ak-autocomplete]').doesNotExist();
    assert.dom('[data-test-text-input]').exists();
    assert.dom('[data-test-text-input]').hasValue('password');

    assert.dom('[data-test-ak-autocomplete-clear-btn]').exists();

    await click('[data-test-ak-autocomplete-clear-btn]');

    assert.dom('[data-test-text-input]').hasValue('');
  });
});
