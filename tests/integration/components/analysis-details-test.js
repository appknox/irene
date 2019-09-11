import ENUMS from 'irene/enums';
import tHelper from 'ember-i18n/helper';
import localeConfig from 'ember-i18n/config/en';
import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';

moduleForComponent('analysis-details', 'Integration | Component | analysis details', {
  unit: true,
  needs: [
    'component:attach-tooltip',
    'component:modal-card',
    'component:confirm-box',
    'component:ember-popper',
    'component:risk-tag',
    'component:edit-analysis-button',
    'helper:eq',
    'helper:risk-text',
    'service:i18n',
    'service:ajax',
    'service:notification-messages-service',
    'service:session',
    'service:me',
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

test('tapping button fires an external action', function (assert) {

  var component = this.subject();
  this.render();
  run(function () {
    component.set("risks", ENUMS.RISK.CHOICES.slice(0, -1));
    component.set('analysis', { computedRisk: ENUMS.RISK.NONE, status: ENUMS.ANALYSIS.COMPLETED });
    assert.deepEqual(component.get("filteredRisks"),
      [
        { "key": "NONE", "value": 0 },
        { "key": "LOW", "value": 1 },
        { "key": "MEDIUM", "value": 2 },
        { "key": "HIGH", "value": 3 },
        { "key": "CRITICAL", "value": 4 }
      ], 'Filtered Risks');
    assert.equal(component.get("markedRisk"), 0, 'Marked Risk');
    component.send('toggleVulnerability');
    assert.equal(component.get('showVulnerability'), true, "Show Vulnerability");

    component.send('openEditAnalysisModal');
    // component.send('selectMarkedAnalyis');
    // component.send('selectMarkedAnalyisType');
    component.send('removeMarkedAnalysis');
    component.set('analysis', { file: { id: 1 }, vulnerability: { id: 1 } });
    component.send('markAnalysis');
    component.send('editMarkedAnalysis');
    component.send('cancelEditMarkingAnalysis');
    component.send('resetMarkedAnalysis');
    component.send('openResetMarkedAnalysisConfirmBox');
    assert.notOk(component.confirmCallback());

    component.set("analysis", { vulnerability: { types: [] } });
    assert.deepEqual(component.get("tags"), [], 'Empty Types');

    component.set("analysis", { vulnerability: { types: [1] }, file: { isStaticDone: true } });
    assert.deepEqual(component.get("tags")[0], { "status": true, "text": "static" }, 'Risk Type');
    component.set("analysis", { vulnerability: { types: [2] }, file: { isDynamicDone: true } });
    assert.deepEqual(component.get("tags")[0], { "status": true, "text": "dynamic" }, 'Risk Type');
    component.set("analysis", { vulnerability: { types: [3] }, file: { isManualDone: true } });
    assert.deepEqual(component.get("tags")[0], { "status": true, "text": "manual" }, 'Risk Type');
    component.set("analysis", { vulnerability: { types: [4] }, file: { isApiDone: true } });
    assert.deepEqual(component.get("tags")[0], { "status": true, "text": "api" }, 'Risk Type');
  });
});

test('statusClass is computed correctly', function (assert) {
  var component = this.subject();
  this.render();

  run(function () {
    component.set('analysis', { status: ENUMS.ANALYSIS.COMPLETED, computedRisk: ENUMS.RISK.NONE });
    assert.equal(component.get('statusClass'), 'is-completed');

    component.set('analysis', { status: ENUMS.ANALYSIS.WAITING });
    assert.equal(component.get('statusClass'), 'is-waiting');

    component.set('analysis', { status: ENUMS.ANALYSIS.RUNNING });
    assert.equal(component.get('statusClass'), 'is-progress');

    component.set('analysis', { status: ENUMS.ANALYSIS.ERROR });
    assert.equal(component.get('statusClass'), 'is-errored');

    component.set('analysis', { status: ENUMS.ANALYSIS.COMPLETED, computedRisk: ENUMS.RISK.UNKNOWN });
    assert.equal(component.get('statusClass'), 'is-untested');

    component.set('analysis', { status: ENUMS.ANALYSIS.RUNNING, computedRisk: ENUMS.RISK.UNKNOWN });
    assert.equal(component.get('statusClass'), 'is-progress');
  })
});
