`import Ember from 'ember'`
`import config from '../config/environment';`


PricingController = Ember.Controller.extend

  model: (->
    @store.all "pricing"
  ).property()

`export default PricingController`
