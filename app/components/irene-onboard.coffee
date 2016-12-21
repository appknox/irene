`import OnboardOutlet from 'ember-onboarding/components/onboard-outlet';`
`import ENV from 'irene/config/environment';`

IreneOnboardComponent = OnboardOutlet.extend
  createData: (->
    tours = @get 'onboard'
    return if !tours
    tours.createStep 'submit-url', 'Please enter your Android/Windows store URL here and click on `Submit URL`'
    tours.createStep 'upload-app', 'Or, You can also upload an app here'
    tours.createStep 'project', 'You can view your projects here after uploading'

    # `sd` is shorthand for `Scan Detail`

    tours.createStep 'sd-overview', 'Here is an overview of your project.'
    tours.createStep 'sd-action-buttons', 'View all files in this project, download PDF report, request a manual assessment here.'
    tours.createStep 'sd-analyses', 'This is where all your vulnerablities appear.'
    tours.createStep 'sd-dynamic', 'This is where you do a dynamic scan.'

    tours.createTour ENV.TOUR.newScan, ['submit-url', 'upload-app', 'project']
    tours.createTour ENV.TOUR.scanDetail, ['sd-overview', 'sd-action-buttons', 'sd-analyses', 'sd-dynamic']
  ).on "init"

`export default IreneOnboardComponent`
