`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'team-overview', 'Integration | Component | team overview', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{team-overview}}"""

  assert.equal @$().text().trim(), 'OwnerCreatedDelete TeamAre you sure you want to delete this team?Please enter the team name which you want to deleteDelete Team'
