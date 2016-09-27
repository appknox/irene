`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'project-details', 'Integration | Component | project details', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{project-details}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#project-details}}
      template block text
    {{/project-details}}
  """

  assert.equal @$().text().trim(), 'template block text'
