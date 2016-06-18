ENUMS =

  PLATFORM:
    ANDROID: 0
    IOS: 1
    WINDOWS: 2
    BLACKBERRY: 3
    FIREFOX: 4

  SOURCE:
    UPLOAD: 0
    STORE: 1
    SCM: 2

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
    PREPARE_DOWNLOAD: 0
    DOWNLOAD_FAILED: 1
    PREPARE_VALIDATE: 2
    VALIDATED: 3
    VALIDATE_FAILED: 4
    ANALYSING: 5


# Populate `CHOICES`
for enumName, enumValues of ENUMS
  choices = []
  enumValues['UNKNOWN'] = -1
  for key, value of enumValues
    choices.push {key: key, value: value}
  ENUMS[enumName]['CHOICES'] = choices

`export default ENUMS;`
