`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'password-reset', 'Integration | Component | password reset', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{password-reset}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#password-reset}}
      template block text
    {{/password-reset}}
  """

  assert.equal @$().text().trim(), 'template block text'
