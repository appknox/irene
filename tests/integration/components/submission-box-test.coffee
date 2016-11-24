`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'submission-box', 'Integration | Component | submission box', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{submission-box}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#submission-box}}
      template block text
    {{/submission-box}}
  """

  assert.equal @$().text().trim(), 'template block text'
