import {
  clearRender,
  click,
  find,
  render,
  settled,
  triggerEvent,
} from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

// 1x1 transparent PNG — a real, decodable image so the <img> behaves normally.
const SCREENSHOT_SRC =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

function makeNode(overrides = {}) {
  return {
    id: 'node-1',
    label: 'Login',
    variant_id: 'variant-1',
    title: 'Login Screen',
    visit_count: 3,
    execution_order: 1,
    screenshot_path: SCREENSHOT_SRC,
    ...overrides,
  };
}

const TEMPLATE = hbs`
  <FileDetails::DynamicScan::NavigationGraph::ScreenshotDrawer
    @node={{this.node}}
    @hasPreviousNode={{this.hasPreviousNode}}
    @hasNextNode={{this.hasNextNode}}
    @onClose={{this.onClose}}
    @onPrevious={{this.onPrevious}}
    @onNext={{this.onNext}}
    @onContentInsert={{this.onContentInsert}}
    @onContentDestroy={{this.onContentDestroy}}
  />
`;

const SEL = {
  title: '[data-test-fileDetails-dynamicScan-navigationGraph-drawerTitle]',
  close: '[data-test-fileDetails-dynamicScan-navigationGraph-drawerClose]',
  image: '[data-test-fileDetails-dynamicScan-navigationGraph-drawerImage]',
  prev: '[data-test-fileDetails-dynamicScan-navigationGraph-drawerPrev]',
  next: '[data-test-fileDetails-dynamicScan-navigationGraph-drawerNext]',

  fallback:
    '[data-test-fileDetails-dynamicScan-navigationGraph-drawerImageFallback]',

  noScreenshot:
    '[data-test-fileDetails-dynamicScan-navigationGraph-drawerNoScreenshot]',
};

module(
  'Integration | Component | file-details/dynamic-scan/navigation-graph/screenshot-drawer',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({
        node: makeNode(),
        hasPreviousNode: true,
        hasNextNode: true,
        closeCount: 0,
        prevCount: 0,
        nextCount: 0,
        destroyCount: 0,
        insertedEl: null,
        onClose: () => (this.closeCount += 1),
        onPrevious: () => (this.prevCount += 1),
        onNext: () => (this.nextCount += 1),
        onContentInsert: (element) => (this.insertedEl = element),
        onContentDestroy: () => (this.destroyCount += 1),
      });
    });

    // ─── Title ────────────────────────────────────────────────────────────────

    test('renders the node title as the drawer title', async function (assert) {
      await render(TEMPLATE);

      assert.dom(SEL.title).hasText(this.node.title);
    });

    test('falls back to variant_id when the title is empty', async function (assert) {
      this.set('node', makeNode({ title: '' }));

      await render(TEMPLATE);

      assert.dom(SEL.title).hasText(this.node.variant_id);
    });

    // ─── Screenshot states ──────────────────────────────────────────────────────

    test('wires the screenshot image src and alt', async function (assert) {
      await render(TEMPLATE);

      assert.dom(SEL.image).exists();
      assert.dom(SEL.image).hasAttribute('src', SCREENSHOT_SRC);

      const altText = t('navigationGraph.screenshotOf', {
        title: this.node.title,
      });

      assert.dom(SEL.image).hasAttribute('alt', altText);
    });

    test('shows the image once it loads', async function (assert) {
      await render(TEMPLATE);
      await triggerEvent(SEL.image, 'load');

      assert.dom(SEL.image).isVisible('image shown after load');
      assert.dom(SEL.fallback).doesNotExist('no fallback on success');
    });

    test('shows the fallback when the image fails to load', async function (assert) {
      await render(TEMPLATE);

      // A non-bubbling `error` event so it doesn't reach window.onerror (which
      // would be reported as a global failure); the img's own listener fires.
      find(SEL.image).dispatchEvent(new Event('error'));
      await settled();

      assert.dom(SEL.fallback).exists('fallback shown on error');
      assert.dom(SEL.image).doesNotExist('image removed on error');
    });

    test('shows the no-screenshot placeholder when the node has no screenshot', async function (assert) {
      this.set('node', makeNode({ screenshot_path: '' }));

      await render(TEMPLATE);

      assert.dom(SEL.image).doesNotExist();
      assert.dom(SEL.fallback).doesNotExist();
      assert.dom(SEL.noScreenshot).hasText(t('navigationGraph.noScreenshot'));
    });

    // ─── State resets on node switch ────────────────────────────────────────────

    test('shows the loader again after switching to a different node', async function (assert) {
      await render(TEMPLATE);
      await triggerEvent(SEL.image, 'load');

      assert.dom(SEL.image).isVisible('image shown for the first node');

      this.set('node', makeNode({ id: 'node-2', title: 'Home' }));
      await settled();

      assert
        .dom(SEL.image)
        .isNotVisible('loader returns (image hidden) for the new node');
    });

    test('clears the fallback after switching to a different node', async function (assert) {
      await render(TEMPLATE);

      // Non-bubbling `error` so it doesn't reach window.onerror.
      find(SEL.image).dispatchEvent(new Event('error'));
      await settled();

      assert.dom(SEL.fallback).exists('fallback shown for the first node');

      this.set('node', makeNode({ id: 'node-2', title: 'Home' }));
      await settled();

      assert
        .dom(SEL.fallback)
        .doesNotExist('fallback cleared for the new node');

      assert.dom(SEL.image).exists('image rendered again for the new node');
    });

    // ─── Prev / Next ────────────────────────────────────────────────────────────

    test('disables prev and next when navigation is unavailable', async function (assert) {
      this.setProperties({ hasPreviousNode: false, hasNextNode: false });

      await render(TEMPLATE);

      assert.dom(SEL.prev).isDisabled();
      assert.dom(SEL.next).isDisabled();
    });

    test('enables prev and next when navigation is available', async function (assert) {
      await render(TEMPLATE);

      assert.dom(SEL.prev).isNotDisabled();
      assert.dom(SEL.next).isNotDisabled();
    });

    test('invokes onPrevious when prev is clicked', async function (assert) {
      await render(TEMPLATE);
      await click(SEL.prev);

      assert.strictEqual(this.prevCount, 1);
    });

    test('invokes onNext when next is clicked', async function (assert) {
      await render(TEMPLATE);
      await click(SEL.next);

      assert.strictEqual(this.nextCount, 1);
    });

    // ─── Close ──────────────────────────────────────────────────────────────────

    test('invokes onClose when the close button is clicked', async function (assert) {
      await render(TEMPLATE);
      await click(SEL.close);

      assert.strictEqual(this.closeCount, 1);
    });

    // ─── Content lifecycle hooks ────────────────────────────────────────────────

    test('calls onContentInsert with the content element on render', async function (assert) {
      await render(TEMPLATE);

      assert.true(
        this.insertedEl instanceof HTMLElement,
        'received the content element'
      );
    });

    test('calls onContentDestroy when torn down', async function (assert) {
      await render(TEMPLATE);
      await clearRender();

      assert.strictEqual(this.destroyCount, 1);
    });
  }
);
