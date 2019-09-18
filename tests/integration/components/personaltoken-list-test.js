import { getOwner } from '@ember/application';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import tHelper from 'ember-intl/helpers/t';

moduleForComponent('personaltoken-list', 'Integration | Component | personaltoken list', {
  unit: true,
  needs: [
    'service:ajax',
    'service:notification-messages-service',
    'service:session',
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

    this.registry.register('helper:t', tHelper);
    // start Mirage
    this.server = startMirage();
  },
  afterEach() {
    // shutdown Mirage
    this.server.shutdown();
  }
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  run(function() {
    component.send('openGenerateTokenModal');
    assert.equal(component.get('showGenerateTokenModal'),true, "Open Modal");

    component.send('generateToken');
    component.set("tokenName", "test");
    component.send('generateToken');
    assert.equal(component.get('isGeneratingToken'),true, "Generating Token");
    assert.equal(component.didInsertElement(), undefined, "Register Password Copy");
    assert.equal(component.willDestroyElement(), undefined, "Destroy Password Copy");
  });
});
