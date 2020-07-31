// import ENUMS from 'irene/enums';
// import { module, test } from 'qunit';
// import { startMirage } from 'irene/initializers/ember-cli-mirage';
// import tHelper from 'ember-intl/helpers/t';
// import { setupRenderingTest } from 'ember-qunit';
// import { render } from '@ember/test-helpers';
// import hbs from 'htmlbars-inline-precompile';

// module('Integration | Component | analysis details', function(hooks) {
//   setupRenderingTest(hooks);

//   hooks.beforeEach(function() {
//     // set the locale and the config
//     this.owner.lookup('service:intl').setLocale('en');

//     this.owner.register('helper:t', tHelper);
//     // start Mirage
//     this.server = startMirage();
//   });

//   hooks.afterEach(function() {
//     // shutdown Mirage
//     this.server.shutdown();
//   });

//   test('tapping button fires an external action', async function (assert) {
//     this.set('analysis', {
//       file: { id: 1 },
//       vulnerability: { id: 1 },
//       computedRisk: ENUMS.RISK.NONE,
//       status: ENUMS.ANALYSIS.COMPLETED
//     });
//     this.set("risks", ENUMS.RISK.CHOICES.slice(0, -1));
//     await render(hbs`<AnalysisDetails @analysis={{this.analysis}}`)
//     assert.deepEqual(this.get("filteredRisks"),
//       [
//         { "key": "NONE", "value": 0 },
//         { "key": "LOW", "value": 1 },
//         { "key": "MEDIUM", "value": 2 },
//         { "key": "HIGH", "value": 3 },
//         { "key": "CRITICAL", "value": 4 }
//       ], 'Filtered Risks');
//     assert.equal(this.get("markedRisk"), 0, 'Marked Risk');
//     this.send('toggleVulnerability');
//     assert.equal(this.get('showVulnerability'), true, "Show Vulnerability");

//     this.send('openEditAnalysisModal');
//     // this.send('selectMarkedAnalyis');
//     // this.send('selectMarkedAnalyisType');
//     this.send('removeMarkedAnalysis');
//     this.set('analysis', { file: { id: 1 }, vulnerability: { id: 1 } });
//     this.send('markAnalysis');
//     this.send('editMarkedAnalysis');
//     this.send('cancelEditMarkingAnalysis');
//     this.send('resetMarkedAnalysis');
//     this.send('openResetMarkedAnalysisConfirmBox');
//     assert.notOk(this.confirmCallback());

//     this.set("analysis", { vulnerability: { types: [] } });
//     assert.deepEqual(this.get("tags"), [], 'Empty Types');

//     this.set("analysis", { vulnerability: { types: [1] }, file: { isStaticDone: true } });
//     assert.deepEqual(this.get("tags")[0], { "status": true, "text": "static" }, 'Risk Type');
//     this.set("analysis", { vulnerability: { types: [2] }, file: { isDynamicDone: true } });
//     assert.deepEqual(this.get("tags")[0], { "status": true, "text": "dynamic" }, 'Risk Type');
//     this.set("analysis", { vulnerability: { types: [3] }, file: { isManualDone: true } });
//     assert.deepEqual(this.get("tags")[0], { "status": true, "text": "manual" }, 'Risk Type');
//     this.set("analysis", { vulnerability: { types: [4] }, file: { isApiDone: true } });
//     assert.deepEqual(this.get("tags")[0], { "status": true, "text": "api" }, 'Risk Type');
//   });

//   test('statusClass is computed correctly', async function (assert) {
//     this.set('analysis', { file: { id: 1 }, vulnerability: { id: 1 } });
//     await render(hbs`<AnalysisDetails @analysis={{this.analysis}}`)

//     this.set('analysis', { status: ENUMS.ANALYSIS.COMPLETED, computedRisk: ENUMS.RISK.NONE });
//     assert.equal(this.get('statusClass'), 'is-completed');

//     this.set('analysis', { status: ENUMS.ANALYSIS.WAITING });
//     assert.equal(this.get('statusClass'), 'is-waiting');

//     this.set('analysis', { status: ENUMS.ANALYSIS.RUNNING });
//     assert.equal(this.get('statusClass'), 'is-progress');

//     this.set('analysis', { status: ENUMS.ANALYSIS.ERROR });
//     assert.equal(this.get('statusClass'), 'is-errored');

//     this.set('analysis', { status: ENUMS.ANALYSIS.COMPLETED, computedRisk: ENUMS.RISK.UNKNOWN });
//     assert.equal(this.get('statusClass'), 'is-untested');

//     this.set('analysis', { status: ENUMS.ANALYSIS.RUNNING, computedRisk: ENUMS.RISK.UNKNOWN });
//     assert.equal(this.get('statusClass'), 'is-progress');
//   });
// });
