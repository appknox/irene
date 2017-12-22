`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'activity-log', 'Integration | Component | activity log', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{activity-log}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#activity-log}}
      template block text
    {{/activity-log}}
  """

  assert.equal @$().text().trim(), 'template block text'
