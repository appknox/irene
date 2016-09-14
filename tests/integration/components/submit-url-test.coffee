`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'submit-url', 'Integration | Component | submit url', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{submit-url}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#submit-url}}
      template block text
    {{/submit-url}}
  """

  assert.equal @$().text().trim(), 'template block text'
