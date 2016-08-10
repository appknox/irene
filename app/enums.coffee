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

  PAYMENT_DURATION:
    MONTH: 1
    YEAR: 2

  VULNERABILITY_TYPE:
    STATIC: 1
    DYNAMIC: 2
    MANUAL: 3

  PAYMENT_DURATION:
    MONTHLY: 1
    YEARLY: 2


# Populate `CHOICES`
for enumName, enumValues of ENUMS
  choices = []
  enumValues['UNKNOWN'] = -1
  for key, value of enumValues
    choices.push {key: key, value: value}
  ENUMS[enumName]['CHOICES'] = choices

`export default ENUMS;`
