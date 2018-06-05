import Ember from 'ember';
import localeConfig from 'ember-i18n/config/en';
import { moduleForModel, test} from 'ember-qunit';

moduleForModel('device-preference', 'Unit | Model | device preference', {
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
    Ember.getOwner(this).lookup('service:i18n').set('locale', 'en');
    this.register('locale:en/config', localeConfig);
  }
});

test('it exists', function(assert) {
  const devicePreference = this.subject();
  Ember.run(function() {
    devicePreference.set('platformVersion', "1");
    assert.equal(devicePreference.get('versionText'), "1", "Version Text");
    devicePreference.set('platformVersion', "0");
    assert.equal(devicePreference.get('versionText.string'), "No Preference", "Version Text");
  });
});