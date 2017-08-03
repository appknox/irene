`import { test, moduleForComponent } from 'ember-qunit'`
`import hbs from 'htmlbars-inline-precompile'`

moduleForComponent 'auth-mfa', 'Integration | Component | auth mfa', {
  integration: true
}

test 'it renders', (assert) ->
  assert.expect 1

  # Set any properties with @set 'myProperty', 'value'
  # Handle any actions with @on 'myAction', (val) ->

  @render hbs """{{auth-mfa}}"""

  assert.equal @$().text().trim(), 'Status: DisabledEnable MFAEnable Multi Factor AuthenticationMulti Factor Authentication adds an extra layer of security to your account. In addition to your username and password, you’ll need to enter a code generated on your phone.Set up using an appDownload one of these apps to get the OTP:For Android, iOS, and Blackberry: Google AuthenticatorFor Android & iOS: Duo MobileFor Windows Phone: AuthenticatorMulti Factor Authentication adds another layer of security to your account so if your password is compromised or stolen, only you can log in.Scan this barcode with your appAfter scanning the barcode image, the app will display a six-digit code that you can enter belowContinueCancelDisable Multi Factor AuthenticationIf you turn off Multi Factor Authentication, your account will only be protected by your password.To confirm, please enter the OTPContinueCancel'
