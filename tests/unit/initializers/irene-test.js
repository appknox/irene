import Application from '@ember/application';
import Resolver from 'ember-resolver';
import { module, test } from 'qunit';

let application = null;

module('Unit | Initializer | irene', function (hooks) {
  hooks.beforeEach(function () {
    application = Application.create({
      Resolver,
    });

    application.deferReadiness();
  });

  test('it works', function (assert) {
    assert.ok(true);
  });
});
