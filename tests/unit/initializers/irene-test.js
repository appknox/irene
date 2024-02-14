import Application from '@ember/application';
import Resolver from 'ember-resolver';
import { module, test } from 'qunit';
import { run } from '@ember/runloop';

let application = null;

module('Unit | Initializer | irene', function (hooks) {
  hooks.beforeEach(function () {
    run(() => {
      application = Application.create({
        Resolver,
      });
      application.deferReadiness();
    });
  });

  test('it works', function (assert) {
    assert.ok(true);
  });
});
