`import OnboardOutlet from 'ember-onboarding/components/onboard-outlet';`

IreneOnboardComponent = OnboardOutlet.extend
  createData: (->

    tours = @get 'onboard'

    tours.createStep 'step1', 'this is the text for step 1'
    tours.createStep 'step2', 'this is the text for step 2'
    tours.createStep 'step3', 'this is the text for step 3'

    tours.createTour 'Basic Tour 1', ['step1', 'step2', 'step3']
    tours.createTour 'Demo Tour 2', ['step3', 'step2', 'step1']

  ).on "init"

`export default IreneOnboardComponent`

