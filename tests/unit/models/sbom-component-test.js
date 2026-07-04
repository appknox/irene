import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | sbom component', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('sbom-component', {});
    assert.ok(model);
  });

  test('hasFoundLocations is false when there is no evidence', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('sbom-component', {});

    assert.false(model.hasFoundLocations);
    assert.deepEqual(model.evidenceLocations, ['-']);
    assert.strictEqual(model.primaryEvidenceLocation, '-');
  });

  test('hasFoundLocations is true and evidenceLocations lists every file when evidence is present', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('sbom-component', {
      evidence: { occurrences: { location: ['kotlin/A.kt', 'kotlin/B.kt'] } },
    });

    assert.true(model.hasFoundLocations);
    assert.deepEqual(model.evidenceLocations, ['kotlin/A.kt', 'kotlin/B.kt']);
    assert.strictEqual(model.primaryEvidenceLocation, 'kotlin/A.kt');
  });

  test('hasFoundLocations is false when evidence occurrences is an empty list', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('sbom-component', {
      evidence: { occurrences: { location: [] } },
    });

    assert.false(model.hasFoundLocations);
  });
});
