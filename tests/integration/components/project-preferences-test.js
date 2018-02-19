import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('project-preferences', 'Integration | Component | project preferences', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{project-preferences}}"));

  assert.equal(this.$().text().trim(), 'Device PreferencesSelect the Preferred Device Type and OS Version for Dynamic ScanSelected Device TypeNo PreferenceSelected OS VersionChange DeviceChange Device PreferenceDevice TypeNo PreferencePhoneTabletOS VersionNo PreferenceSelect the device');
});
