import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import styles from 'irene/components/ak-stack/index.scss';
import { module, test } from 'qunit';

module('Integration | Component | ak-stack', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with the yielded content', async function (assert) {
    await render(hbs`
    <AkStack>
      <span data-test-ak-stack-item>
        Item - 1
      </span>
      <span data-test-ak-stack-item>
        Item - 2
      </span>
      <span data-test-ak-stack-item>
        Item - 3
      </span>
    </AkStack>
    `);

    const stackItems = this.element.querySelectorAll(
      '[data-test-ak-stack-item]'
    );

    assert.strictEqual(
      stackItems.length,
      3,
      'Yields correct number of stack items.'
    );
  });

  test.each(
    'it renders all flex direction properties correctly',
    ['row', 'row-reverse', 'column', 'column-reverse'],
    async function (assert, direction) {
      this.setProperties({
        direction,
      });

      await render(hbs`
      <AkStack 
        @direction={{this.direction}}
      >
        <span class="p-2">
          Item - 1
        </span>
        <span class="p-2">
          Item - 2
        </span>
        <span class="p-2">
          Item - 3
        </span>
      </AkStack>
      `);

      assert
        .dom('[data-test-ak-stack]')
        .exists()
        .hasClass(styles[`ak-stack-direction-${this.direction}`])
        .hasStyle({
          display: 'flex',
          'flex-direction': this.direction,
        });
    }
  );

  test.each(
    'it renders flex align values correctly',
    ['flex-start', 'flex-end', 'center', 'stretch'],
    async function (assert, alignItems) {
      this.setProperties({
        alignItems,
      });

      await render(hbs`
      <AkStack 
        @alignItems={{this.alignItems}}
      >
        <span class="p-2">
          Item - 1
        </span>
        <span class="p-2">
          Item - 2
        </span>
        <span class="p-2">
          Item - 3
        </span>
      </AkStack>
      `);

      assert
        .dom('[data-test-ak-stack]')
        .exists()
        .hasClass(styles[`ak-stack-alignitems-${this.alignItems}`])
        .hasStyle({
          'align-items': this.alignItems,
        });
    }
  );

  test.each(
    'it renders justify-content values correctly',
    [
      'start',
      'center',
      'space-between',
      'space-around',
      'space-evenly',
      'flex-end',
      'flex-start',
      'stretch',
      'end',
      'left',
      'right',
      'normal',
    ],
    async function (assert, justifyContent) {
      this.setProperties({
        justifyContent,
      });

      await render(hbs`
      <AkStack 
        @justifyContent={{this.justifyContent}}
      >
        <span class="p-2">
          Item - 1
        </span>
        <span class="p-2">
          Item - 2
        </span>
        <span class="p-2">
          Item - 3
        </span>
      </AkStack>
      `);

      assert
        .dom('[data-test-ak-stack]')
        .exists()
        .hasClass(styles[`ak-stack-justifycontent-${this.justifyContent}`])
        .hasStyle({
          'justify-content': this.justifyContent,
        });
    }
  );

  test.each(
    'it renders all width variants correctly',
    [
      '1/12',
      '2/12',
      '3/12',
      '4/12',
      '5/12',
      '6/12',
      '7/12',
      '8/12',
      '9/12',
      '10/12',
      '11/12',
      '12/12',
      'full',
      'fit-content',
      'auto',
    ],
    async function (assert, width) {
      this.setProperties({
        width,
      });

      await render(hbs`
    <AkStack 
      @width={{this.width}}
    >
      <span class="p-2">
        Item - 1
      </span>
      <span class="p-2">
        Item - 2
      </span>
      <span class="p-2">
        Item - 3
      </span>
    </AkStack>`);

      assert
        .dom('[data-test-ak-stack]')
        .exists()
        .hasClass(styles[`ak-stack-width-${this.width}`]);
    }
  );

  test.each(
    'it renders all spacing variants correctly',
    [
      ['0', /ak-stack-spacing-0/i],
      ['0.5', /ak-stack-spacing-1\/2/i],
      ['1', /ak-stack-spacing-1/i],
      ['1.5', /ak-stack-spacing-3\/2/i],
      ['2', /ak-stack-spacing-2/i],
      ['2.5', /ak-stack-spacing-5\/2/i],
      ['3', /ak-stack-spacing-3/i],
      ['3.5', /ak-stack-spacing-7\/2/i],
      ['4', /ak-stack-spacing-4/i],
      ['4.5', /ak-stack-spacing-9\/2/],
      ['5', /ak-stack-spacing-5/i],
      ['5.5', /ak-stack-spacing-11\/2/],

      ['6', /ak-stack-spacing-6/i],
    ],
    async function (assert, [spacing, spacingClass]) {
      this.setProperties({
        spacing,
      });

      await render(hbs`
    <AkStack 
      @spacing={{this.spacing}}
    >
      <span class="p-2">
        Item - 1
      </span>
      <span class="p-2">
        Item - 2
      </span>
      <span class="p-2">
        Item - 3
      </span>
    </AkStack>`);

      assert.dom('[data-test-ak-stack]').exists().hasClass(spacingClass);
    }
  );

  test.each(
    'it renders all wrap variants correctly',
    [
      ['', /ak-stack-flexwrap-nowrap/i],
      ['wrap', /ak-stack-flexwrap-wrap/i],
      ['nowrap', /ak-stack-flexwrap-nowrap/i],
      ['wrap-reverse', /ak-stack-flexwrap-wrap-reverse/i],
    ],
    async function (assert, [flexWrap, spacingClass]) {
      this.setProperties({
        flexWrap,
      });

      await render(hbs`
    <AkStack 
      @flexWrap={{this.flexWrap}}
    >
      <span class="p-2">
        Item - 1
      </span>
      <span class="p-2">
        Item - 2
      </span>
      <span class="p-2">
        Item - 3
      </span>
    </AkStack>`);

      assert.dom('[data-test-ak-stack]').exists().hasClass(spacingClass);
    }
  );
});
