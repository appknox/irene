`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`

# This function receives the params `params, hash`
planDuration = (params) ->
  currentPlan = params[0]

  if currentPlan is ENUMS.PAYMENT_DURATION.MONTHLY
    "monthly"
  else if currentPlan is ENUMS.PAYMENT_DURATION.QUARTERLY
    "quarterly"
  else if currentPlan is ENUMS.PAYMENT_DURATION.HALFYEARLY
    "halfYearly"
  else
    "yearly"

PlanDurationHelper = Ember.Helper.helper planDuration

`export { planDuration }`

`export default PlanDurationHelper`
