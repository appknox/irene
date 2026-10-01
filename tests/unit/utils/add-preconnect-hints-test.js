import { module, test } from 'qunit';

import addPreconnectHints from 'irene/utils/add-preconnect-hints';

function links() {
  return [...document.head.querySelectorAll('link[data-test-preconnect]')];
}

module('Unit | Utility | add-preconnect-hints', function (hooks) {
  hooks.beforeEach(function () {
    // The util appends real <link> elements to document.head with no way to
    // scope them - tag the ones it creates during each test so afterEach can
    // remove exactly those, leaving the document clean for later tests.
    const originalCreateElement = document.createElement.bind(document);

    this.createElementStub = (tagName) => {
      const element = originalCreateElement(tagName);

      if (tagName === 'link') {
        element.setAttribute('data-test-preconnect', '');
      }

      return element;
    };

    document.createElement = this.createElementStub;
  });

  hooks.afterEach(function () {
    document.createElement = document.createElement.bind(document);
    links().forEach((link) => link.remove());
  });

  test('adds a preconnect and dns-prefetch link for an absolute https origin', function (assert) {
    addPreconnectHints(['https://api.appknox.com']);

    const rels = links().map((link) => `${link.rel}:${link.href}`);

    assert.deepEqual(rels, [
      'preconnect:https://api.appknox.com/',
      'dns-prefetch:https://api.appknox.com/',
    ]);
  });

  test('skips falsy, empty, and relative origins', function (assert) {
    addPreconnectHints([undefined, null, '', '/']);

    assert.strictEqual(links().length, 0);
  });

  test('dedupes repeated origins', function (assert) {
    addPreconnectHints(['https://api.appknox.com', 'https://api.appknox.com']);

    assert.strictEqual(links().length, 2);
  });

  test('adds separate hints for multiple distinct origins', function (assert) {
    addPreconnectHints([
      'https://api.appknox.com',
      'https://posthog.example.com',
    ]);

    assert.strictEqual(links().length, 4);
  });
});
