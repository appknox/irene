`import Ember from 'ember'`

StatComponentComponent = Ember.Component.extend

  stat: (->
    @get('store').find 'stat', 1
  ).property()

`export default StatComponentComponent`
