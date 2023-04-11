import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-accordion', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.setProperties({
      summaryText: 'Summary Text',
      summaryIconName: 'account-box',
      accordionVariant: 'secondary',
      contentText: 'Accordion content',
    });
  });

  test('it renders correctly with a content block', async function (assert) {
    await render(hbs`
      <AkAccordion
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
    this.setProperties({
      isExpanded: false,
    });

    await render(hbs`
      <AkAccordion
        @isExpanded={{this.isExpanded}}
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
      isExpanded: false,
      onChange: (isExpanded) => {
        assert.ok(
          isExpanded,
          'onChange callback triggered with right parameters.'
        );
      },
    });

    await render(hbs`
      <AkAccordion
        @isExpanded={{this.isExpanded}}
        @summaryText={{this.summaryText}}
        @summaryIconName={{this.summaryIconName}}
        @variant={{this.accordionVariant}}
        @onChange={{this.onChange}}
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
      isExpanded: false,
      disabled: true,
      onChange: (isExpanded) => {
        assert.ok(
          isExpanded,
          'It passes the right values to the onChange callback.'
        );
      },
    });

    await render(hbs`
      <AkAccordion
        @isExpanded={{this.isExpanded}}
        @summaryText={{this.summaryText}}
        @disabled={{this.disabled}}
        @summaryIconName={{this.summaryIconName}}
        @variant={{this.accordionVariant}}
        @onChange={{this.onChange}}
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
        isExpanded: false,
        disabled,
        variant,
      });

      await render(hbs`
      <AkAccordion
        @isExpanded={{this.isExpanded}}
        @summaryText={{this.summaryText}}
        @disabled={{this.disabled}}
        @summaryIconName={{this.summaryIconName}}
        @variant={{this.variant}}
        @onChange={{this.onChange}}
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
      isExpanded: false,
      disabled: false,
    });

    await render(hbs`
      <AkAccordion
        @isExpanded={{this.isExpanded}}
        @summaryText={{this.summaryText}}
        @disabled={{this.disabled}}
        @variant={{this.accordionVariant}}
        @onChange={{this.onChange}}
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
      isExpanded: false,
      disabled: false,
      customSummaryText: 'Custom summary text',
    });

    await render(hbs`
      <AkAccordion
        @isExpanded={{this.isExpanded}}
        @summaryText={{this.summaryText}}
        @disabled={{this.disabled}}
        @variant={{this.accordionVariant}}
        @onChange={{this.onChange}}
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
      isExpanded: false,
      disabled: false,
      customSummaryText: 'Custom summary text',
      onChange: (isExpanded) => {
        assert.ok(
          isExpanded,
          'onChange callback triggered by custom summary bar with right parameters.'
        );
      },
    });

    await render(hbs`
      <AkAccordion
        @isExpanded={{this.isExpanded}}
        @disabled={{this.disabled}}
        @onChange={{this.onChange}}
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
});
