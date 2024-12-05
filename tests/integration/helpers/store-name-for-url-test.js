import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';

module('Integration | Helper | store-name-for-url', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');

  test.each(
    'it renders',
    [
      ['https://play.google.com/mfva', 'googlePlayStore'],
      ['https://apps.apple.com/mfva', 'appleAppStore'],
      ['https://unknown.domain.com/mfva', 'storeLowercase'],
    ],
    async function (assert, [url, storeNameKey]) {
      const storeName = t(storeNameKey);

      this.set('storeUrl', url);

      await render(hbs`{{store-name-for-url this.storeUrl}}`);

      assert.dom(this.element).hasText(storeName);
    }
  );
});
