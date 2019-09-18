import tHelper from 'ember-intl/helpers/t';
import { getOwner } from '@ember/application';
import ENUMS from 'irene/enums';
import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForComponent('compare-summary', 'Integration | Component | compare summary', {
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
  assert.expect(11);
  var component = this.subject();
  run(function() {
    component.set("comparison",
      {
        analysis1: {
          id: 1,
          risk: ENUMS.RISK.UNKNOWN
        },
        analysis2: {
          id: 2,
          risk: ENUMS.RISK.UNKNOWN
        },
        vulnerability: {
          id: 3
        }
      }
    );
    assert.deepEqual(component.get('vulnerability'), {"id": 3}, "Vulnerability");
    assert.deepEqual(component.get('file1Analysis'), {"id": 1, "risk": -1}, "File 1 Analysis");
    assert.deepEqual(component.get('file2Analysis'), {"id": 2, "risk": -1}, "File 2 Analysis");

    const cls = 'tag';
    component.set("comparison.analysis1.computedRisk", ENUMS.RISK.UNKNOWN);
    component.set("comparison.analysis2.computedRisk", ENUMS.RISK.UNKNOWN);
    assert.equal(component.get('compareColor'), cls + " " + "is-progress", "Compare Color/Progress");
    assert.equal(component.get('compareText'), "Analyzing", "Compare Text/Analyzing");

    component.set("comparison.analysis1.computedRisk", ENUMS.RISK.MEDIUM);
    component.set("comparison.analysis2.computedRisk", ENUMS.RISK.MEDIUM);
    assert.equal(component.get('compareColor'), cls + " " + "is-default", "Compare Color/Default");
    assert.equal(component.get('compareText'), "Unchanged", "Compare Text/Unchanged");

    component.set("comparison.analysis1.computedRisk", ENUMS.RISK.HIGH);
    assert.equal(component.get('compareColor'), cls + " " + "is-critical", "Compare Color/Success");
    assert.equal(component.get('compareText'), "Worsened", "Compare Text/Improved");

    component.set("comparison.analysis1.computedRisk", ENUMS.RISK.LOW);
    assert.equal(component.get('compareColor'), cls + " " + "is-success", "Compare Color/Danger");
    assert.equal(component.get('compareText'), "Improved", "Compare Text/Worsened");
  });
});
