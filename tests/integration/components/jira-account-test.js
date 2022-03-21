/* eslint-disable qunit/no-commented-tests */
// import { getOwner } from '@ember/application';
// import tHelper from 'ember-i18n/helper';
// import localeConfig from 'ember-i18n/config/en';
// import { test, moduleForComponent } from 'ember-qunit';
// import { startMirage } from 'irene/initializers/ember-cli-mirage';
// import { run } from '@ember/runloop';
//
// moduleForComponent('jira-account', 'Integration | Component | jira account', {
//   unit: true,
//   needs: [
//     'service:i18n',
//     'service:ajax',
//     'service:notifications',
//     'service:session',
//     'locale:en/translations',
//     'locale:en/config',
//     'util:i18n/missing-message',
//     'util:i18n/compile-template',
//     'config:environment'
//   ],
//   beforeEach() {
//     // set the locale and the config
//     getOwner(this).lookup('service:i18n').set('locale', 'en');
//     this.register('locale:en/config', localeConfig);
//
//     // register t helper
//     this.register('helper:t', tHelper);
//
//     // start Mirage
//     this.server = startMirage();
//   },
//   afterEach() {
//     // shutdown Mirage
//     this.server.shutdown();
//   }
// });
//
// test('tapping button fires an external action', function(assert) {
//
//   var component = this.subject();
//
//   run(function() {
//     component.send('openRevokeJIRAConfirmBox');
//     assert.equal(component.get('showRevokeJIRAConfirmBox'),true, "Open Modal");
//     component.send('closeRevokeJIRAConfirmBox');
//     assert.equal(component.get('showRevokeJIRAConfirmBox'),false, "Close Modal");
//
//     assert.equal(component.confirmCallback(),undefined, "Confirm Callback");
//   });
// });
