import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

const SEL = {
  container: '[data-test-NovncRfb-canvasContainer]',
  canvas: '[data-test-NovncRfb-canvasContainer] canvas',
};

const TEMPLATE = hbs`
  <NovncRfb
    @deviceFarmURL={{this.deviceFarmURL}}
    @allowInteraction={{this.allowInteraction}}
    @containCanvas={{this.containCanvas}}
  />
`;

module('Integration | Component | novnc-rfb', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.setProperties({
      deviceFarmURL: null,
      allowInteraction: false,
      containCanvas: false,
    });
  });

  test('renders the canvas container', async function (assert) {
    await render(TEMPLATE);

    assert.dom(SEL.container).exists();
  });

  test('reflects @containCanvas on data-contain-canvas', async function (assert) {
    this.set('containCanvas', true);

    await render(TEMPLATE);

    assert.dom(SEL.container).hasAttribute('data-contain-canvas', 'true');

    this.set('containCanvas', false);
    await settled();

    assert.dom(SEL.container).hasAttribute('data-contain-canvas', 'false');
  });

  test.each(
    'toggles the no-interaction class with @allowInteraction',
    [
      { allowInteraction: false, hasNoInteraction: true },
      { allowInteraction: true, hasNoInteraction: false },
    ],
    async function (assert, { allowInteraction, hasNoInteraction }) {
      this.set('allowInteraction', allowInteraction);

      await render(TEMPLATE);

      if (hasNoInteraction) {
        assert.dom(SEL.container).hasClass(/no-interaction/);
      } else {
        assert.dom(SEL.container).doesNotHaveClass(/no-interaction/);
      }
    }
  );

  test('does not connect when @deviceFarmURL is null', async function (assert) {
    await render(TEMPLATE);

    assert.dom(SEL.canvas).doesNotExist();
  });
});
