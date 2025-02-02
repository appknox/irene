/* eslint-disable prettier/prettier, qunit/no-early-return */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { run } from '@ember/runloop';

module('Unit | Model | attachment', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = run(() => this.owner.lookup('service:store').createRecord('attachment'));
    return assert.ok(!!model);
  });
});
