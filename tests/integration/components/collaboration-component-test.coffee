`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'collaboration-component', 'Integration | Component | collaboration component', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{collaboration-component}}"""



  assert.equal @$().text().trim(), 'CollaborationsAdd CollaborationAdd Collaboration to projectREAD_ONLYMANAGERADMINAdd Collaboration'
