`import OnboardOutlet from 'ember-onboarding/components/onboard-outlet';`
`import ENV from 'irene/config/environment';`

IreneOnboardComponent = OnboardOutlet.extend
  createData: (->

    tours = @get 'onboard'

    tours.createStep 'url-input', 'Please enter your store URL here and click `Submit`'
    tours.createStep 'app-upload', 'Or, You can also upload an app here'

    tours.createTour ENV.ONBOARD.scanApp, ['url-input', 'app-upload']

  ).on "init"

`export default IreneOnboardComponent`

