import { getOwner } from '@ember/application';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import hbs from 'htmlbars-inline-precompile';
import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';
import and from 'ember-truth-helpers/helpers/and';
import localClass from 'ember-css-modules/helpers/local-class';
import tHelper from 'ember-intl/helpers/t';

moduleForComponent('vnc-viewer', 'Integration | Component | vnc viewer', {
  unit: true,
  needs: [
    'component:dynamic-scan',
    'component:novnc-rfb',
    'template:components/novnc-rfb',
    'service:intl',
    'config:environment',
    'service:intl',
    'ember-intl@adapter:default',
    'cldr:en',
    'cldr:ja',
    'translation:en',
    'util:intl/missing-message',
    'service:trial',
    'service:ajax',
    'service:notification-messages-service',
    'service:me',
  ],
  beforeEach() {
    // set the locale and the config
    getOwner(this).lookup('service:intl').setLocale('en');

    // register t helper
    this.register('helper:local-class', localClass);
    this.register('helper:and', and);
    this.registry.register('helper:t', tHelper);

  }
});

test('it renders', function (assert) {
  assert.expect(1);

  this.render(hbs("{{vnc-viewer}}"));

  assert.equal(this.$().text().trim(), '');
});

test('tapping button fires an external action', function (assert) {
  var component = this.subject();

  run(function () {
    component.set('file', { isReady: false });
    component.set('file.project', { platform: ENUMS.PLATFORM.ANDROID });
    assert.equal(component.get('deviceType'), "nexus5", "Nexus 5");
    component.set('file.project', { platform: ENUMS.PLATFORM.IOS });
    assert.equal(component.get('deviceType'), "iphone5s black", "iPhone");
    assert.equal(component.get('isIOSDevice'), true, "IOS");
    component.set('file.project', { deviceType: ENUMS.DEVICE_TYPE.TABLET_REQUIRED, platform: ENUMS.PLATFORM.IOS });
    assert.equal(component.get("deviceType"), "iphone5s black", "iPad");
    component.send("togglePop");
  });
});
test('novnc renders andriod', function (assert) {
  var component = this.subject()
  run(function () {
    component.set('file', { isReady: true });
    component.set('deviceType', 'nexus5');
  });
  this.render();
  assert.equal(component.$('.marvel-device.nexus5').length, 1);
  assert.equal(component.$('.canvas-container').length, 1);
});

test('novnc renders iphone5s black', function (assert) {
  var component = this.subject()
  run(function () {
    component.set('file', { isReady: true });
    component.set('deviceType', 'iphone5s black');
  });
  this.render();
  assert.equal(component.$('.marvel-device.iphone5s.black').length, 1);
  assert.equal(component.$('.canvas-container').length, 1);
});
test('novnc-rfb component rendering', function (assert) {
  var component = this.subject();
  run(function () {
    component.set('file', { isReady: true, deviceToken: "testToken" });
    component.set('deviceType', 'nexus5');
  });

  this.render();
  const rfb = component.childViews[0].get('rfb');
  assert.equal(rfb._target.classList['value'].includes("canvas-container _novnc-rfb"), true);
  assert.equal(rfb._url, `${ENV.deviceFarmURL}?token=testToken`);
  assert.equal(rfb._rfb_credentials.password, "1234");
  //
  run(function () {
    component.set('file', { isReady: false });
  });
  this.render();
  assert.equal(component.$('.canvas-container').length, 0);
});
