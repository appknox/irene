import Ember from 'ember';
import ENUMS from 'irene/enums';
import { moduleForModel, test} from 'ember-qunit';
import localeConfig from 'ember-i18n/config/en';

moduleForModel('analysis', 'Unit | Model | analysis', {

  needs: [
    'model:file',
    'model:owasp',
    'model:pcidss',
    'model:vulnerability',
    'model:attachment',
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
  const analysis = this.subject();
  let store = this.store();
  Ember.run(function() {
    assert.equal(analysis.get('isScanning'), 0, "Unknown");

    assert.equal(analysis.hasType(), false, "No type");
    analysis.set('vulnerability', store.createRecord('vulnerability', {
        types: [1,2,3]
      })
    );
    assert.equal(analysis.hasType(1), true, "Has Type");

    analysis.set('risk', ENUMS.RISK.UNKNOWN);
    assert.equal(analysis.get('iconClass'), "fa-spinner fa-spin", "Loading");
    analysis.set('risk', ENUMS.RISK.NONE);
    assert.equal(analysis.get('iconClass'), "fa-check", "Check");
    analysis.set('risk', ENUMS.RISK.CRITICAL);
    assert.equal(analysis.get('iconClass'), "fa-warning", "Warning");

    const cls = 'tag';
    analysis.set('risk', ENUMS.RISK.UNKNOWN);
    assert.equal(analysis.get('labelClass'), cls + " " + "is-progress", "Progress");
    assert.equal(analysis.get('riskText.string'), "Scanning", "Scanning");
    analysis.set('risk', ENUMS.RISK.NONE);
    assert.equal(analysis.get('labelClass'), cls + " " + "is-success", "Success");
    assert.equal(analysis.get('riskText.string'), "Passed", "Passed");
    analysis.set('risk', ENUMS.RISK.LOW);
    assert.equal(analysis.get('labelClass'), cls + " " + "is-info", "Info");
    assert.equal(analysis.get('riskText.string'), "Low", "Low");
    analysis.set('risk', ENUMS.RISK.MEDIUM);
    assert.equal(analysis.get('labelClass'), cls + " " + "is-warning", "Warning");
    assert.equal(analysis.get('riskText.string'), "Medium", "Medium");
    analysis.set('risk', ENUMS.RISK.HIGH);
    assert.equal(analysis.get('labelClass'), cls + " " + "is-danger", "Danger");
    assert.equal(analysis.get('riskText.string'), "High", "High");
    analysis.set('risk', ENUMS.RISK.CRITICAL);
    assert.equal(analysis.get('labelClass'), cls + " " + "is-critical", "Critical");
    assert.equal(analysis.get('riskText.string'), "Critical", "Critical");

    assert.equal(analysis.get('isRisky'), true, "Is Risky");



  });
});
