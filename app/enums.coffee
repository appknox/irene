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

  APP_ACTION:
    NO_PREFERENCE: 0
    HALT: 1
    PROCEED: 2

  APP_ENV:
    NO_PREFERENCE: 0
    STAGING: 1
    PRODUCTION: 2

  OWASP_CATEGORIES:
    M1_2013: 1
    M2_2013: 2
    M3_2013: 3
    M4_2013: 4
    M5_2013: 5
    M6_2013: 6
    M7_2013: 7
    M8_2013: 8
    M9_2013: 9
    M10_2013: 10
    A1_2013: 11
    A2_2013: 12
    A3_2013: 13
    A4_2013: 14
    A5_2013: 15
    A6_2013: 16
    A7_2013: 17
    A8_2013: 18
    A9_2013: 19
    A10_2013: 20



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
