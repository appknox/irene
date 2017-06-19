`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'auth-mfa', 'Integration | Component | auth mfa', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{auth-mfa}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#auth-mfa}}
      template block text
    {{/auth-mfa}}
  """

  assert.equal @$().text().trim(), 'template block text'
