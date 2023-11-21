import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Helper | store-name-for-url', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test.each(
    'it renders',
    [
      ['https://play.google.com/mfva', 't:googlePlaystoreLowercase:()'],
      ['https://apps.apple.com/mfva', 't:appleAppstoreLowercase:()'],
      ['https://unknown.domain.com/mfva', 't:storeLowercase:()'],
    ],
    async function (assert, [url, storeName]) {
      this.set('storeUrl', url);

      await render(hbs`{{store-name-for-url this.storeUrl}}`);

      assert.dom(this.element).hasText(storeName);
    }
  );
});
