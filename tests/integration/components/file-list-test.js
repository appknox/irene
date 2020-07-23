import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Integration | Component | file list', function(hooks) {
  setupTest(hooks);

  test('tapping button fires an external action', function(assert) {
    assert.expect(2);
    var component = this.owner.factoryFor('component:file-list').create();
    component.set("project", {id:1});
    assert.deepEqual(component.get('extraQueryStrings'),'{"projectId":1}', "Extra Query Strings");
    assert.equal(component.newFilesObserver(), 1 , "Extra Query Strings");
  });
});
