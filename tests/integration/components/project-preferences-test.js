/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('project-preferences', 'Integration | Component | project preferences', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  // Set any properties with @set 'myProperty', 'value'
  // Handle any actions with @on 'myAction', (val) ->

  this.render(hbs("{{project-preferences}}"));

  return assert.equal(this.$().text().trim(), 'Device PreferencesSelect the Preferred Device Type and OS Version for Dynamic ScanSelected Device TypeNo PreferenceSelected OS VersionChange DeviceChange Device PreferenceDevice TypeNo PreferencePhoneTabletOS VersionNo PreferenceSelect the device');
});
