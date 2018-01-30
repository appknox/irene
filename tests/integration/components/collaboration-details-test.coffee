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



  assert.equal @$().text().trim(), 'Missing translation: undefinedChange RoleDeveloperManagerMissing translation: adminremoveAre you sure you want to remove this team from collaboration?Please enter the team name which you want to remove from collaborationremove'
