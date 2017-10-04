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

  assert.equal @$().text().trim(), 'Device PreferencesChange DeviceSelected Device Type: No PreferenceSelected OS Version: Change Device PreferenceDevice TypeNo PreferencePhoneTabletOS VersionNo PreferenceSelect the device'
