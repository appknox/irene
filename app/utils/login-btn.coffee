BUTTON_LOGIN_MAIN = "#btn-login-main"

loginBtn =

  setSigningIn: ->
    $loginBtn = $ BUTTON_LOGIN_MAIN
    $loginBtn.attr "disabled", true
    $loginBtn.html "Signing in..."

  restoreSignIn: ->
    $loginBtn = $ BUTTON_LOGIN_MAIN
    $loginBtn.html "Sign In"
    $loginBtn.removeAttr "disabled"

`export default loginBtn`
