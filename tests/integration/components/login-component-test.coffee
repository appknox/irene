`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'login-component', 'Integration | Component | login component', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{login-component}}"""

  assert.equal @$().text().trim(), 'Sign InSecurity fanatics at your serviceForgot Password?LOGIN'
