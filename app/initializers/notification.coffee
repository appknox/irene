initialize = (application) ->
  application.inject 'route', 'notify', 'service:notification-messages'
  application.inject 'component', 'notify', 'service:notification-messages'
  application.inject 'authenticator', 'notify', 'service:notification-messages'

NotificationInitializer =
  name: 'notification'
  initialize: initialize

`export {initialize}`
`export default NotificationInitializer`
