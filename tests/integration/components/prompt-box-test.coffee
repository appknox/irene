`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'prompt-box', 'Integration | Component | prompt box', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{prompt-box}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#prompt-box}}
      template block text
    {{/prompt-box}}
  """

  assert.equal @$().text().trim(), 'template block text'
