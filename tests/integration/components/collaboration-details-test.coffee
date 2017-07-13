`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'collaboration-details', 'Integration | Component | collaboration details', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{collaboration-details}}"""



  assert.equal @$().text().trim(), 'MembersChange RoleREAD_ONLYMANAGERADMINremove'
