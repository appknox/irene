`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'jira-account', 'Integration | Component | jira account', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{jira-account}}"""

  assert.equal @$().text().trim(), 'Integrate JIRAAre you sure you want to revoke JIRA Integration?CancelOk'
