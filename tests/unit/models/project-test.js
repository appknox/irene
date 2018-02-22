import { moduleForModel, test } from 'ember-qunit';

moduleForModel('project', 'Unit | Model | project', {
  needs: ["model:user", "model:file", "model:collaboration"]
});

test('it exists', function(assert) {
  const project = this.subject();
  assert.equal(project.get('apiUrlFilterItems'), undefined, "URL Filters");
  assert.equal(project.get('pdfPassword'), "Unknown!", "PDF Password");
  assert.equal(project.get('platformIconClass'), "mobile", "Platform Icon Class");
  assert.equal(project.get('isAPIScanEnabled'), false, "API Scan Enabled");
});
