`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'jira-project', 'Integration | Component | jira project', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{jira-project}}"""



  assert.equal @$().text().trim(), "JIRA IntegrationNo PreferenceLoading...Are you sure you want to remove JIRA Project?CancelOk"
