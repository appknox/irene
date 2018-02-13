/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import { initialize } from 'irene/initializers/irene';
import { module, test } from 'qunit';

let application = null;
let registry = null;

module('Unit | Initializer | irene', {
  beforeEach() {
    return Ember.run(function() {
      application = Ember.Application.create();
      ({ registry } = application);
      return application.deferReadiness();
    });
  }
}
);

// Replace this with your real tests.
test('it works', assert =>
  // initialize registry, application

  // you would normally confirm the results of the initializer here
  assert.ok(true)
);
