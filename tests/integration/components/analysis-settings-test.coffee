`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'analysis-settings', 'Integration | Component | analysis settings', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{analysis-settings}}"""

  assert.equal @$().text().trim(), 'SHOW/HIDE Unknown Analysis'
