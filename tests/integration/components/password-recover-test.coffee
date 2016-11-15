`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'password-recover', 'Integration | Component | password recover', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{password-recover}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#password-recover}}
      template block text
    {{/password-recover}}
  """

  assert.equal @$().text().trim(), 'template block text'
