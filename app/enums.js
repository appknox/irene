const ENUMS = {

  PLATFORM: {
    ANDROID: 0,
    IOS: 1,
    WINDOWS: 2,
    BLACKBERRY: 3,
    FIREFOX: 4
  },

  RISK: {
    NONE: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  },

  ANALYSIS: {
    ERROR: 0,
    WAITING: 1,
    RUNNING: 2,
    COMPLETED: 3
  },

  OFFER: {
    NONE: 0,
    CUSTOM: 2
  },

  NOTIFY: {
    INFO: 0,
    SUCCESS: 2,
    WARNING: 3,
    ALERT: 4,
    ERROR: 5
  },

  DYNAMIC_STATUS: {
    ERROR: -1,
    NONE: 0,
    INQUEUE: 1,
    BOOTING: 2,
    DOWNLOADING: 3,
    INSTALLING: 4,
    LAUNCHING: 5,
    HOOKING: 6,
    READY: 7,
    SHUTTING_DOWN: 8,
    COMPLETED: 9
  },

  MANUAL: {
    NONE: 0,
    REQUESTED: 1,
    ASSESSING: 2,
    DONE: 3
  },
  THRESHOLD: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  },

  ORGANIZATION_ROLES: {
    MEMBER: 0,
    OWNER: 1,
    ADMIN: 2
  },

  SUBMISSION_STATUS: {
    DOWNLOAD_PREPARE: 0,
    DOWNLOADING: 1,
    DOWNLOAD_FAILED: 2,
    VALIDATE_PREPARE: 3,
    VALIDATING: 4,
    VALIDATE_FAILED: 5,
    ANALYZE_PREPARE: 6,
    ANALYZING: 7
  },

  SUBMISSION_SOURCE: {
    UPLOAD: 0,
    STORE: 1,
    SCM: 2
  },

  VULNERABILITY_TYPE: {
    STATIC: 1,
    DYNAMIC: 2,
    MANUAL: 3,
    API: 4
  },

  PAYMENT_DURATION: {
    MONTHLY: 1,
    QUARTERLY: 3,
    HALFYEARLY: 6,
    YEARLY: 10
  },

  DEVICE_TYPE: {
    NO_PREFERENCE: 0,
    PHONE_REQUIRED: 1,
    TABLET_REQUIRED: 2
  },

  PRODUCT: {
    APPKNOX: 0,
    DEVKNOX: 1
  },

  MFA_METHOD: {
    NONE: 0,
    TOTP: 1,
    HOTP: 2,
  },

  APP_ACTION: {
    NO_PREFERENCE: 0,
    HALT: 1,
    PROCEED: 2
  },

  APP_ENV: {
    NO_PREFERENCE: 0,
    STAGING: 1,
    PRODUCTION: 2
  },

  ATTACK_VECTOR: {
    NETWORK: "N",
    ADJACENT: "A",
    LOCAL: "L",
    PHYSICAL: "P"
  },

  ATTACK_COMPLEXITY: {
    LOW: "L",
    HIGH: "H"
  },

  PRIVILEGES_REQUIRED: {
    NONE: "N",
    LOW: "L",
    HIGH: "H"
  },

  IMPACTS: {
    NONE: "N",
    LOW: "L",
    HIGH: "H"
  },

  USER_INTERACTION: {
    NOT_REQUIRED: "N",
    REQUIRED: "R"
  },

  SCOPE: {
    UNCHANGED: "U",
    CHANGED: "C"
  },

  CONFIDENTIALITY_IMPACT: {
    NONE: "N",
    LOW: "L",
    HIGH: "H"
  },

  INTEGRITY_IMPACT: {
    NONE: "N",
    LOW: "L",
    HIGH: "H"
  },

  AVAILABILITY_IMPACT: {
    NONE: "N",
    LOW: "L",
    HIGH: "H"
  },

  ANALYSIS_STATUS: {
     ERROR: 0,
     WAITING: 1,
     RUNNING: 2,
     COMPLETED: 3
   },

  SCAN_STATUS: {
     ERROR: 0,
     WAITING: 1,
     RUNNING: 2,
     COMPLETED: 3
   },

  REGULATORY_STATUS: {
    NONE: 0,
    SHOW: 1,
    HIDE: 2,
  }
};

// Populate `CHOICES`
for (let enumName in ENUMS) {
  const enumValues = ENUMS[enumName];
  const base_choices = [];
  const base_values = [];
  const choices = [];
  const values = [];
  for (let key in enumValues) {
    const value = enumValues[key];
    base_choices.push({key, value});
    base_values.push(value);
    choices.push({key, value});
    values.push(value);
  }
  enumValues['UNKNOWN'] = -1;
  choices.push({key: 'UNKNOWN',value: enumValues['UNKNOWN']});
  values.push(enumValues['UNKNOWN']);
  ENUMS[enumName]['BASE_CHOICES'] = base_choices;
  ENUMS[enumName]['BASE_VALUES'] = base_values;
  ENUMS[enumName]['CHOICES'] = choices;
  ENUMS[enumName]['VALUES'] = values;
}

export default ENUMS;
