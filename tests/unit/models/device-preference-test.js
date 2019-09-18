import { getOwner } from '@ember/application';
import { moduleForModel, test} from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForModel('device-preference', 'Unit | Model | device preference', {
  needs: [
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
  const devicePreference = this.subject();
  run(function() {
    devicePreference.set('platformVersion', "1");
    assert.equal(devicePreference.get('versionText'), "1", "Version Text");
    devicePreference.set('platformVersion', "0");
    assert.equal(devicePreference.get('versionText'), "Any Version", "Version Text");
  });
});
