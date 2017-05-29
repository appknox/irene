`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'file-header', 'Integration | Component | file header', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{file-header}}"""


  assert.equal @$().text().trim(), 'SettingsApp DetailsPDF Report RISK TYPEHigh: Medium: Low: Passed: Unknown: created onversion codeReport Password  CopyScan StatusStatic ScanDynamic ScanManual ScanAPI Scan%%%%'
