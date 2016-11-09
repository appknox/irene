`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'namespace-component', 'Integration | Component | namespace component', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{namespace-component}}"""

  assert.equal @$().text().trim(), 'Add NamespaceAdd NamespaceAdd Namespace'
