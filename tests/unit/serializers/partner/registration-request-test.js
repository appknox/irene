import { module, test } from "qunit";
import { setupTest } from "ember-qunit";

module("Unit | Serializer | partner registration request", function (hooks) {
  setupTest(hooks);

  test("it serializes all valid inputs", function (assert) {
    let store = this.owner.lookup("service:store");
    let record = store.createRecord("partner/registration-request", {
      email: "test@example.com",
      data: {
        first_name: "FirstName",
        last_name: "LastName",
        company: "CompanyName",
      },
    });

    let serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      email: "test@example.com",
      data: {
        company: "CompanyName",
        first_name: "FirstName",
        last_name: "LastName",
      },
      approval_status: null,
      source: null,
      is_activated: false,
      created_on: null,
      updated_on: null,
      valid_until: null,
    });
  });

  test("it serializes mixed inputs", function (assert) {
    let store = this.owner.lookup("service:store");
    let record = store.createRecord("partner/registration-request", {
      email: "test@example.com",
      data: {
        first_name: "",
        last_name: "LastName",
        company: "CompanyName",
      },
    });

    let serializedRecord = record.serialize();
    assert.deepEqual(
      serializedRecord,
      {
        email: "test@example.com",
        data: {
          company: "CompanyName",
          first_name: "",
          last_name: "LastName",
        },
        approval_status: null,
        source: null,
        is_activated: false,
        created_on: null,
        updated_on: null,
        valid_until: null,
      },
      "empty fields are omitted by set undefined"
    );
  });
});
