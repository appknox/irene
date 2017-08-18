`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'magic-bell', 'Integration | Component | magic bell', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{magic-bell}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#magic-bell}}
      template block text
    {{/magic-bell}}
  """

  assert.equal @$().text().trim(), 'template block text'
