`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'plan-details', 'Integration | Component | plan details', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{plan-details}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#plan-details}}
      template block text
    {{/plan-details}}
  """

  assert.equal @$().text().trim(), 'template block text'
