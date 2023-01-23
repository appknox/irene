import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const menuData = [
  { label: 'Add Project', icon: 'note-add', divider: true },
  { label: 'Add Member', icon: 'group-add', divider: true },
  { label: 'Delete', icon: 'delete', divider: false },
];

module('Integration | Component | ak-menu', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-menu', async function (assert) {
    this.setProperties({
      menuData,
      handleMoreClick: (event) => {
        this.set('anchorRef', event.currentTarget);
      },
      handleClose: () => {
        this.set('anchorRef', null);
      },
    });

    await render(hbs`
        <AkIconButton data-test-more-btn @variant="outlined" {{on 'click' this.handleMoreClick}}>
            <AkIcon @iconName="more-vert" />
        </AkIconButton>

        <AkMenu @anchorRef={{this.anchorRef}} @onClose={{this.handleClose}} as |akm|>
            {{#each this.menuData as |data|}}
                <akm.listItem @onClick={{this.handleClose}} @divider={{data.divider}}>
                    <AkTypography>{{data.label}}</AkTypography>
                </akm.listItem>
            {{/each}}
        </AkMenu>
    `);

    await click('[data-test-more-btn]');

    assert.dom('[data-test-ak-menu-root]').exists();
    assert.dom('[data-test-ak-menu-backdrop]').exists();
    assert.dom('[data-test-ak-menu]').exists();
  });

  test('it renders ak-menu with arrow', async function (assert) {
    this.setProperties({
      menuData,
      handleMoreClick: (event) => {
        this.set('anchorRef', event.currentTarget);
      },
    });

    await render(hbs`
        <AkIconButton data-test-more-btn {{on 'click' this.handleMoreClick}}>
            <AkIcon @iconName="more-vert" />
        </AkIconButton>

        <AkMenu @arrow={{this.arrow}} @anchorRef={{this.anchorRef}} as |akm|>
            {{#each this.menuData as |data|}}
                <akm.listItem @divider={{data.divider}}>
                    <AkTypography>{{data.label}}</AkTypography>
                </akm.listItem>
            {{/each}}
        </AkMenu>
    `);

    await click('[data-test-more-btn]');

    assert.dom('[data-test-ak-menu-root]').exists();
    assert.dom('[data-test-ak-menu-backdrop]').exists();

    assert
      .dom('[data-test-ak-menu-popover]')
      .exists()
      .doesNotHaveClass(/ak-menu-arrow-popover-root/i);

    assert.dom('[data-popper-arrow]').doesNotExist();

    this.set('arrow', true);

    assert
      .dom('[data-test-ak-menu-popover]')
      .hasClass(/ak-menu-arrow-popover-root/i);

    assert.dom('[data-popper-arrow]').exists();
  });

  test('it renders ak-menu with same width as ref', async function (assert) {
    this.setProperties({
      menuData,
      handleMoreClick: (event) => {
        this.set('anchorRef', event.currentTarget);
      },
    });

    await render(hbs`
        <AkButton data-test-more-btn {{on 'click' this.handleMoreClick}}>
            Menu button
        </AkButton>

        <AkMenu @sameWidthAsRef={{this.sameWidthAsRef}} @anchorRef={{this.anchorRef}} as |akm|>
            {{#each this.menuData as |data|}}
                <akm.listItem @divider={{data.divider}}>
                    <AkTypography>{{data.label}}</AkTypography>
                </akm.listItem>
            {{/each}}
        </AkMenu>
    `);

    await click('[data-test-more-btn]');

    assert.dom('[data-test-ak-menu-root]').exists();
    assert.dom('[data-test-ak-menu-backdrop]').exists();

    assert
      .dom('[data-test-ak-menu]')
      .exists()
      .doesNotHaveClass(/ak-menu-dropdown-full-width/i);

    this.set('sameWidthAsRef', true);

    assert.dom('[data-test-ak-menu]').hasClass(/ak-menu-dropdown-full-width/i);
  });

  test('test ak-menu backdrop click', async function (assert) {
    this.setProperties({
      menuData,
      handleMoreClick: (event) => {
        this.set('anchorRef', event.currentTarget);
      },
      handleClose: () => {
        this.set('anchorRef', null);
      },
    });

    await render(hbs`
        <AkIconButton data-test-more-btn @variant="outlined" {{on 'click' this.handleMoreClick}}>
            <AkIcon @iconName="more-vert" />
        </AkIconButton>

        <AkMenu @anchorRef={{this.anchorRef}} @onClose={{this.handleClose}} as |akm|>
            {{#each this.menuData as |data|}}
                <akm.listItem @onClick={{this.handleClose}} @divider={{data.divider}}>
                    <AkTypography>{{data.label}}</AkTypography>
                </akm.listItem>
            {{/each}}
        </AkMenu>
    `);

    await click('[data-test-more-btn]');

    assert.dom('[data-test-ak-menu-root]').exists();
    assert.dom('[data-test-ak-menu-backdrop]').exists();
    assert.dom('[data-test-ak-menu]').exists();

    await click('[data-test-ak-menu-backdrop]');

    assert.dom('[data-test-ak-menu-root]').doesNotExist();
    assert.dom('[data-test-ak-menu-backdrop]').doesNotExist();
    assert.dom('[data-test-ak-menu]').doesNotExist();
  });

  test('test ak-menu menu item click', async function (assert) {
    // for testing purpose
    const itemIndex = 1;
    let itemLabel = null;

    this.setProperties({
      menuData,
      handleMoreClick: (event) => {
        this.set('anchorRef', event.currentTarget);
      },
      handleClose: () => {
        this.set('anchorRef', null);
      },
      handleMenuItemClick: (value) => {
        itemLabel = value;
        this.set('anchorRef', null);
      },
    });

    await render(hbs`
        <AkIconButton data-test-more-btn @variant="outlined" {{on 'click' this.handleMoreClick}}>
            <AkIcon @iconName="more-vert" />
        </AkIconButton>

        <AkMenu @anchorRef={{this.anchorRef}} @onClose={{this.handleClose}} as |akm|>
            {{#each this.menuData as |data|}}
                <akm.listItem @onClick={{fn this.handleMenuItemClick data.label}} @divider={{data.divider}}>
                    <AkTypography>{{data.label}}</AkTypography>
                </akm.listItem>
            {{/each}}
        </AkMenu>
    `);

    await click('[data-test-more-btn]');

    assert.dom('[data-test-ak-menu-root]').exists();
    assert.dom('[data-test-ak-menu-backdrop]').exists();
    assert.dom('[data-test-ak-menu]').exists();

    const menuListItems = findAll('[data-test-ak-list-item-button]');

    assert.strictEqual(itemLabel, null);

    await click(menuListItems[itemIndex].firstElementChild);

    assert.strictEqual(itemLabel, this.menuData[itemIndex].label);

    assert.dom('[data-test-ak-menu-root]').doesNotExist();
    assert.dom('[data-test-ak-menu-backdrop]').doesNotExist();
    assert.dom('[data-test-ak-menu]').doesNotExist();
  });
});
