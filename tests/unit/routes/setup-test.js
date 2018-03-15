import { moduleFor, test } from 'ember-qunit';

moduleFor('route:setup', 'Unit | Route | setup', {
});

test('it exists', function(assert) {
  const route = this.subject();
  assert.equal(route.model("test"), "test" , "Route");
});
