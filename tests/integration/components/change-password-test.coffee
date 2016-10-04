`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'change-password', 'Integration | Component | change password', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{change-password}}"""

  assert.equal @$().text().trim(), 'Account SettingCurrent PasswordNew PasswordConfirm PasswordChange Password'
