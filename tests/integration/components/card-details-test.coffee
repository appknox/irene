`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'card-details', 'Integration | Component | card details', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{card-details}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#card-details}}
      template block text
    {{/card-details}}
  """

  assert.equal @$().text().trim(), 'template block text'
