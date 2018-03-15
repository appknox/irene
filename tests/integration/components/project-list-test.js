import Ember from 'ember';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('project-list', 'Integration | Component | project list', {
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

test('tapping button fires an external action', function(assert) {
  var component = this.subject();
  this.render();
  Ember.run(function() {
    assert.equal(component.newProjectsObserver(), 1, "Project Observer");
    assert.deepEqual(component.get("sortProperties"), ["lastFileCreatedOn:desc"], "Sort Properties/Desc");
    component.set("sortingReversed", false);
    assert.deepEqual(component.get("sortProperties"), ["lastFileCreatedOn"], "Sort Properties");
    assert.equal(component.resetOffset(), 0, "Reset Offset");
    assert.deepEqual(component.offsetResetter(), [undefined, undefined, undefined, undefined], "Offset Resetter");
    assert.deepEqual(component.get("extraQueryStrings"), "{\"platform\":-1,\"query\":\"\",\"reverse\":false,\"sortingKey\":\"lastFileCreatedOn\"}", "Extra Query Strings");
    assert.deepEqual(component.get("sortingKeyObjects"),
      [
        { "key": "lastFileCreatedOn", "reverse": true, "text": "Date Updated (Most Recent First)" },
        { "key": "lastFileCreatedOn", "reverse": false, "text": "Date Updated (Oldest First)" },
        { "key": "createdOn", "reverse": true, "text": "Date Created (Most Recent First)"},
        { "key": "createdOn", "reverse": false, "text": "Date Created (Oldest First)"},
        { "key": "name", "reverse": true, "text": "Project Name(Z -> A)"},
        { "key": "name", "reverse": false, "text": "Project Name(A -> Z)"},
        { "key": "packageName", "reverse": true, "text": "Package Name(Z -> A)"},
        { "key": "packageName", "reverse": false, "text": "Package Name(A -> Z)"}
      ], "Sorting Key Objects");
    component.send("filterPlatform");
  });
});
