`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'overall-report', 'Integration | Component | overall report', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{overall-report}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#overall-report}}
      template block text
    {{/overall-report}}
  """

  assert.equal @$().text().trim(), 'template block text'
