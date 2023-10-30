import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import { hbs } from 'ember-cli-htmlbars';
import styles from 'irene/components/ak-popover/index.scss';

const classes = {
  hide: styles['hide'],
};

const containerStyles = {
  container: {
    width: 'max-content',
    background: '#fff',
    border: '1px solid #e9e9e9',
    boxShadow: '4px 4px 10px 0px rgba(0, 0, 0, 0.15)',
    margin: '0.8em',
  },
};

module('Integration | Component | ak-popover', function (hooks) {
  setupRenderingTest(hooks);
  setupBrowserFakes(hooks, { window: true });

  hooks.beforeEach(async function () {
    this.setProperties({
      containerStyles: containerStyles,

      handleMoreClick: (event) => {
        if (!this.anchorRef) {
          this.set('anchorRef', event.currentTarget);
          return;
        }

        this.set('anchorRef', null);
      },

      handleClose: () => {
        this.set('anchorRef', null);
      },
    });
  });

  test('it renders ak-popover with backdrop & close with backdrop click', async function (assert) {
    this.setProperties({
      popoverContent: 'I am inside popover!',
      hasBackdrop: true,
    });

    await render(hbs`
      <AkIconButton data-test-more-btn @variant="outlined" {{on 'click' this.handleMoreClick}}>
        <AkIcon @iconName="more-vert" />
      </AkIconButton>

      <AkPopover 
        @anchorRef={{this.anchorRef}} 
        @hasBackdrop={{this.hasBackdrop}} 
        @onBackdropClick={{this.handleClose}}
        >
          <div data-test-popover-content {{style this.styles.containerStyles}} class="p-2">
              <AkTypography>{{this.popoverContent}}</AkTypography>
          </div>
      </AkPopover>
    `);

    // open popover
    await click('[data-test-more-btn]');

    assert.dom('[data-test-ak-popover-root]').exists();
    assert.dom('[data-test-ak-popover-backdrop]').exists();

    assert.dom('[data-test-popover-content]').hasText(this.popoverContent);

    // close popover
    await click('[data-test-ak-popover-backdrop]');

    assert.dom('[data-test-ak-popover-root]').doesNotExist();
    assert.dom('[data-test-ak-popover-backdrop]').doesNotExist();
    assert.dom('[data-test-popover-content]').doesNotExist();
  });

  test('it renders ak-popover without backdrop', async function (assert) {
    this.setProperties({
      popoverContent: 'I am inside popover!',
      hasBackdrop: false,
    });

    await render(hbs`
      <AkIconButton data-test-more-btn @variant="outlined" {{on 'click' this.handleMoreClick}}>
        <AkIcon @iconName="more-vert" />
      </AkIconButton>

      <AkPopover 
        @anchorRef={{this.anchorRef}} 
        @hasBackdrop={{this.hasBackdrop}} 
        >
          <div data-test-popover-content {{style this.styles.containerStyles}} class="p-2">
              <AkTypography>{{this.popoverContent}}</AkTypography>
          </div>
      </AkPopover>
    `);

    // open popover
    await click('[data-test-more-btn]');

    assert.dom('[data-test-ak-popover-root]').exists();
    assert.dom('[data-test-ak-popover-backdrop]').doesNotExist();

    assert.dom('[data-test-popover-content]').hasText(this.popoverContent);

    // close popover
    await click('[data-test-more-btn]');

    assert.dom('[data-test-ak-popover-root]').doesNotExist();
    assert.dom('[data-test-popover-content]').doesNotExist();
  });

  test('it renders ak-popover with click outside to close without backdrop', async function (assert) {
    this.setProperties({
      popoverContent: 'I am inside popover!',
      hasBackdrop: false,
      clickOutsideToClose: true,
    });

    await render(hbs`
      <div data-test-outside />

      <AkIconButton data-test-more-btn @variant="outlined" {{on 'click' this.handleMoreClick}}>
        <AkIcon @iconName="more-vert" />
      </AkIconButton>

      <AkPopover 
        @anchorRef={{this.anchorRef}} 
        @hasBackdrop={{this.hasBackdrop}}
        @clickOutsideToClose={{this.clickOutsideToClose}}
        @closeHandler={{this.handleClose}}
        >
          <div data-test-popover-content {{style this.styles.containerStyles}} class="p-2">
            <AkTypography>{{this.popoverContent}}</AkTypography>
          </div>
      </AkPopover>
    `);

    // open popover
    await click('[data-test-more-btn]');

    assert.dom('[data-test-ak-popover-root]').exists();
    assert.dom('[data-test-ak-popover-backdrop]').doesNotExist();

    assert.dom('[data-test-popover-content]').hasText(this.popoverContent);

    // should be open when popover element is clicked
    await click('[data-test-ak-popover-container]');
    assert.dom('[data-test-ak-popover-root]').exists();

    // should be open when popover child element is clicked
    await click('[data-test-popover-content]');
    assert.dom('[data-test-ak-popover-root]').exists();

    // close popover
    await click('[data-test-outside]');

    assert.dom('[data-test-ak-popover-root]').doesNotExist();
    assert.dom('[data-test-popover-content]').doesNotExist();
  });

  test('it renders ak-popover with click outside to close with backdrop', async function (assert) {
    this.setProperties({
      popoverContent: 'I am inside popover!',
      hasBackdrop: true,
      clickOutsideToClose: true,
    });

    await render(hbs`
      <AkIconButton data-test-more-btn @variant="outlined" {{on 'click' this.handleMoreClick}}>
        <AkIcon @iconName="more-vert" />
      </AkIconButton>

      <AkPopover 
        @anchorRef={{this.anchorRef}} 
        @hasBackdrop={{this.hasBackdrop}}
        @clickOutsideToClose={{this.clickOutsideToClose}}
        @closeHandler={{this.handleClose}}
        >
          <div data-test-popover-content {{style this.styles.containerStyles}} class="p-2">
            <AkTypography>{{this.popoverContent}}</AkTypography>
          </div>
      </AkPopover>
    `);

    // open popover
    await click('[data-test-more-btn]');

    assert.dom('[data-test-ak-popover-root]').exists();
    assert.dom('[data-test-ak-popover-backdrop]').exists();

    assert.dom('[data-test-popover-content]').hasText(this.popoverContent);

    // should be open when popover element is clicked
    await click('[data-test-ak-popover-container]');
    assert.dom('[data-test-ak-popover-root]').exists();

    // should be open when popover child element is clicked
    await click('[data-test-popover-content]');
    assert.dom('[data-test-ak-popover-root]').exists();

    // close popover
    await click('[data-test-ak-popover-backdrop]');

    assert.dom('[data-test-ak-popover-root]').doesNotExist();
    assert.dom('[data-test-ak-popover-backdrop]').doesNotExist();
    assert.dom('[data-test-popover-content]').doesNotExist();
  });

  test.each(
    'it renders ak-popover with arrow',
    ['', 'light', 'dark'],
    async function (assert, arrowColor) {
      this.setProperties({
        popoverContent: 'I am inside popover!',
        hasBackdrop: true,
        arrow: true,
        arrowColor,
      });

      await render(hbs`
        <AkIconButton data-test-more-btn @variant="outlined" {{on 'click' this.handleMoreClick}}>
          <AkIcon @iconName="more-vert" />
        </AkIconButton>

        <AkPopover 
          @anchorRef={{this.anchorRef}} 
          @hasBackdrop={{this.hasBackdrop}} 
          @onBackdropClick={{this.handleClose}}
          @arrow={{this.arrow}}
          @arrowColor={{this.arrowColor}}
          >
            <div data-test-popover-content {{style this.styles.containerStyles}} class="p-2">
                <AkTypography>{{this.popoverContent}}</AkTypography>
            </div>
        </AkPopover>
      `);

      // open popover
      await click('[data-test-more-btn]');

      assert.dom('[data-test-ak-popover-root]').exists();
      assert.dom('[data-test-ak-popover-backdrop]').exists();

      assert
        .dom('[data-popper-arrow]')
        .exists()
        .hasClass(RegExp(`ak-popover-arrow-color-${arrowColor || 'light'}`));

      assert.dom('[data-test-popover-content]').hasText(this.popoverContent);

      // close popover
      await click('[data-test-ak-popover-backdrop]');

      assert.dom('[data-test-ak-popover-root]').doesNotExist();
      assert.dom('[data-test-ak-popover-backdrop]').doesNotExist();
      assert.dom('[data-test-popover-content]').doesNotExist();
      assert.dom('[data-popper-arrow]').doesNotExist();
    }
  );

  test('it renders ak-popover with container class', async function (assert) {
    this.setProperties({
      popoverContent: 'I am inside popover!',
      containerClass: 'custom-container-class',
    });

    await render(hbs`
      <AkIconButton data-test-more-btn @variant="outlined" {{on 'click' this.handleMoreClick}}>
        <AkIcon @iconName="more-vert" />
      </AkIconButton>

      <AkPopover 
        @anchorRef={{this.anchorRef}} 
        @containerClass={{this.containerClass}}
        >
          <div data-test-popover-content {{style this.styles.containerStyles}} class="p-2">
              <AkTypography>{{this.popoverContent}}</AkTypography>
          </div>
      </AkPopover>
    `);

    // open popover
    await click('[data-test-more-btn]');

    assert.dom('[data-test-ak-popover-root]').exists();
    assert.dom('[data-test-ak-popover-backdrop]').doesNotExist();

    assert
      .dom('[data-test-ak-popover-container]')
      .hasClass(this.containerClass);

    assert.dom('[data-test-popover-content]').hasText(this.popoverContent);
  });

  test.each(
    'it mounts and unmounts content',
    [
      [true, false],
      [false, false],
      [false, true],
      [true, true],
    ],
    async function (assert, [mountOnOpen, unmountOnClose]) {
      this.setProperties({
        popoverContent: 'I am mounted by default!',
        containerClass: 'custom-container-class',
        mountOnOpen,
        unmountOnClose,
      });

      await render(hbs`
      <AkIconButton data-test-more-btn @variant="outlined" {{on 'click' this.handleMoreClick}}>
        <AkIcon @iconName="more-vert" />
      </AkIconButton>

      <AkPopover 
        @anchorRef={{this.anchorRef}} 
        @containerClass={{this.containerClass}}
        @mountOnOpen={{this.mountOnOpen}}
        @unmountOnClose={{this.unmountOnClose}}
        >
          <div data-test-popover-content {{style this.styles.containerStyles}} class="p-2">
              <AkTypography>{{this.popoverContent}}</AkTypography>
          </div>
      </AkPopover>
    `);

      // Content is mounted only on first open and left mounted thereafter
      if (mountOnOpen && !unmountOnClose) {
        // open popover
        // Mounts content
        await click('[data-test-more-btn]');

        assert.dom('[data-test-ak-popover-root]').exists();

        assert
          .dom('[data-test-ak-popover-container]')
          .hasClass(this.containerClass);

        assert.dom('[data-test-popover-content]').hasText(this.popoverContent);

        // close popover
        await click('[data-test-more-btn]');

        // Content is still mounted but hidden
        assert
          .dom('[data-test-ak-popover-root]')
          .exists()
          .hasClass(classes.hide);

        assert.dom('[data-test-popover-content]').exists();

        // open popover
        await click('[data-test-more-btn]');

        assert
          .dom('[data-test-ak-popover-root]')
          .exists()
          .doesNotHaveClass(classes.hide);

        assert.dom('[data-test-popover-content]').exists();
      }

      // Content is mounted by default and left mounted thereafter
      if (!mountOnOpen && !unmountOnClose) {
        assert
          .dom('[data-test-ak-popover-root]')
          .exists()
          .hasClass(classes.hide);

        assert
          .dom('[data-test-ak-popover-container]')
          .hasClass(this.containerClass);

        assert.dom('[data-test-popover-content]').hasText(this.popoverContent);

        // open popover
        await click('[data-test-more-btn]');

        assert
          .dom('[data-test-ak-popover-root]')
          .exists()
          .doesNotHaveClass(classes.hide);

        assert.dom('[data-test-popover-content]').exists();

        // close popover
        await click('[data-test-more-btn]');

        assert
          .dom('[data-test-ak-popover-root]')
          .exists()
          .hasClass(classes.hide);

        assert.dom('[data-test-popover-content]').exists();
      }

      // Content is mounted by default and unmounted when closed
      if (!mountOnOpen && unmountOnClose) {
        // Content is mounted by default but hidden
        assert
          .dom('[data-test-ak-popover-root]')
          .exists()
          .hasClass(classes.hide);

        assert
          .dom('[data-test-ak-popover-container]')
          .hasClass(this.containerClass);

        assert.dom('[data-test-popover-content]').hasText(this.popoverContent);

        // open popover
        await click('[data-test-more-btn]');

        assert
          .dom('[data-test-ak-popover-root]')
          .exists()
          .doesNotHaveClass(classes.hide);

        assert.dom('[data-test-popover-content]').exists();

        // close popover
        await click('[data-test-more-btn]');

        assert.dom('[data-test-ak-popover-root]').doesNotExist();
        assert.dom('[data-test-popover-content]').doesNotExist();
      }

      // Content is mounted on open and and unmounted when closed
      if (mountOnOpen && unmountOnClose) {
        assert.dom('[data-test-ak-popover-root]').doesNotExist();
        assert.dom('[data-test-popover-content]').doesNotExist();

        // open popover
        await click('[data-test-more-btn]');

        // Content is mounted
        assert
          .dom('[data-test-ak-popover-root]')
          .exists()
          .doesNotHaveClass(classes.hide);

        assert
          .dom('[data-test-ak-popover-container]')
          .hasClass(this.containerClass);

        assert.dom('[data-test-popover-content]').hasText(this.popoverContent);

        // close popover
        await click('[data-test-more-btn]');

        // Content is unmounted
        assert.dom('[data-test-ak-popover-root]').doesNotExist();
        assert.dom('[data-test-popover-content]').doesNotExist();
      }
    }
  );
});
