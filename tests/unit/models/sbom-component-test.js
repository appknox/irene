import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';

module('Unit | Model | sbom component', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'en');

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('sbom-component', {});
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

  test('aiPurposeDisplay prefers backend purpose, then model category, then class fallback', function (assert) {
    const store = this.owner.lookup('service:store');

    assert.strictEqual(
      store.createRecord('sbom-component', {
        aiPurpose: 'Backend purpose',
        aiModelCategory: 'Image Classification',
        aiArtifactClass: 'model',
      }).aiPurposeDisplay,
      'Backend purpose'
    );

    assert.strictEqual(
      store.createRecord('sbom-component', {
        aiModelCategory: 'Image Classification',
        aiArtifactClass: 'model',
      }).aiPurposeDisplay,
      'Image Classification'
    );

    assert.strictEqual(
      store.createRecord('sbom-component', {
        aiArtifactClass: 'cloud_endpoint',
      }).aiPurposeDisplay,
      t('sbomModule.aiPurposeFallback.cloudEndpoint')
    );

    assert.strictEqual(
      store.createRecord('sbom-component', {}).aiPurposeDisplay,
      null
    );
  });
});
