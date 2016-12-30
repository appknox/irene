`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'irene-onboard', 'Integration | Component | irene onboard', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{irene-onboard}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#irene-onboard}}
      template block text
    {{/irene-onboard}}
  """

  assert.equal @$().text().trim(), 'template block text'
