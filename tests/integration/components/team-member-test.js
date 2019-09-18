import { getOwner } from '@ember/application';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import tHelper from 'ember-intl/helpers/t';

moduleForComponent('team-member', 'Integration | Component | team member', {
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
    assert.equal(component.promptCallback("yash"),undefined, "Confirm Callback");
    component.set("team", {id:1});
    component.set("organizationTeam", {id:1, organization:{id:1}});
    component.set("member", "yash");
    assert.equal(component.promptCallback("yash"),undefined, "Confirm Callback");

    component.send('openRemoveMemberPrompt');
    assert.equal(component.get('showRemoveMemberPrompt'),true, "Open Modal");
    component.send('closeRemoveMemberPrompt');
    assert.equal(component.get('showRemoveMemberPrompt'),false, "Close Modal");

  });
});
