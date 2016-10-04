`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'test-credentails', 'Integration | Component | test credentails', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{test-credentails}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#test-credentails}}
      template block text
    {{/test-credentails}}
  """

  assert.equal @$().text().trim(), 'template block text'
