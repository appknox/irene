// import Ember from 'ember';
// import tHelper from 'ember-i18n/helper';
// import localeConfig from 'ember-i18n/config/en';
// import { test, moduleForComponent } from 'ember-qunit';
//
// moduleForComponent('api-filter', 'Integration | Component | api filter', {
//   unit: true,
//   needs: [
//     'service:i18n',
//     'service:ajax',
//     'locale:en/translations',
//     'locale:en/config',
//     'util:i18n/missing-message',
//     'util:i18n/compile-template',
//     'config:environment'
//   ],
//   beforeEach() {
//     // set the locale and the config
//     Ember.getOwner(this).lookup('service:i18n').set('locale', 'en');
//     this.register('locale:en/config', localeConfig);
//
//     // register t helper
//     this.register('helper:t', tHelper);
//   }
// });
//
// test('tapping button fires an external action', function(assert) {
//   this.register('service:ajax', Ember.Service.extend({
//
//   }));
//   assert.expect(1);
//
//   var component = this.subject();
//
//   Ember.run(function() {
//
//     component.set('project', {apiUrlFilters:"yash.com"});
//     component.click();
//     assert.equal(component.confirmCallback() ,true, "Show Vulnerability");
//   });
// });
