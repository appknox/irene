import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('personaltoken', 'Unit | Model | personaltoken', {
  needs: []
});

test('it exists', function(assert) {
  const personaltoken = this.subject();
  Ember.run(function() {
    const d = new Date("25 March 2015");
    personaltoken.set('created', d);
    assert.equal(personaltoken.get('createdDateOnHumanized'), d.toLocaleDateString(), "Date Created");
  });
});
