/* eslint-disable qunit/no-commented-tests */
// import ENV from 'irene/config/environment';
// import { module, test } from 'qunit';
// import { setupTest } from 'ember-qunit';
// import { run } from '@ember/runloop';

// module('Integration | Component | pricing list', function(hooks) {
//   setupTest(hooks);

//   test('tapping button fires an external action', function(assert) {

//     var component = this.owner.factoryFor('component:pricing-list').create();
//     var store = {
//       createRecord: function() {
//         return [
//           {
//             id: "devknox",
//             name: "Devknox",
//             description: "Dashboard Upload, Manual Scan",
//             price: ENV.devknoxPrice,
//             projectsLimit: 0,
//           }
//         ];
//       }
//     };
//     component.set('store', store);

//     run(function() {
//       assert.deepEqual(component.get('durations'),
//         [{"key": "MONTHLY","value": 1},{"key": "QUARTERLY","value": 3},{"key": "HALFYEARLY","value": 6},{"key": "YEARLY","value": 10}],
//       "Durations");
//       assert.notOk(component.activateDuration());
//       assert.notOk(component.didRender());
//     });
//   });
// });
