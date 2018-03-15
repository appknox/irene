import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('personaltoken', 'Unit | Model | personaltoken', {
  needs: []
});

test('it exists', function(assert) {
  const personaltoken = this.subject();
  Ember.run(function() {
    personaltoken.set('created', new Date("25 March 2015"));
    assert.equal(personaltoken.get('createdDateOnHumanized'), "March 25, 2015", "Date Created");
  });
});
