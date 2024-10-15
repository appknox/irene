import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-breadcrumbs/item', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.breadcrumbsService = this.owner.lookup('service:breadcrumbs');
  });

  test('it renders a breadcrumb item correctly', async function (assert) {
    this.label = 'Breadcrumb Item';

    await render(hbs`
      <AkBreadcrumbs::Container @id="breadcrumbs_container" data-test-breadcrumbs-container>
        <AkBreadcrumbs::Item @route='' @linkTitle={{this.label}} data-test-breadcrumbs-item  />
      </AkBreadcrumbs::Container>
      
    `);

    assert.dom('[data-test-breadcrumbs-container]').exists();
    assert
      .dom('[data-test-breadcrumbs-item]')
      .exists()
      .containsText(this.label);
  });

  test('it renders multiple breadcrumb items', async function (assert) {
    await render(hbs`
    <AkBreadcrumbs::Container @id="breadcrumbs_container" data-test-breadcrumbs-container>
      <AkBreadcrumbs::Item @route='' data-test-breadcrumbs-item>
          Breadcrumb item 1
        </AkBreadcrumbs::Item>
        <AkBreadcrumbs::Item @route='' data-test-breadcrumbs-item>
          Breadcrumb item 2
        </AkBreadcrumbs::Item>
      </AkBreadcrumbs::Container>
    `);

    const breadcrumbItems = findAll('[data-test-breadcrumbs-item]');
    assert.strictEqual(
      breadcrumbItems.length,
      2,
      'Contains the correct number of breadcrumb items'
    );
  });

  test('it renders the right separator for a particular breadcrumb item', async function (assert) {
    this.separator = '>';

    await render(hbs`
    <AkBreadcrumbs::Container @id="breadcrumbs_container" data-test-breadcrumbs-container>
      <AkBreadcrumbs::Item @route='' @separator={{this.separator}} data-test-breadcrumbs-item-1>
          Breadcrumb item 1
        </AkBreadcrumbs::Item>
        <AkBreadcrumbs::Item @route='' data-test-breadcrumbs-item-2>
          Breadcrumb item 2
        </AkBreadcrumbs::Item>
      </AkBreadcrumbs::Container>
    `);

    assert
      .dom('[data-test-breadcrumbs-item-1] [data-test-breadcrumb-separator]')
      .exists()
      .hasText(this.separator);
  });

  test('it replaces a breadcrumb item correctly', async function (assert) {
    this.replace = true;

    await render(hbs`
    <AkBreadcrumbs::Container @isModifiable={{true}} @id="breadcrumbs_container" data-test-breadcrumbs-container>
      <AkBreadcrumbs::Item @isAppendable={{true}} @id="breadcrumbs-1" @route='' data-test-breadcrumbs-item  data-test-breadcrumbs-item-1>
          Breadcrumb item 1
        </AkBreadcrumbs::Item>

        <AkBreadcrumbs::Item @isAppendable={{true}} @id="breadcrumbs-2" @route='' @replace={{this.replace}} data-test-breadcrumbs-item data-test-breadcrumbs-item-2>
          Breadcrumb item 2
        </AkBreadcrumbs::Item>
      </AkBreadcrumbs::Container>
    `);

    assert.dom('[data-test-breadcrumbs-item-1]').doesNotExist();

    const breadcrumbItems = findAll('[data-test-breadcrumbs-item]');

    assert.strictEqual(
      breadcrumbItems.length,
      1,
      'Contains the correct number of breadcrumb items'
    );
  });

  test('it hides the separator of the last item', async function (assert) {
    await render(hbs`
    <AkBreadcrumbs::Container @id="breadcrumbs_container" data-test-breadcrumbs-container>
      <AkBreadcrumbs::Item @route='' data-test-breadcrumbs-item data-test-breadcrumbs-item-1>
          Breadcrumb item 1
        </AkBreadcrumbs::Item>
        <AkBreadcrumbs::Item @route='' data-test-breadcrumbs-item data-test-breadcrumbs-item-2>
          Breadcrumb item 2
        </AkBreadcrumbs::Item>
      </AkBreadcrumbs::Container>
    `);

    assert
      .dom('[data-test-breadcrumbs-item-2] [data-test-breadcrumb-separator]')
      .hasStyle({ display: 'none' });
  });

  test('it renders the content of a seperator-block', async function (assert) {
    await render(hbs`
    <AkBreadcrumbs::Container @id="breadcrumbs_container" data-test-breadcrumbs-container>
        <AkBreadcrumbs::Item @route='' data-test-breadcrumbs-item data-test-breadcrumbs-item-1>
          <:default>
            Breadcrumb item 1
          </:default>
          <:separator>
            <span data-test-seperator-block>:</span>
          </:separator>
        </AkBreadcrumbs::Item>
        <AkBreadcrumbs::Item @route='' data-test-breadcrumbs-item data-test-breadcrumbs-item-2>
          Breadcrumb item 2
        </AkBreadcrumbs::Item>
      </AkBreadcrumbs::Container>
    `);

    assert
      .dom('[data-test-breadcrumbs-item-1] [data-test-seperator-block]')
      .exists()
      .hasText(':');
  });
});
