`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'namespace-modal', 'Integration | Component | namespace modal', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{namespace-modal}}"""

  assert.equal @$().text().trim(), 'Add NamespaceAdd Namespace'
