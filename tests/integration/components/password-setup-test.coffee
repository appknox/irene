`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'password-setup', 'Integration | Component | password setup', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{password-setup}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#password-setup}}
      template block text
    {{/password-setup}}
  """

  assert.equal @$().text().trim(), 'template block text'
