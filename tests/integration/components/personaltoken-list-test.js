/* eslint-disable qunit/no-commented-tests */
// import { module, test } from 'qunit';
// import { setupTest } from 'ember-qunit';
// import { startMirage } from 'irene/initializers/ember-cli-mirage';
// import { run } from '@ember/runloop';
// import tHelper from 'ember-intl/helpers/t';

// module('Integration | Component | personaltoken list', function(hooks) {
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

//     var component = this.owner.factoryFor('component:personaltoken-list').create();
//     run(function() {
//       component.send('openGenerateTokenModal');
//       assert.equal(component.get('showGenerateTokenModal'),true, "Open Modal");

//       component.send('generateToken');
//       component.set("tokenName", "test");
//       component.send('generateToken');
//       assert.equal(component.get('isGeneratingToken'),true, "Generating Token");
//       assert.equal(component.didInsertElement(), undefined, "Register Password Copy");
//       assert.equal(component.willDestroyElement(), undefined, "Destroy Password Copy");
//     });
//   });
// });
