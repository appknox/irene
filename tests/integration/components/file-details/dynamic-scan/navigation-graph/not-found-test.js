import { find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

const TEMPLATE = hbs`
  <FileDetails::DynamicScan::NavigationGraph::NotFound
    @title={{this.title}}
    @description={{this.description}}
    @buttonText={{this.buttonText}}
    @buttonRoute={{this.buttonRoute}}
    @buttonModel={{this.buttonModel}}
    @showBreadcrumbs={{this.showBreadcrumbs}}
    data-test-notFound-custom
  />
`;

const SEL = {
  root: '[data-test-fileDetails-dynamicScan-navigationGraph-notFound]',
  illustration:
    '[data-test-fileDetails-dynamicScan-navigationGraph-notFoundIllustration]',
  title: '[data-test-fileDetails-dynamicScan-navigationGraph-notFoundTitle]',
  description:
    '[data-test-fileDetails-dynamicScan-navigationGraph-notFoundDescription]',
  actionLink:
    '[data-test-fileDetails-dynamicScan-navigationGraph-notFoundActionLink]',
  actionBtn:
    '[data-test-fileDetails-dynamicScan-navigationGraph-notFoundActionBtn]',
  breadcrumbs:
    '[data-test-fileDetails-dynamicScan-navigationGraph-notFound-breadcrumbs]',
};

module(
  'Integration | Component | file-details/dynamic-scan/navigation-graph/not-found',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({
        title: 'Navigation Graph Not Found',
        description: 'We could not find a navigation graph for this scan.',
        buttonText: 'Go to Home',
        // `authenticated.home` is a real, segment-less route, so AkLink/LinkTo
        // can build an href without a dynamic-segment model.
        buttonRoute: 'authenticated.home',
        buttonModel: undefined,
        showBreadcrumbs: false,
      });
    });

    // ─── Content ──────────────────────────────────────────────────────────────

    test('renders the title, description and action button', async function (assert) {
      await render(TEMPLATE);

      assert.dom(SEL.root).exists();
      assert.dom(SEL.title).hasText(this.title);
      assert.dom(SEL.description).hasText(this.description);
      assert.dom(SEL.actionBtn).hasText(this.buttonText);
    });

    test('renders the no-data illustration', async function (assert) {
      await render(TEMPLATE);

      assert.dom(SEL.illustration).exists();
    });

    test('wraps the action button in a link', async function (assert) {
      await render(TEMPLATE);

      assert.dom(SEL.actionLink).exists();

      assert
        .dom(SEL.actionBtn, find(SEL.actionLink))
        .exists('the button is rendered inside the link');
    });

    test('points the action link at the given route and model', async function (assert) {
      // A route with a dynamic segment so the model is reflected in the href.
      this.setProperties({
        buttonRoute: 'authenticated.dashboard.file',
        buttonModel: '42',
      });

      await render(TEMPLATE);

      assert.dom(SEL.actionLink).hasAttribute('href', /\/file\/42$/);
    });

    test('forwards splattributes to the root element', async function (assert) {
      await render(TEMPLATE);

      assert.dom(SEL.root).hasAttribute('data-test-notFound-custom');
    });

    // ─── Breadcrumbs ──────────────────────────────────────────────────────────

    test('hides the breadcrumbs by default', async function (assert) {
      await render(TEMPLATE);

      assert.dom(SEL.breadcrumbs).doesNotExist();
    });

    test('shows the breadcrumbs when enabled', async function (assert) {
      this.set('showBreadcrumbs', true);

      await render(TEMPLATE);

      assert.dom(SEL.breadcrumbs).exists();
    });
  }
);
