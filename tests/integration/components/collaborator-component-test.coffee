`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'collaborator-component', 'Integration | Component | collaborator component', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{collaborator-component}}"""



  assert.equal @$().text().trim(), 'CollaboratorsAdd CollaboratorAdd Collaborator to projectREAD_ONLYMANAGERADMINAdd Collaborator'
