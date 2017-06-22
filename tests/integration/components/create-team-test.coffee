`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'create-team', 'Integration | Component | create team', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{create-team}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#create-team}}
      template block text
    {{/create-team}}
  """

  assert.equal @$().text().trim(), 'template block text'
