import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Integration | Component | sbom/component-insights/pager',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.selected = [];
      this.onChange = (index) => this.selected.push(index);
    });

    test('it renders a zero-padded position', async function (assert) {
      await render(hbs`
        <Sbom::ComponentInsights::Pager @index={{1}} @total={{3}} @onChange={{this.onChange}} />
      `);

      assert
        .dom('[data-test-sbomComponentInsights-pager-current]')
        .hasText('02');

      assert
        .dom('[data-test-sbomComponentInsights-pager-announcement]')
        .hasText(
          t('sbomModule.componentInsights.pagerPosition', {
            current: '02',
            total: '03',
          })
        );

      assert
        .dom('[data-test-sbomComponentInsights-pager-total]')
        .hasText(t('sbomModule.componentInsights.ofTotal', { total: '03' }));

      assert
        .dom('[data-test-sbomComponentInsights-pager-prev]')
        .hasAttribute(
          'aria-label',
          t('sbomModule.componentInsights.previousVulnerability')
        );
    });

    test('it steps and disables at both ends', async function (assert) {
      this.index = 0;

      await render(hbs`
        <Sbom::ComponentInsights::Pager @index={{this.index}} @total={{3}} @onChange={{this.onChange}} />
      `);

      assert
        .dom('[data-test-sbomComponentInsights-pager-prev]')
        .hasAttribute('aria-disabled', 'true');
      assert
        .dom('[data-test-sbomComponentInsights-pager-next]')
        .doesNotHaveAttribute('aria-disabled');

      await click('[data-test-sbomComponentInsights-pager-next]');

      assert.deepEqual(this.selected, [1]);

      this.set('index', 2);

      assert
        .dom('[data-test-sbomComponentInsights-pager-next]')
        .hasAttribute('aria-disabled', 'true');
      assert
        .dom('[data-test-sbomComponentInsights-pager-prev]')
        .doesNotHaveAttribute('aria-disabled');

      await click('[data-test-sbomComponentInsights-pager-next]');

      assert.deepEqual(this.selected, [1], 'a disabled end does not step');

      await click('[data-test-sbomComponentInsights-pager-prev]');

      assert.deepEqual(this.selected, [1, 1]);
    });
  }
);
