`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'team-list', 'Integration | Component | team list', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{team-list}}"""

  assert.equal @$().text().trim(), ''
