import { module, test } from 'qunit';

import { resolveFileProject } from 'irene/utils/resolve-file-project';

// Builds a minimal file stub whose `belongsTo('project')` mirrors the
// ember-data reference API used by resolveFileProject.
function buildFileStub({ value = null, id = null }) {
  return {
    belongsTo() {
      return {
        value: () => value,
        id: () => id,
      };
    },
  };
}

module('Unit | Utility | resolve-file-project', function () {
  test('returns the already-loaded project without hitting the store', async function (assert) {
    const project = { id: '42' };
    const file = buildFileStub({ value: project });

    let findRecordCalled = false;
    const store = {
      findRecord() {
        findRecordCalled = true;
        return Promise.resolve(null);
      },
    };

    const result = await resolveFileProject(file, store);

    assert.strictEqual(result, project, 'returns the loaded belongsTo value');
    assert.false(findRecordCalled, 'does not call store.findRecord');
  });

  test('resolves the project via store.findRecord when not loaded', async function (assert) {
    assert.expect(3);

    const project = { id: '7' };
    const file = buildFileStub({ value: null, id: '7' });

    const store = {
      findRecord(type, id) {
        assert.strictEqual(type, 'project', 'looks up the project model');
        assert.strictEqual(id, '7', 'uses the belongsTo id');

        return Promise.resolve(project);
      },
    };

    const result = await resolveFileProject(file, store);

    assert.strictEqual(result, project, 'returns the fetched project');
  });

  test('returns null when the file has no project relation', async function (assert) {
    const file = buildFileStub({ value: null, id: null });

    let findRecordCalled = false;
    const store = {
      findRecord() {
        findRecordCalled = true;
        return Promise.resolve(null);
      },
    };

    const result = await resolveFileProject(file, store);

    assert.strictEqual(result, null, 'returns null');
    assert.false(findRecordCalled, 'does not call store.findRecord');
  });
});
