/* eslint-disable qunit/no-commented-tests */
// import tHelper from 'ember-intl/helpers/t';
// import { module, test } from 'qunit';
// import { setupTest } from 'ember-qunit';
// import { startMirage } from 'irene/initializers/ember-cli-mirage';
// import { run } from '@ember/runloop';

// module('Integration | Component | api filter', function(hooks) {
//   setupTest(hooks);

//   hooks.beforeEach(function() {
//     // set the locale and the config
//     this.owner.lookup('service:intl').setLocale('en');

//     // register t helper
//     this.owner.register('helper:t', tHelper);

//     // start Mirage
//     this.server = startMirage();
//   });

//   hooks.afterEach(function() {
//     // shutdown Mirage
//     this.server.shutdown();
//   });

//   test('tapping button fires an external action', function(assert) {
//     var component = this.owner.factoryFor('component:api-filter').create();
//     var store = {
//       queryRecord: function() {
//         return [
//           {
//             id:1,
//             type: "api-scan-options",
//             attributes: {
//               apiUrlFilters: "test"
//             }
//           }
//         ];
//       }
//     };
//     component.set('store', store);
//     this.render();
//     run(function() {
//       assert.deepEqual(component.get("apiScanOptions"), [{
//           id:1,
//           type: "api-scan-options",
//           attributes: {
//             apiUrlFilters: "test"
//           }
//         }
//       ]);
//       component.set('project', {id: 1, activeProfileId:1});
//       component.set('profileId', 1);
//       component.set('apiScanOptions', {id: 1, apiUrlFilters:"yash.com", activeProfileId:1});
//       assert.equal(component.confirmCallback() ,undefined, "Show Vulnerability");
//       component.set("isSavingFilter", true);
//       component.send("addApiUrlFilter");
//       component.set("newUrlFilter", "test1.com:8000");
//       component.send("addApiUrlFilter");
//       component.set("newUrlFilter", "test1.com");
//       component.send("addApiUrlFilter");
//       component.set('project', {id: 1, apiUrlFilters:"", activeProfileId:1});
//       component.send("addApiUrlFilter");
//       component.send("closeRemoveURLConfirmBox");
//     });
//   });
// });
