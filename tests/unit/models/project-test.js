import { getOwner } from '@ember/application';
import ENUMS from 'irene/enums';
import { moduleForModel, test } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForModel('project', 'Unit | Model | project', {
  needs: [
    "model:user",
    "model:file",
    'config:environment',
    'service:intl',
    'ember-intl@adapter:default',
    'cldr:en',
    'cldr:ja',
    'translation:en',
    'util:intl/missing-message'
  ],
  beforeEach() {
    // set the locale and the config
    getOwner(this).lookup('service:intl').setLocale('en');
  }
});

test('it exists', function(assert) {
  const project = this.subject();
  run(function() {

    assert.equal(project.get('pdfPassword'), "Unknown!", "PDF Password/Unknown");
    project.set('uuid', "abceghi-jklm-opqr-stuv-wxyz100");
    assert.equal(project.get('pdfPassword'), "wxyz100", "PDF Password");

    assert.equal(project.get('platformIconClass'), "mobile", "Platform Icon Class/mobile");
    project.set('platform', ENUMS.PLATFORM.ANDROID);
    assert.equal(project.get('platformIconClass'), "android", "Platform Icon Class/android");
    project.set('platform', ENUMS.PLATFORM.IOS);
    assert.equal(project.get('platformIconClass'), "apple", "Platform Icon Class/apple");
    project.set('platform', ENUMS.PLATFORM.WINDOWS);
    assert.equal(project.get('platformIconClass'), "windows", "Platform Icon Class/windows");


    assert.equal(project.get('isAPIScanEnabled'), false, "API Scan Enabled");
  });
});
