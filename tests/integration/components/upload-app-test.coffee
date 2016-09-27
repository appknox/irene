`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'upload-app', 'Integration | Component | upload app', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{upload-app}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#upload-app}}
      template block text
    {{/upload-app}}
  """

  assert.equal @$().text().trim(), 'template block text'
