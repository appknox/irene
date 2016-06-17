ENUMS =

  PLATFORM:
    UNKNOWN: -1
    ANDROID: 0
    IOS: 1
    WINDOWS: 2
    BLACKBERRY: 3
    FIREFOX: 4

  SOURCE:
    UNKNOWN: -1
    UPLOAD: 0
    STORE: 1
    SCM: 2

  RISK:
    UNKNOWN: -1
    NONE: 0
    LOW: 1
    MEDIUM: 2
    HIGH: 3

  ANALYSIS:
    UNKNOWN: -1
    ERROR: 0
    WAITING: 1
    RUNNING: 2
    COMPLETED: 3

  OFFER:
    UNKNOWN: -1
    NONE: 0
    CUSTOM: 2

  NOTIFY:
    UNKNOWN: -1
    INFO: 0
    SUCCESS: 2
    WARNING: 3
    ALERT: 4
    ERROR: 5

  DYNAMIC_STATUS:
    UNKNOWN: -1
    NONE: 0
    BOOTING: 1
    READY: 2
    SHUTTING_DOWN: 3

  MANUAL:
    UNKNOWN: -1
    NONE: 0
    REQUESTED: 1
    ASSESSING: 2
    DONE: 3

  COLLABORATION_ROLE:
    UNKNOWN: -1
    ADMIN: 0
    MANAGER: 1
    READ_ONLY: 2

  SUBMISSION_STATUS:
    UNKNOWN: 0
    PREPARE_DOWNLOAD: 1
    DOWNLOAD_FAILED: 2
    PERPARE_VALIDATE: 4
    VALIDATED: 5
    VALIDATE_FAILED: 6


# Populate `CHOICES`
for enumName, enumValues of ENUMS
  choices = []
  for key, value of enumValues
    choices.push {key: key, value: value}
  ENUMS[enumName]['CHOICES'] = choices

`export default ENUMS;`
