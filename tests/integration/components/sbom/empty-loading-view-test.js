import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

const CONTAINER = '[class*="empty-loading-container"]';

module('Integration | Component | sbom/empty-loading-view', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');

  // Asserted via computed style rather than class names: AkStack emits its own
  // alignment classes at the same specificity as this component's stylesheet,
  // so only the resolved value proves which one actually won.
  test('it centres the empty state even when skeleton loading is enabled', async function (assert) {
    await render(hbs`
      <Sbom::EmptyLoadingView
        @empty={{true}}
        @loading={{false}}
        @skeleton={{true}}
        @emptyText='Nothing here'
      />
    `);

    const styles = window.getComputedStyle(find(CONTAINER));

    assert.strictEqual(styles.justifyContent, 'center');
    assert.strictEqual(styles.alignItems, 'center');
  });

  test('it top-aligns the skeleton table while loading', async function (assert) {
    this.setProperties({
      columns: [{ name: 'Component Name', width: 150 }, { name: 'Purpose' }],
    });

    await render(hbs`
      <Sbom::EmptyLoadingView
        @empty={{false}}
        @loading={{true}}
        @skeleton={{true}}
        @skeletonColumns={{this.columns}}
      />
    `);

    const styles = window.getComputedStyle(find(CONTAINER));

    assert.strictEqual(styles.justifyContent, 'flex-start');
    assert.strictEqual(styles.alignItems, 'flex-start');
    assert.dom('[data-test-component-list-skeleton-loader]').exists();
  });

  test('it centres the non-skeleton loading state', async function (assert) {
    await render(hbs`
      <Sbom::EmptyLoadingView @empty={{false}} @loading={{true}} />
    `);

    const styles = window.getComputedStyle(find(CONTAINER));

    assert.strictEqual(styles.justifyContent, 'center');
    assert.strictEqual(styles.alignItems, 'center');
    assert.dom('[data-test-sbom-loader]').exists();
  });

  test('it yields its default block when neither empty nor loading', async function (assert) {
    await render(hbs`
      <Sbom::EmptyLoadingView @empty={{false}} @loading={{false}}>
        <span data-test-real-content>content</span>
      </Sbom::EmptyLoadingView>
    `);

    assert.dom('[data-test-real-content]').exists();
    assert.dom(CONTAINER).doesNotExist();
  });
});
