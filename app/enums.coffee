ENUMS =

  PLATFORM:
    ANDROID: 0
    IOS: 1
    WINDOWS: 2
    BLACKBERRY: 3
    FIREFOX: 4

  RISK:
    NONE: 0
    LOW: 1
    MEDIUM: 2
    HIGH: 3
    CRITICAL: 4

  ANALYSIS:
    ERROR: 0
    WAITING: 1
    RUNNING: 2
    COMPLETED: 3

  OFFER:
    NONE: 0
    CUSTOM: 2

  NOTIFY:
    INFO: 0
    SUCCESS: 2
    WARNING: 3
    ALERT: 4
    ERROR: 5

  DYNAMIC_STATUS:
    NONE: 0
    BOOTING: 1
    READY: 2
    SHUTTING_DOWN: 3
    DOWNLOADING: 4
    INSTALLING: 5
    LAUNCHING: 6
    HOOKING: 7

  MANUAL:
    NONE: 0
    REQUESTED: 1
    ASSESSING: 2
    DONE: 3

  COLLABORATION_ROLE:
    ADMIN: 0
    MANAGER: 1
    READ_ONLY: 2

  SUBMISSION_STATUS:
    DOWNLOAD_PREPARE: 0
    DOWNLOADING: 1
    DOWNLOAD_FAILED: 2
    VALIDATE_PREPARE: 3
    VALIDATING: 4
    VALIDATE_FAILED: 5
    ANALYZE_PREPARE: 6
    ANALYZING: 7

  SUBMISSION_SOURCE:
    UPLOAD: 0
    STORE: 1
    SCM: 2

  VULNERABILITY_TYPE:
    STATIC: 1
    DYNAMIC: 2
    MANUAL: 3
    API: 4

  PAYMENT_DURATION:
    MONTHLY: 1
    QUARTERLY: 3
    HALFYEARLY: 6
    YEARLY: 10

  PAYMENT_SOURCE:
    PAYPAL: 1
    STRIPE_MANUAL: 2
    BANK_TRANSFER: 3
    MANUAL: 4
    STRIPE_RECURRING: 5

  DEVICE_TYPE:
    NO_PREFERENCE: 0
    PHONE_REQUIRED: 1
    TABLET_REQUIRED: 2

  PRODUCT:
    APPKNOX: 0
    DEVKNOX: 1

  MFA_METHOD:
    NONE: 0
    TOTP: 1

  OWASP_CATEGORIES:
    M1: 1
    M2: 2
    M3: 3
    M4: 4
    M5: 5
    M6: 6
    M7: 7
    M8: 8
    M9: 9
    M10: 10
    A1: 11
    A2: 12
    A3: 13
    A4: 14
    A5: 15
    A6: 16
    A7: 17
    A8: 18
    A9: 19
    A10: 20

# Populate `CHOICES`
for enumName, enumValues of ENUMS
  choices = []
  values = []
  enumValues['UNKNOWN'] = -1
  for key, value of enumValues
    choices.push {key: key, value: value}
    values.push value
  ENUMS[enumName]['CHOICES'] = choices
  ENUMS[enumName]['VALUES'] = values

`export default ENUMS;`
