import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-accordion', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.setProperties({
      id: 'accordion-id',
      summaryText: 'Summary Text',
      summaryIconName: 'account-box',
      accordionVariant: 'secondary',
      contentText: 'Accordion content',
      accordionExpanded: false,
      onChange: () => this.set('accordionExpanded', !this.accordionExpanded),
    });
  });

  test('it renders correctly with a content block', async function (assert) {
    await render(hbs`
      <AkAccordion
        @isExpanded={{this.accordionExpanded}}
        @onChange={{this.onChange}}
        @summaryText={{this.summaryText}}
        @summaryIconName={{this.summaryIconName}}
        @variant={{this.accordionVariant}}
      >
        <:content>
          <div data-test-accordion-content>
            {{this.contentText}}
          </div>
        </:content>
      </AkAccordion>
    `);

    assert.dom('[data-test-ak-accordion]').exists();
    assert.dom('[data-test-ak-accordion-summary]').exists();

    const summaryIconClassName = new RegExp(this.summaryIconName);
    assert
      .dom('[data-test-akAccordion-summaryIcon]')
      .exists()
      .hasClass(summaryIconClassName);

    assert
      .dom('[data-test-akAccordion-summaryText]')
      .exists()
      .hasText(this.summaryText);

    assert.dom('[data-test-akAccordion-dropIcon]').exists();

    assert.dom('[data-test-ak-accordion-content-wrapper]').exists();

    assert
      .dom('[data-test-accordion-content]')
      .exists()
      .hasText(this.contentText);
  });

  test('it expands and constricts accordion content on summary click', async function (assert) {
    await render(hbs`
      <AkAccordion
        @isExpanded={{this.accordionExpanded}}
        @onChange={{this.onChange}}
        @summaryText={{this.summaryText}}
        @summaryIconName={{this.summaryIconName}}
        @variant={{this.accordionVariant}}
      >
        <:content>
          <div data-test-accordion-content>
            {{this.contentText}}
          </div>
        </:content>
      </AkAccordion>
    `);

    assert
      .dom('[data-test-ak-accordion-content-wrapper]')
      .exists()
      .doesNotHaveClass('expanded');

    await click('[data-test-ak-accordion-summary]');

    assert
      .dom('[data-test-ak-accordion-content-wrapper]')
      .exists()
      .hasClass(/expanded/);

    assert
      .dom('[data-test-akAccordion-dropIcon]')
      .exists()
      .hasClass(/expanded/);
  });

  test('it triggers onChange on summary click', async function (assert) {
    assert.expect(1);

    this.setProperties({
      onChange: (id) => {
        assert.strictEqual(
          id,
          this.id,
          'onChange callback triggered with right parameters.'
        );
      },
    });

    await render(hbs`
      <AkAccordion
        @id={{this.id}}
        @isExpanded={{this.accordionExpanded}}
        @onChange={{this.onChange}}
        @summaryText={{this.summaryText}}
        @summaryIconName={{this.summaryIconName}}
        @variant={{this.accordionVariant}}
      >
        <:content>
          <div data-test-accordion-content>
            {{this.contentText}}
          </div>
        </:content>
      </AkAccordion>
    `);

    await click('[data-test-ak-accordion-summary]');
  });

  test('it prevents onChange trigger on summary click and hides accordion content if disabled', async function (assert) {
    assert.expect(4);

    this.setProperties({
      disabled: true,
      onChange: () => {},
    });

    await render(hbs`
      <AkAccordion
        @id={{this.id}}
        @isExpanded={{this.accordionExpanded}}
        @onChange={{this.onChange}}
        @summaryText={{this.summaryText}}
        @disabled={{this.disabled}}
        @summaryIconName={{this.summaryIconName}}
        @variant={{this.accordionVariant}}
      >
        <:content>
          <div data-test-accordion-content>
            {{this.contentText}}
          </div>
        </:content>
      </AkAccordion>
    `);

    assert.dom('[data-test-ak-accordion-content-wrapper]').doesNotExist();
    assert.dom('data-test-accordion-content').doesNotExist();

    await click('[data-test-ak-accordion-summary]');

    assert
      .dom('[data-test-akAccordion-dropIcon]')
      .exists()
      .doesNotHaveClass(/expanded/);
  });

  test.each(
    'it renders accordion variants and their respective colors when enabled or disabled',
    [
      [
        'primary',
        /ak-typography-color-primary/i,
        /ak-icon-color-primary/i,
        false,
      ],
      [
        'secondary',
        /ak-typography-color-textPrimary/i,
        /ak-icon-color-textPrimary/i,
        false,
      ],
      [
        'primary',
        /ak-typography-color-textSecondary/i,
        /ak-icon-color-textSecondary/i,
        true,
      ],
      [
        'secondary',
        /ak-typography-color-textSecondary/i,
        /ak-icon-color-textSecondary/i,
        true,
      ],
    ],
    async function (
      assert,
      [variant, summaryTextColorClass, summaryIconColorClass, disabled]
    ) {
      this.setProperties({
        disabled,
        variant,
      });

      await render(hbs`
      <AkAccordion
        @id={{this.id}}
        @isExpanded={{this.accordionExpanded}}
        @onChange={{this.onChange}}
        @summaryText={{this.summaryText}}
        @disabled={{this.disabled}}
        @summaryIconName={{this.summaryIconName}}
        @variant={{this.variant}}
    
      >
        <:content>
          <div data-test-accordion-content>
            {{this.contentText}}
          </div>
        </:content>
      </AkAccordion>
    `);

      assert
        .dom('[data-test-akAccordion-summaryText]')
        .exists()
        .hasClass(summaryTextColorClass);

      assert
        .dom('[data-test-akAccordion-summaryIcon]')
        .exists()
        .hasClass(summaryIconColorClass);
    }
  );

  test('it renders "summaryIcon" block as summary icon if provided', async function (assert) {
    this.setProperties({
      disabled: false,
    });

    await render(hbs`
      <AkAccordion
        @id={{this.id}}
        @isExpanded={{this.accordionExpanded}}
        @onChange={{this.onChange}}
        @summaryText={{this.summaryText}}
        @disabled={{this.disabled}}
        @variant={{this.accordionVariant}}
      >

        <:summaryIcon>
          <AkIcon
            @iconName='people'
            @color="success"
            data-test-accordion-custom-icon
          />
        </:summaryIcon>

        <:content>
          <div data-test-accordion-content>
            {{this.contentText}}
          </div>
        </:content>
      </AkAccordion>
    `);

    assert.dom('[data-test-accordion-custom-icon]').exists();
    assert.dom('[data-test-akAccordion-summaryIcon]').doesNotExist();
  });

  test('it renders "summaryText" block as summary text if provided', async function (assert) {
    this.setProperties({
      disabled: false,
      customSummaryText: 'Custom summary text',
    });

    await render(hbs`
      <AkAccordion
        @id={{this.id}}
        @isExpanded={{this.accordionExpanded}}
        @onChange={{this.onChange}}
        @summaryText={{this.summaryText}}
        @disabled={{this.disabled}}
        @variant={{this.accordionVariant}}
      >

        <:summaryText>
          <AkTypography data-test-custom-summary-text>
            {{this.customSummaryText}}
          </AkTypography>
        </:summaryText>

        <:content>
          <div data-test-accordion-content>
            {{this.contentText}}
          </div>
        </:content>
      </AkAccordion>
    `);

    assert
      .dom('[data-test-custom-summary-text]')
      .exists()
      .hasText(this.customSummaryText);

    assert.dom('[data-test-akAccordion-summaryText]').doesNotExist();
  });

  test('it replaces summary bar with custom summary bar if "summary" block is provided', async function (assert) {
    assert.expect(7);

    this.setProperties({
      disabled: false,
      customSummaryText: 'Custom summary text',
      onChange: (id) => {
        assert.strictEqual(
          id,
          this.id,
          'onChange callback triggered with right parameters.'
        );
      },
    });

    await render(hbs`
      <AkAccordion
        @id={{this.id}}
        @isExpanded={{this.accordionExpanded}}
        @onChange={{this.onChange}}
        @disabled={{this.disabled}}
      >
        <:summary as |acs|>
          <AkStack {{on 'click' acs.onSummaryClick}} data-test-custom-summary-bar>
            <AkTypography @color="success" data-test-custom-summaryBar-text>
              {{this.customSummaryText}}
            </AkTypography>

            <AkIcon
              @iconName='arrow-drop-{{if acs.isExpanded "up" "down"}}'
              @color="success"
              data-test-custom-summaryBar-icon
            />
          </AkStack>
        </:summary>

        <:content>
          <div data-test-accordion-content>
            {{this.contentText}}
          </div>
        </:content>
      </AkAccordion>
    `);

    assert.dom('[data-test-ak-accordion-summary]').doesNotExist();

    assert.dom('[data-test-custom-summary-bar]').exists();

    assert
      .dom('[data-test-custom-summaryBar-text]')
      .exists()
      .hasText(this.customSummaryText);

    assert
      .dom('[data-test-custom-summaryBar-icon]')
      .exists()
      .hasClass(/ak-icon-color-success/i);

    await click('[data-test-custom-summary-bar]');
  });

  test('it mounts content only on first expand if mountContentOnExpand is true', async function (assert) {
    this.setProperties({
      accordionExpanded: false,
      customSummaryText: 'Custom summary text',
      mountContentOnExpand: true,
    });

    await render(hbs`
      <AkAccordion
        @id={{this.id}}
        @isExpanded={{this.accordionExpanded}}
        @onChange={{this.onChange}}
        @summaryText={{this.summaryText}}
        @disabled={{this.disabled}}
        @variant={{this.accordionVariant}}
        @mountContentOnExpand={{this.mountContentOnExpand}}
      >
        <:content>
          <div data-test-accordion-content>
            {{this.contentText}}
          </div>
        </:content>
      </AkAccordion>
    `);

    assert.dom('[data-test-accordion-content]').doesNotExist();

    await click('[data-test-ak-accordion-summary]');

    assert.dom('[data-test-accordion-content]').exists();

    // Collpses the accordion
    await click('[data-test-ak-accordion-summary]');

    assert.dom('[data-test-accordion-content]').exists();
  });

  test('it unmounts content on collapse if unmountContentOnCollapse is true', async function (assert) {
    this.setProperties({
      accordionExpanded: true,
      customSummaryText: 'Custom summary text',
      unmountContentOnCollapse: true,
    });

    await render(hbs`
      <AkAccordion
        @id={{this.id}}
        @isExpanded={{this.accordionExpanded}}
        @onChange={{this.onChange}}
        @summaryText={{this.summaryText}}
        @disabled={{this.disabled}}
        @variant={{this.accordionVariant}}
        @unmountContentOnCollapse={{this.unmountContentOnCollapse}}
      >
        <:content>
          <div data-test-accordion-content>
            {{this.contentText}}
          </div>
        </:content>
      </AkAccordion>
    `);

    assert.dom('[data-test-accordion-content]').exists();

    await click('[data-test-ak-accordion-summary]');

    assert.dom('[data-test-accordion-content]').doesNotExist();

    await click('[data-test-ak-accordion-summary]');

    assert.dom('[data-test-accordion-content]').exists();

    await click('[data-test-ak-accordion-summary]');

    assert.dom('[data-test-accordion-content]').doesNotExist();
  });

  test.each(
    'it renders accordion groups',
    [true, false],
    async function (assert, openMultiple) {
      this.setProperties({
        openMultiple,
        accordionList: [
          {
            id: 'accordion-secondary',
            summaryText: 'Secondary Variant - Summary Text',
            accordionVariant: 'secondary',
            content: 'This is secondary accordion content',
          },
          {
            id: 'accordion-primary',
            summaryText: 'Primary Variant - Summary Text',
            accordionVariant: 'primary',
            content: 'This is primary accordion content',
          },
        ],
      });

      await render(hbs`
      <AkAccordion::Group @openMultiple={{this.openMultiple}} @defaultOpen={{array "accordion-open"}} as |actx|>
        {{#each this.accordionList as |accordion|}}
          <AkAccordion
            @id={{accordion.id}}
            @accordionCtx={{actx}}
            @summaryText={{accordion.summaryText}}
            @disabled={{accordion.disabled}}
            @variant={{accordion.accordionVariant}}
            data-test-accordion-group
            data-test-accordion-groupItem='{{accordion.id}}'
          >
            <:content>
              <div data-test-group-content>
                {{accordion.content}}
              </div>
            </:content>
          </AkAccordion>
        {{/each}}
      </AkAccordion::Group>
    `);

      const allAccordions = findAll('[data-test-accordion-group]');

      assert.strictEqual(
        allAccordions.length,
        this.accordionList.length,
        'Renders the correct number of accordions'
      );

      // Sanity check for accordion items
      for (let idx = 0; idx < allAccordions.length; idx++) {
        const accGroup = allAccordions[idx];
        const accordionProps = this.accordionList[idx];

        assert.dom(accGroup).exists();

        assert
          .dom('[data-test-akAccordion-summaryText]', accGroup)
          .exists()
          .hasText(accordionProps.summaryText);

        await click(
          `[data-test-accordion-groupItem='${accordionProps.id}'] [data-test-ak-accordion-summary]`
        );

        assert
          .dom('[data-test-group-content]', accGroup)
          .exists()
          .containsText(accordionProps.content);

        // Closes the accordion for further tests
        await click(
          `[data-test-accordion-groupItem='${accordionProps.id}'] [data-test-ak-accordion-summary]`
        );
      }

      // Clicking on any accordion summary should not affect the state of other sibling accordions
      const firstAccItem = this.accordionList[0];
      const firstAccItemSelector = `[data-test-accordion-groupItem='${firstAccItem.id}']`;

      const secondAccItem = this.accordionList[1];
      const secondAccItemSelector = `[data-test-accordion-groupItem='${secondAccItem.id}']`;

      // Checks if both accordions are in a closed state
      assert
        .dom(`${firstAccItemSelector} [data-test-ak-accordion-content-wrapper]`)
        .exists()
        .hasClass(/collapsed/);

      assert
        .dom(
          `${secondAccItemSelector} [data-test-ak-accordion-content-wrapper]`
        )
        .exists()
        .hasClass(/collapsed/);

      // Test cases for groups where multiple accordions can be opened at the same time
      if (openMultiple) {
        // Open both accordions
        await click(`${firstAccItemSelector} [data-test-ak-accordion-summary]`);
        await click(
          `${secondAccItemSelector} [data-test-ak-accordion-summary]`
        );

        assert
          .dom(
            `${firstAccItemSelector} [data-test-ak-accordion-content-wrapper]`
          )
          .exists()
          .hasClass(/expanded/);

        assert
          .dom(
            `${secondAccItemSelector} [data-test-ak-accordion-content-wrapper]`
          )
          .exists()
          .hasClass(/expanded/);

        // Close second accordion
        await click(
          `${secondAccItemSelector} [data-test-ak-accordion-summary]`
        );

        // Second accordion is closed
        assert
          .dom(
            `${secondAccItemSelector} [data-test-ak-accordion-content-wrapper]`
          )
          .exists()
          .hasClass(/collapsed/);

        // First accordion is still open
        assert
          .dom(
            `${firstAccItemSelector} [data-test-ak-accordion-content-wrapper]`
          )
          .exists()
          .hasClass(/expanded/);
      }

      if (!openMultiple) {
        // Open first accordion
        await click(`${firstAccItemSelector} [data-test-ak-accordion-summary]`);

        assert
          .dom(
            `${firstAccItemSelector} [data-test-ak-accordion-content-wrapper]`
          )
          .exists()
          .hasClass(/expanded/);

        assert
          .dom(
            `${secondAccItemSelector} [data-test-ak-accordion-content-wrapper]`
          )
          .exists()
          .hasClass(/collapsed/);

        // Open second accordion
        await click(
          `${secondAccItemSelector} [data-test-ak-accordion-summary]`
        );

        // Second accordion is open
        assert
          .dom(
            `${secondAccItemSelector} [data-test-ak-accordion-content-wrapper]`
          )
          .exists()
          .hasClass(/expanded/);

        // First accordion should be closed
        assert
          .dom(
            `${firstAccItemSelector} [data-test-ak-accordion-content-wrapper]`
          )
          .exists()
          .hasClass(/collapsed/);
      }
    }
  );
});
