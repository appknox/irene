`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'api-filter', 'Integration | Component | api filter', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{api-filter}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#api-filter}}
      template block text
    {{/api-filter}}
  """

  assert.equal @$().text().trim(), 'template block text'
