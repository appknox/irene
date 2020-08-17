// import { getOwner } from '@ember/application';
// import tHelper from 'ember-i18n/helper';
// import localeConfig from 'ember-i18n/config/en';
// import { test, moduleForComponent } from 'ember-qunit';
// import { startMirage } from 'irene/initializers/ember-cli-mirage';
// import { run } from '@ember/runloop';
//
// moduleForComponent('github-project', 'Integration | Component | github project', {
//   unit: true,
//   needs: [
//     'service:i18n',
//     'component:confirm-box',
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
//   var component = this.subject();
//   run(function() {
//     component.set("project", {id:1});
//     assert.equal(component.confirmCallback(),undefined, "Confirm Callback");
//     component.send("openDeleteGHConfirmBox");
//     assert.equal(component.get("showDeleteGHConfirmBox"),true, "Open");
//     component.send("closeDeleteGHConfirmBox");
//     assert.equal(component.get("showDeleteGHConfirmBox"),false, "Close");
//     assert.notOk(component.fetchGithubRepos());
//   });
// });
//
// test('tapping button fires an external action', function(assert) {
//   assert.expect(0);
//   var component = this.subject();
//   this.render();
//   run(function() {
//     component.set("project", {id:1});
//     component.send("selectRepo");
//   });
// });
