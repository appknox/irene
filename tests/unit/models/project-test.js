import Ember from 'ember';
import ENUMS from 'irene/enums';
import { moduleForModel, test } from 'ember-qunit';
import localeConfig from 'ember-i18n/config/en';

moduleForModel('project', 'Unit | Model | project', {
  needs: [
    "model:user",
    "model:file",
    "model:collaboration",
    'service:i18n',
    'locale:en/translations',
    'locale:en/config',
    'util:i18n/missing-message',
    'util:i18n/compile-template',
    'config:environment'
  ],
  beforeEach() {
    // set the locale and the config
    Ember.getOwner(this).lookup('service:i18n').set('locale', 'en');
    this.register('locale:en/config', localeConfig);
  }
});

test('it exists', function(assert) {
  const project = this.subject();
  Ember.run(function() {
    assert.equal(project.get('apiUrlFilterItems'), undefined, "URL Filters/Empty");
    project.set('apiUrlFilters', "rest.com,test.com");
    assert.deepEqual(project.get('apiUrlFilterItems'), ["rest.com", "test.com"], "URL Filters");

    assert.equal(project.get('pdfPassword'), "Unknown!", "PDF Password/Unknown");
    project.set('uuid', "abceghi-jklm-opqr-stuv-wxyz100");
    assert.equal(project.get('pdfPassword'), "wxyz100", "PDF Password");

    project.set('platformVersion', "1");
    assert.equal(project.get('versionText'), "1", "Version Text");
    project.set('platformVersion', "0");
    assert.equal(project.get('versionText.string'), "No Preference", "Version Text");

    assert.equal(project.get('platformIconClass'), "mobile", "Platform Icon Class/mobile");
    project.set('platform', ENUMS.PLATFORM.ANDROID);
    assert.equal(project.get('platformIconClass'), "android", "Platform Icon Class/android");
    project.set('platform', ENUMS.PLATFORM.IOS);
    assert.equal(project.get('platformIconClass'), "apple", "Platform Icon Class/apple");
    project.set('platform', ENUMS.PLATFORM.WINDOWS);
    assert.equal(project.get('platformIconClass'), "windows", "Platform Icon Class/windows");


    assert.equal(project.get('isAPIScanEnabled'), false, "API Scan Enabled");

    assert.equal(project.get('lastFile.isDescriptor'), undefined, "Last File");
  });
});
