import { getOwner } from '@ember/application';
import ENUMS from 'irene/enums';
import { moduleForModel, test } from 'ember-qunit';
import localeConfig from 'ember-i18n/config/en';
import { run } from '@ember/runloop';

moduleForModel('project', 'Unit | Model | project', {
  needs: [
    "model:user",
    "model:file",
    'service:i18n',
    'locale:en/translations',
    'locale:en/config',
    'util:i18n/missing-message',
    'util:i18n/compile-template',
    'config:environment'
  ],
  beforeEach() {
    // set the locale and the config
    getOwner(this).lookup('service:i18n').set('locale', 'en');
    this.register('locale:en/config', localeConfig);
  }
});

test('it exists', function(assert) {
  const project = this.subject();
  var store = {
    queryRecord: function() {
      return [
        {
          id:1,
          type: "file",
          attributes: {
            name: "test"
          }
        }
      ];
    }
  };
  project.set('store', store);
  assert.deepEqual(project.get("lastFile"), [{
      id:1,
      type: "file",
      attributes: {
        name: "test"
      }
    }
  ]);
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
