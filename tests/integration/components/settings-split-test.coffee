`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'settings-split', 'Integration | Component | settings split', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{settings-split}}"""

  assert.equal @$().text().trim(), 'GeneralSecurityNamespaceAdd NamespaceAdd NamespaceAdd NamespaceLanguageEnglish日本語JIRA IntegrationIntegrate JIRAAre you sure you want to revoke JIRA Integration?CancelOkGitHub IntegrationIntegrate GitHubAre you sure you want to revoke Github Integration?CancelOk'
