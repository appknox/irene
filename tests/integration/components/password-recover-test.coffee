`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'password-recover', 'Integration | Component | password recover', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{password-recover}}"""

  assert.equal @$().text().trim(), 'Recover your passwordSecurity fanatics at your serviceRecoverLogin?'
