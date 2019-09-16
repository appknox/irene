import { getOwner } from '@ember/application';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import tHelper from 'ember-intl/helpers/t';


moduleForComponent('subscription-component', 'Integration | Component | subscription component', {
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
    component.send('openCancelSubscriptionConfirmBox');
    assert.equal(component.get('showCancelSubscriptionConfirmBox'),true, "Open Modal");
    component.send('closeCancelSubscriptionConfirmBox');
    assert.equal(component.get('showCancelSubscriptionConfirmBox'),false, "Close Modal");

    component.set("subscription", {id: 1});
    assert.equal(component.confirmCallback(), undefined, "Confirm Callback");

  });
});
