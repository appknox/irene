`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'common-issues', 'Integration | Component | common issues', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{common-issues}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#common-issues}}
      template block text
    {{/common-issues}}
  """

  assert.equal @$().text().trim(), 'template block text'
