`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'team-details', 'Integration | Component | team details', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{team-details}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#team-details}}
      template block text
    {{/team-details}}
  """

  assert.equal @$().text().trim(), 'template block text'
