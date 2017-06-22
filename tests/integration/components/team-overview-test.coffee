`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'team-overview', 'Integration | Component | team overview', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{team-overview}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#team-overview}}
      template block text
    {{/team-overview}}
  """

  assert.equal @$().text().trim(), 'template block text'
