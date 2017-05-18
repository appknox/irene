`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'file-header', 'Integration | Component | file header', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{file-header}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#file-header}}
      template block text
    {{/file-header}}
  """

  assert.equal @$().text().trim(), 'template block text'
