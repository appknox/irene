import Ember from 'ember';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';


moduleForComponent('team-member', 'Integration | Component | team member', {
  unit: true,
  needs: [
    'service:i18n',
    'service:ajax',
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

test('tapping button fires an external action', function(assert) {

  var component = this.subject();

  Ember.run(function() {
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
