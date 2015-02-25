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

  PRICING:
    UNKNOWN: -1
    TIME_LIMIT: 0
    SCAN_LIMIT: 1

  OFFER:
    UNKNOWN: -1
    NONE: 0
    FIRST_TIME: 1
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

`export default ENUMS;`
