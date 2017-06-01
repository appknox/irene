`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'file-details', 'Integration | Component | file details', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{file-details}}"""

  assert.equal @$().text().trim(), 'SettingsScan DetailsPDF ReportSeverity LevelHigh: Medium: Low: Passed: Unknown: Started  version codeReport Password CopyScan StatusStatic ScanDynamic ScanManual Scan%%%Vulnerability Details'
