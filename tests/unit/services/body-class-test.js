import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | body-class', function (hooks) {
  setupTest(hooks);
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:body-class');
    assert.ok(service);
  });

  test('should add class', function (assert) {
    let service = this.owner.lookup('service:body-class');
    service.push({
      id: '23',
      clazzes: 'test1 test2',
    });
    assert.deepEqual(service.classes, ['test1', 'test2']);
  });

  test('should remmove class', function (assert) {
    let service = this.owner.lookup('service:body-class');
    service.push({
      id: '23',
      clazzes: 'test1 test2',
    });
    assert.deepEqual(service.classes, ['test1', 'test2']);
    service.remove('23');
    assert.deepEqual(service.classes, []);
  });

  test('should handle adding empty class', function (assert) {
    let service = this.owner.lookup('service:body-class');
    service.push({
      id: '23',
      clazzes: ' ',
    });
    assert.deepEqual(service.classes, []);
  });
});
