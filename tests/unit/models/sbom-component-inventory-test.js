import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';

module('Unit | Model | sbom-component-inventory', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'en');

  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('sbom-component-inventory', {});

    assert.ok(model);
  });

  test('bomRef is the backend-provided identifier', function (assert) {
    const store = this.owner.lookup('service:store');

    const model = store.createRecord('sbom-component-inventory', {
      bomRef: 'maven::junit:junit',
    });

    assert.strictEqual(model.bomRef, 'maven::junit:junit');
  });

  test('hasVersion and displayVersion reflect the version', function (assert) {
    const store = this.owner.lookup('service:store');

    const versioned = store.createRecord('sbom-component-inventory', {
      version: '4.4.3',
    });

    assert.true(versioned.hasVersion);
    assert.strictEqual(versioned.displayVersion, '4.4.3');

    const unversioned = store.createRecord('sbom-component-inventory', {
      version: '',
    });

    assert.false(unversioned.hasVersion);
    assert.strictEqual(unversioned.displayVersion, '-');
  });

  test('typeLabel maps known types and titleizes unknown ones', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('sbom-component-inventory', {});

    model.componentType = 'library';
    assert.strictEqual(model.typeLabel, 'Library');

    model.componentType = 'machine-learning-model';
    assert.strictEqual(model.typeLabel, 'ML Model');

    model.componentType = 'file';
    assert.strictEqual(model.typeLabel, 'File');

    model.componentType = 'secret';
    assert.strictEqual(model.typeLabel, 'Secret');

    model.componentType = '';
    assert.strictEqual(model.typeLabel, '-');
  });

  test('isVulnerable is true only for VULNERABLE status', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('sbom-component-inventory', {});

    model.status = 'VULNERABLE';
    assert.true(model.isVulnerable);

    model.status = 'SECURE';
    assert.false(model.isVulnerable);
  });
});
