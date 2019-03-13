import { getOwner } from '@ember/application';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForComponent('risk-tag', 'Integration | Component | risk tag', {
  unit: true,
  needs: [
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

    // register t helper
    this.register('helper:t', tHelper);
  }
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();

  run(function() {
    assert.equal(component.get("scanningText"), "", "Scanning Text");
    component.set("analysis", {vulnerability: {types: [1]}});
    assert.equal(component.get("scanningText").string, "Scanning", "Scanning Text");
    component.set("analysis", {
      vulnerability: {
        types: [2]
      },
      file: {
        dynamicStatus: 0
      }
    });
    assert.equal(component.get("scanningText").string, "Untested", "Scanning Text");
    component.set("analysis", {
      vulnerability: {
        types: [2]
      }
    });
    assert.equal(component.get("scanningText").string, "Scanning", "Scanning Text");
    component.set("analysis", {
      vulnerability: {
        types: [3]
      }
    });
    assert.equal(component.get("scanningText").string, "Untested", "Scanning Text");
    component.set("analysis", {
      vulnerability: {
        types: [3]
      },
      file: {
        manual: true
      }
    });
    assert.equal(component.get("scanningText").string, "Requested", "Scanning Text");
    component.set("analysis", {
      vulnerability: {
        types: [4]
      }
    });
    assert.equal(component.get("scanningText").string, "Untested", "Scanning Text");
    component.set("analysis", {
      vulnerability: {
        types: [4]
      },
      file: {
        apiScanProgress: 1
      }
    });
    assert.equal(component.get("scanningText").string, "Scanning", "Scanning Text");
  });
});
