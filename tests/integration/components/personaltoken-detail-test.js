/* eslint-disable prettier/prettier, qunit/no-commented-tests */
// import { module, test } from 'qunit';
// import { setupTest } from 'ember-qunit';
// import { startMirage } from 'irene/initializers/ember-cli-mirage';
// import { run } from '@ember/runloop';
// import tHelper from 'ember-intl/helpers/t';


// module('Integration | Component | personaltoken detail', function(hooks) {
//   setupTest(hooks);

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

//   test('tapping button fires an external action', function(assert) {

//     var component = this.owner.factoryFor('component:personaltoken-detail').create();
//     run(function() {
//       component.send('openRevokePersonalTokenConfirmBox');
//       assert.equal(component.get('showRevokePersonalTokenConfirmBox'),true, "Open Modal");
//       component.send('closeRevokePersonalTokenConfirmBox');
//       assert.equal(component.get('showRevokePersonalTokenConfirmBox'),false, "Close Modal");

//       component.set("personaltoken", {id: 1});
//       assert.equal(component.confirmCallback(), undefined, "Confirm Callback");

//     });
//   });
// });
