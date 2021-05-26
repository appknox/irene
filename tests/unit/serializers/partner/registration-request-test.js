import {
  module,
  test
} from 'qunit';
import {
  setupTest
} from 'ember-qunit';

module('Unit | Serializer | partner registration request', function (hooks) {
  setupTest(hooks);

  test('it serializes all valid inputs', function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('partner/registration-request', {
      email: 'bot@appknox.com',
      data: {
        first_name: "bot",
        last_name: "appknox",
        company: 'appknox'
      }
    });

    let serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      first_name: "bot",
      last_name: "appknox",
      email: "bot@appknox.com",
      company: "appknox"
    });
  });

  test('it serializes mixed inputs', function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('partner/registration-request', {
      email: 'bot@appknox.com',
      data: {
        first_name: "",
        last_name: "appknox",
        company: 'appknox'
      }
    });

    let serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      first_name: undefined,
      last_name: "appknox",
      email: "bot@appknox.com",
      company: "appknox"
    }, "empty fields are omitted by set undefined");
  });
});
