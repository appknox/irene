import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';
import tHelper from 'ember-intl/helpers/t';
import { getOwner } from '@ember/application';

moduleForComponent('team-overview', 'Integration | Component | team overview', {
  unit: true,
  needs: [
    'config:environment',
    'service:intl',
    'ember-intl@adapter:default',
    'cldr:en',
    'cldr:ja',
    'util:intl/missing-message'
  ],
  beforeEach() {
    // set the locale and the config
    getOwner(this).lookup('service:intl').setLocale('en');

    this.registry.register('helper:t', tHelper);
  },
});

test('tapping button fires an external action', function (assert) {

  var component = this.subject();
  run(function () {
    component.send('openDeleteTeamPrompt');
    assert.equal(component.get('showDeleteTeamPrompt'), true, "Open Modal");
    component.send('closeDeleteTeamPrompt');
    assert.equal(component.get('showDeleteTeamPrompt'), false, "Close Modal");
  });
});
