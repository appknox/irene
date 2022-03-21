/* eslint-disable prettier/prettier, qunit/require-expect, qunit/no-assert-equal */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | personaltoken', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const personaltoken = run(() => this.owner.lookup('service:store').createRecord('personaltoken'));
    run(function() {
      const d = new Date("25 March 2015");
      personaltoken.set('created', d);
      assert.equal(personaltoken.get('createdDateOnHumanized'), d.toLocaleDateString(), "Date Created");
    });
  });
});
