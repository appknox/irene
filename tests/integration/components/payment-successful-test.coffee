`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'payment-successful', 'Integration | Component | payment successful', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{payment-successful}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#payment-successful}}
      template block text
    {{/payment-successful}}
  """

  assert.equal @$().text().trim(), 'template block text'
