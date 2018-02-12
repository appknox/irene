`import Ember from 'ember'`

CommonIssuesComponent = Ember.Component.extend

  stat: (->
    @get('store').find 'stat', 1
  ).property()

`export default CommonIssuesComponent`
