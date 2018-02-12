`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'project-preferences', 'Integration | Component | project preferences', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{project-preferences}}"""

  assert.equal @$().text().trim(), 'Device PreferencesSelect the Preferred Device Type and OS Version for Dynamic ScanSelected Device TypeNo PreferenceSelected OS VersionChange DeviceChange Device PreferenceDevice TypeNo PreferencePhoneTabletOS VersionNo PreferenceSelect the device'
