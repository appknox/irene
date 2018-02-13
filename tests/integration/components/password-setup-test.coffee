`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'password-setup', 'Integration | Component | password setup', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{password-setup}}"""

  assert.equal @$().text().trim(), 'Security fanatics at your serviceSet Your PasswordSet Password'
