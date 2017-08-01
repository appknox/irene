`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'team-member', 'Integration | Component | team member', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{team-member}}"""

  assert.equal @$().text().trim(), 'memberremoveAre you sure you want to remove this team member?Please enter the name of team member who you want to removeremove'
