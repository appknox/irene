import Ember from 'ember';
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

test('it works', assert =>
  assert.ok(true)
);
