import { moduleForModel, test } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForModel('personaltoken', 'Unit | Model | personaltoken', {
  needs: []
});

test('it exists', function(assert) {
  const personaltoken = this.subject();
  run(function() {
    const d = new Date("25 March 2015");
    personaltoken.set('created', d);
    assert.equal(personaltoken.get('createdDateOnHumanized'), d.toLocaleDateString(), "Date Created");
  });
});
