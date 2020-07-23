import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import tHelper from 'ember-intl/helpers/t';

module('Integration | Component | team overview', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    // set the locale and the config
    this.owner.lookup('service:intl').setLocale('en');

    this.owner.register('helper:t', tHelper);
  });

  test('tapping button fires an external action', function (assert) {

    var component = this.owner.factoryFor('component:team-overview').create();
    run(function () {
      component.send('openDeleteTeamPrompt');
      assert.equal(component.get('showDeleteTeamPrompt'), true, "Open Modal");
      component.send('closeDeleteTeamPrompt');
      assert.equal(component.get('showDeleteTeamPrompt'), false, "Close Modal");
    });
  });
});
