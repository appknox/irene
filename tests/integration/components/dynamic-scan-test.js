import Ember from 'ember';
import ENUMS from 'irene/enums';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';

const { RSVP: { Promise } } = Ember;

moduleForComponent('dynamic-scan', 'Integration | Component | dynamic scan', {
  unit: true,
  needs: [
    'service:i18n',
    'service:ajax',
    'component:fa-icon',
    'component:modal-card',
    'component:api-filter',
    'service:notification-messages-service',
    'service:session',
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

    // start Mirage
    this.server = startMirage();
  },
  afterEach() {
    // shutdown Mirage
    this.server.shutdown();
  }
});

test('it exists', function(assert) {
  const component = this.subject();

  this.render();
  Ember.run(function() {
    component.set("apiScanModal", true);
    component.send('goBack');
    component.set("dynamicScanModal", true);
    component.send('goBack');
    assert.equal(component.get("showAPIScanModal"), true, "API Scan Modal");
    assert.equal(component.get("showRunDynamicScanModal"), true, "Dynamic Scan Modal");
    component.send('closeModal');
    assert.equal(component.get("showAPIScanModal"), false, "API Scan Modal");
    assert.equal(component.get("showAPIURLFilterScanModal"), false, "API URL Modal");
    assert.equal(component.get("showRunDynamicScanModal"), false, "Dynamic Scan Modal");

    component.send('openRunDynamicScanModal');
    assert.equal(component.get("showRunDynamicScanModal"), true, "Close Dynamic Scan Modal");
    component.send('closeRunDynamicScanModal');
    assert.equal(component.get("showRunDynamicScanModal"), false, "Open Dynamic Scan Modal");

    component.set("file", {
      id:1,
      setBootingStatus() {
        return true;
      },
      setShuttingDown() {
        return true;
      },
      dynamicStatus: 0,
      name: "appknox",
      project: {
        id: 1,
        platform: ENUMS.PLATFORM.ANDROID
      }
    });

    component.set("store", {
      find: function() {
        return Promise.resolve();
      }
    });

    component.send("openAPIScanModal");
    assert.equal(component.get("showAPIScanModal"), true, "API Scan Modal");
    component.set("file.project.platform", ENUMS.PLATFORM.WINDOWS);
    component.send("openAPIScanModal");

    component.send("dynamicScan");

    component.send("setAPIScanOption");

    component.send("doNotRunAPIScan");
    assert.equal(component.get("isApiScanEnabled"), false, "API Scan Enabled");

    component.send("runAPIScan");
    assert.equal(component.get("isApiScanEnabled"), true, "API Scan Enabled");

    component.send("dynamicShutdown");

    component.send("showURLFilter", "api");
    component.send("showURLFilter", "dynamic");


  });

});
