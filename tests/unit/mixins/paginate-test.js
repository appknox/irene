import Ember from 'ember';
import DS from 'ember-data';
import PaginateMixin from 'irene/mixins/paginate';
import { moduleFor, test } from 'ember-qunit';

moduleFor('mixin:paginate', 'Unit | Mixin | paginate', {
  subject() {
    const PaginateObject = DS.Model.extend(PaginateMixin);
    this.register('model:paginate-object', PaginateObject);
    return Ember.run(() => {
      let store = Ember.getOwner(this).lookup('service:store');
      return store.createRecord('paginate-object', {});
    });
  }
});

test('the mixin does what it should', function(assert) {
  const mixin = this.subject();

  var store = {
    query: function() {
      return [
        {
          id:1,
          type: "invitation",
          attributes: {
            name: "test"
          }
        }
      ];
    }
  };
  mixin.set('store', store);

  Ember.run(() => {

    assert.notOk(mixin.versionIncrementer());
    assert.notDeepEqual(mixin.versionTrigger(), "", "Version Trigger");
    mixin.set("meta", {total: 0});
    assert.equal(mixin.get("maxOffset"), 0, "Objects");
      assert.deepEqual(mixin.get("pages"), [], "Pages");
    mixin.set("meta", {total: 27});
    assert.equal(mixin.get("maxOffset"), 2, "Objects");
    assert.deepEqual(mixin.get("pages"), [0,1,2], "Pages");
    mixin.set("offset", 6);
    mixin.set("meta", {total: 180});
    assert.deepEqual(mixin.get("pages"), [1,2,3,4,5,6,7,8,9,10,11], "Pages");
    mixin.set("offset", 4);
    assert.deepEqual(mixin.get("pages"), [0,1,2,3,4,5,6,7,8,9,10], "Pages");
    mixin.set("offset", 7);
    mixin.set("meta", {total: 108});
    assert.deepEqual(mixin.get("pages"), [1,2,3,4,5,6,7,8,9,10,11], "Pages");

    assert.deepEqual(mixin.get("preDot"), true, "Pre Dot");
    assert.deepEqual(mixin.get("postDot"), false, "Post Dot");
    assert.deepEqual(mixin.get("hasNext"), true, "Has Next");
    assert.notOk(mixin.setOffset());

  });
});
