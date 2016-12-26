`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'project-preferences', 'Integration | Component | project preferences', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{project-preferences}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#project-preferences}}
      template block text
    {{/project-preferences}}
  """

  assert.equal @$().text().trim(), 'template block text'
