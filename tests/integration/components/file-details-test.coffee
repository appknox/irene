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

  assert.equal @$().text().trim(), "SettingsStatic ScanDynamic ScanManual ScanScanning : %Requested  Scan DetailsPDF ReportSeverity LevelCriticalHighMediumLowPassedUnknownStarted  version codeReport Password CopyRun API ScanYou need to also run Dynamic Scan to initiate the API ScanRun Dynamic & API ScanCancelDo you also want to run API Scan?We will record all network traffic made by the app and run the API scan for web vulnerabilities. API scan currently does not support apps that employ SSL pinning.Run API ScanContinue with Dynamic ScanDo you also want to run API Scan? API scan performs multiple automated tests that may result in denial of service or loss of data. Do not select YES if the app is configured to use a production API server or if the app employs SSL pinning.API Scanner URL FilterEnter the API endpoint to scan: eg. api.appknox.com. Do not specify the scheme (http://...), port (:443/...) & path (.../users)Save Filter+ ADD NEW URLAre you sure you want to remove from url filters?CancelOkStart API ScanCancelSubscribe to continueYou haven't subscribed yet, do you want to Subscribe?YesNoManual ScanDo you want to request for a manual scan?YesNoVulnerability DetailsAll ScansStaticDynamicManualAPIno scans found"
