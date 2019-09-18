import { getOwner } from '@ember/application';
import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';
import tHelper from 'ember-intl/helpers/t';


moduleForComponent('project-list', 'Integration | Component | project list', {
  unit: true,
  needs: [
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
  }
});

test('tapping button fires an external action', function(assert) {
  var component = this.subject();
  this.render();
  run(function() {
    assert.equal(component.newProjectsObserver(), 1, "Project Observer");
    assert.deepEqual(component.get("sortProperties"), ["lastFileCreatedOn:desc"], "Sort Properties/Desc");
    component.set("sortingReversed", false);
    assert.deepEqual(component.get("sortProperties"), ["lastFileCreatedOn"], "Sort Properties");
    assert.equal(component.resetOffset(), 0, "Reset Offset");
    assert.deepEqual(component.offsetResetter(), [undefined, undefined, undefined, undefined], "Offset Resetter");
    assert.deepEqual(component.get("extraQueryStrings"), "{\"q\":\"\",\"sorting\":\"last_file_created_on\"}", "Extra Query Strings");
    assert.deepEqual(component.get("sortingKeyObjects"),
      [
        { "key": "lastFileCreatedOn", "reverse": true, "text": "Date Updated (Most Recent First)" },
        { "key": "lastFileCreatedOn", "reverse": false, "text": "Date Updated (Oldest First)" },
        { "key": "id", "reverse": true, "text": "Date Created (Most Recent First)"},
        { "key": "id", "reverse": false, "text": "Date Created (Oldest First)"},
        { "key": "packageName", "reverse": true, "text": "Package Name(Z -> A)"},
        { "key": "packageName", "reverse": false, "text": "Package Name(A -> Z)"}
      ], "Sorting Key Objects");
    component.send("filterPlatform");
  });
});
