`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'recent-issues', 'Integration | Component | recent issues', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{recent-issues}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#recent-issues}}
      template block text
    {{/recent-issues}}
  """

  assert.equal @$().text().trim(), 'template block text'
