import ENUMS from 'irene/enums';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | project', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    // set the locale and the config
    this.owner.lookup('service:intl').setLocale('en');
  });

  test('it exists', function(assert) {
    const project = run(() => this.owner.lookup('service:store').createRecord('project'));
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
});
