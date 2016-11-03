`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'test-credentials', 'Integration | Component | test credentials', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{test-credentials}}"""



  assert.equal @$().text().trim(), 'Test CredentialsEmail / UsernamePasswordSave Credentials'
