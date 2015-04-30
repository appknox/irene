`import OnboardOutlet from 'ember-onboarding/components/onboard-outlet';`
`import ENV from 'irene/config/environment';`

IreneOnboardComponent = OnboardOutlet.extend
  createData: (->

    tours = @get 'onboard'

    tours.createStep 'url-input', 'Please enter your store URL here and click `Submit`.'
    tours.createStep 'app-upload', 'Or, You can also upload an app here.'
    tours.createStep 'projects', 'Your projects will appear here.'
    tours.createStep 'view-detail', 'Click this area to view your scan details.'
    # `sd` is shorthand for `Scan Detail`
    tours.createStep 'sd-overview', 'Here is an overview of your project.'
    tours.createStep 'sd-action-buttons', 'View all files in this project, download PDF report, request a manual assessment here.'
    tours.createStep 'sd-analyses', 'This is where all your vulnerablities appear.'
    tours.createStep 'sd-dynamic', 'This is where you do a dynamic scan.'

    tours.createTour ENV.TOUR.newScan, ['url-input', 'app-upload']
    tours.createTour ENV.TOUR.scanResult, ['projects', 'view-detail']
    tours.createTour ENV.TOUR.scanDetail, ['sd-overview', 'sd-action-buttons', 'sd-analyses', 'sd-dynamic']
    tours.createTour ENV.TOUR.dashboard, ['url-input', 'app-upload', 'projects', 'view-detail']

  ).on "init"

`export default IreneOnboardComponent`
