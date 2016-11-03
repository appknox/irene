`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'jira-user', 'Integration | Component | jira user', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{jira-user}}"""

  assert.equal @$().text().trim(), 'Jira HostUsernamePasswordIntegrate JIRA'
