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


  assert.equal @$().text().trim(), "SettingsStatic ScanDynamic ScanManual ScanScanning : %Requested  Scan DetailsPDF ReportSeverity LevelCritical: High: Medium: Low: Passed: Unknown: Started  version codeReport Password CopyDo you also want to run API Scan?We will record all network traffic made by the app and run the API scan for web vulnerabilities. API scan currently does not support apps that employ SSL pinning. API scan performs multiple automated tests that may result in denial of service or loss of data. Do not select YES if the app is configured to use a production API server or if the app employs SSL pinning.You do not have any API Filter set, click on settings below and set the API filterEdit filters here: SettingsYesNoSubscribe to continueYou haven't subcribed yet, do you want to Subscribe?YesNo"
