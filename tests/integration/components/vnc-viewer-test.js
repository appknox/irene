import Ember from 'ember';
import ENUMS from 'irene/enums';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import hbs from 'htmlbars-inline-precompile';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('vnc-viewer', 'Integration | Component | vnc viewer', {
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
    Ember.getOwner(this).lookup('service:i18n').set('locale', 'en');
    this.register('locale:en/config', localeConfig);

    // register t helper
    this.register('helper:t', tHelper);
  }
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{vnc-viewer}}"));

  assert.equal(this.$().text().trim(), '');
});

test('tapping button fires an external action', function(assert) {
  assert.expect(9);

  var component = this.subject();

  Ember.run(function() {
    assert.equal(component.get('vncPopText.string'), "Full Screen", "Full Screen");
    component.set('isPoppedOut', true);
    assert.equal(component.get('vncPopText.string'), "Exit Full Screen", "Exit Full Screen");
    component.set('rfb', "rfb");
    assert.equal(component.setupRFB(), undefined, "Setup RFB");
    assert.equal(component.statusChange(), undefined, "Status Change");
    component.set('file', {isReady: false});
    assert.equal(component.statusChange(), undefined, "Status Change");
    component.set('file.project', {platform: ENUMS.PLATFORM.ANDROID});
    assert.equal(component.get('deviceType'), "nexus5", "Nexus 5");
    component.set('file.project', {platform: ENUMS.PLATFORM.IOS});
    assert.equal(component.get('deviceType'), "iphone5s black", "iPhone");
    assert.equal(component.get('isIOSDevice'), true, "IOS");
    component.set('file.project', {deviceType: ENUMS.DEVICE_TYPE.TABLET_REQUIRED, platform: ENUMS.PLATFORM.IOS});
    assert.equal(component.get('deviceType'), "ipad black", "iPad");
    component.send("togglePop");
  });
});
