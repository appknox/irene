`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'modal-card', 'Integration | Component | modal card', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{modal-card}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#modal-card}}
      template block text
    {{/modal-card}}
  """

  assert.equal @$().text().trim(), 'template block text'
