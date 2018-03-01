import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('file-list', 'Integration | Component | file list', {
  unit: true
});

test('tapping button fires an external action', function(assert) {
  assert.expect(2);
  var component = this.subject();
  component.set("project", {id:1});
  assert.deepEqual(component.get('extraQueryStrings'),'{\"projectId\":1}', "Extra Query Strings");
  assert.equal(component.newFilesObserver(), 1 , "Extra Query Strings");
});
