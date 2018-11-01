import { getOwner } from '@ember/application';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';

moduleForComponent('jira-project', 'Integration | Component | jira project', {
  unit: true,
  needs: [
    'service:i18n',
    'component:confirm-box',
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
    getOwner(this).lookup('service:i18n').set('locale', 'en');
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

  run(function() {

    component.set("project", {id:1});
    assert.notOk(component.confirmCallback());

    assert.notOk(component.fetchJiraProjects());

    component.send("openDeleteJIRAConfirmBox");
    assert.equal(component.get("showDeleteJIRAConfirmBox"),true, "Open");
    component.send("closeDeleteJIRAConfirmBox");
    assert.equal(component.get("showDeleteJIRAConfirmBox"),false, "Close");
  });
});

test('tapping button fires an external action', function(assert) {
  assert.expect(0);
  var component = this.subject();
  this.render();
  run(function() {
    component.set("project", {id:1});
    component.send("selectProject");
  });
});
