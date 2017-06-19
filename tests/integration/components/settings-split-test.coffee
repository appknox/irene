`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'settings-split', 'Integration | Component | settings split', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{settings-split}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#settings-split}}
      template block text
    {{/settings-split}}
  """

  assert.equal @$().text().trim(), 'template block text'
