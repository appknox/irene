import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

const ATTRIBUTE = 'data-offsec-theme';

// A window with just what the theme service touches: storage, a system-theme query and a root element
function buildWindowStub({ stored = null, systemIsDark = false } = {}) {
  const listeners = new Set();
  const storage = new Map(stored ? [['offsecTheme', stored]] : []);

  const mediaQuery = {
    matches: systemIsDark,
    addEventListener: (_event, listener) => listeners.add(listener),
    removeEventListener: (_event, listener) => listeners.delete(listener),
  };

  return class WindowStub extends Service {
    document = { documentElement: document.createElement('html') };

    localStorage = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    };

    matchMedia = () => mediaQuery;

    // helpers for the tests
    static storage = storage;
    static changeSystemTheme(isDark) {
      mediaQuery.matches = isDark;
      listeners.forEach((listener) => listener({ matches: isDark }));
    }
  };
}

module('Unit | Service | offsec-theme', function (hooks) {
  setupTest(hooks);

  function setup(context, options) {
    const WindowStub = buildWindowStub(options);

    context.owner.register('service:browser/window', WindowStub);

    const service = context.owner.lookup('service:offsec-theme');
    const root = context.owner.lookup('service:browser/window').document
      .documentElement;

    return { service, root, WindowStub };
  }

  test('with no stored choice it follows the system setting', function (assert) {
    const { service, root } = setup(this, { systemIsDark: true });

    assert.strictEqual(service.preference, 'system');

    service.activate();

    assert.true(service.isDark);
    assert.strictEqual(root.getAttribute(ATTRIBUTE), 'dark');
  });

  test('it stays light when the system is light and nothing is stored', function (assert) {
    const { service, root } = setup(this, { systemIsDark: false });

    service.activate();

    assert.false(service.isDark);
    assert.false(root.hasAttribute(ATTRIBUTE));
  });

  test('a stored choice wins over the system setting', function (assert) {
    const { service, root } = setup(this, {
      stored: 'light',
      systemIsDark: true,
    });

    service.activate();

    assert.strictEqual(service.preference, 'light');
    assert.false(service.isDark);
    assert.false(root.hasAttribute(ATTRIBUTE));
  });

  test('toggle flips the shown theme and remembers it', function (assert) {
    const { service, root, WindowStub } = setup(this, { systemIsDark: true });

    service.activate();
    service.toggle();

    assert.false(service.isDark, 'dark system, so the first toggle goes light');
    assert.strictEqual(WindowStub.storage.get('offsecTheme'), 'light');
    assert.false(root.hasAttribute(ATTRIBUTE));

    service.toggle();

    assert.true(service.isDark);
    assert.strictEqual(WindowStub.storage.get('offsecTheme'), 'dark');
    assert.strictEqual(root.getAttribute(ATTRIBUTE), 'dark');
  });

  test('it follows the system setting live until the user chooses', function (assert) {
    const { service, root, WindowStub } = setup(this, { systemIsDark: false });

    service.activate();
    WindowStub.changeSystemTheme(true);

    assert.true(service.isDark);
    assert.strictEqual(root.getAttribute(ATTRIBUTE), 'dark');

    service.toggle();
    WindowStub.changeSystemTheme(false);
    WindowStub.changeSystemTheme(true);

    assert.false(service.isDark, 'the explicit light choice is not overridden');
  });

  test('deactivate removes the theme so other products stay light', function (assert) {
    const { service, root } = setup(this, { stored: 'dark' });

    service.activate();

    assert.strictEqual(root.getAttribute(ATTRIBUTE), 'dark');

    service.deactivate();

    assert.false(root.hasAttribute(ATTRIBUTE));

    service.toggle();

    assert.false(
      root.hasAttribute(ATTRIBUTE),
      'an inactive service never touches the page'
    );
  });
});
