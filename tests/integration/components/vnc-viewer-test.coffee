`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'vnc-viewer', 'Integration | Component | vnc viewer', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1


  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{vnc-viewer}}"""

  assert.equal @$().text().trim(), 'Do you also want to run API Scan?We will record all network traffic made by the app and run the API scan for web vulnerabilities. API scan currently does not support apps that employ SSL pinning.  API scan performs multiple automated tests that may result in denial of service or loss of data. Do not select YES if the app is configured to use a production API server or if the app employs SSL pinning.YesNoAPI Scanner URL FilterEnter the API endpoint to scan: eg. api.appknox.com. Do not specify the scheme (http://...), port (:443/...) & path (.../users)add new urlSave Filter & Start Scan'
