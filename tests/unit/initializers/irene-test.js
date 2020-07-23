import { module, test } from 'qunit';
import { run } from '@ember/runloop';
import Application from '@ember/application'

let application = null;

module('Unit | Initializer | irene', function(hooks) {
  hooks.beforeEach(function() {
    return run(function() {
      application = Application.create();
      return application.deferReadiness();
    });
  });

  test('it works', assert =>
    assert.ok(true)
  );
});
