/* eslint-disable prettier/prettier */
import { module, test } from "qunit";
import { setupTest } from "ember-qunit";

module("Unit | Adapter | partner partner", function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test("it exists", function (assert) {
    let adapter = this.owner.lookup("adapter:partner/partner");
    assert.ok(adapter);
  });
});
