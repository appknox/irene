`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'img-logo', 'Integration | Component | img logo', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 2

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{img-logo}}"""

  assert.equal @$().text().trim(), ''

  # Template block usage:
  @render hbs """
    {{#img-logo}}
      template block text
    {{/img-logo}}
  """

  assert.equal @$().text().trim(), ''
