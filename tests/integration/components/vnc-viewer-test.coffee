`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'vnc-viewer', 'Integration | Component | vnc viewer', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1


  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{vnc-viewer}}"""

  assert.equal @$().text().trim(), ''
