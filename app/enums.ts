const ENUMS = {
  PLATFORM: {
    ANDROID: 0,
    IOS: 1,
    WINDOWS: 2,
    BLACKBERRY: 3,
    FIREFOX: 4,
  },

  RISK: {
    NONE: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
  },

  ANALYSIS: {
    ERROR: 0,
    WAITING: 1,
    RUNNING: 2,
    COMPLETED: 3,
  },

  ANALYSIS_OVERRIDE_CRITERIA: {
    CURRENT_FILE: 'current_file' as const,
    ALL_FUTURE_UPLOAD: 'all_future_upload' as const,
  },

  OFFER: {
    NONE: 0,
    CUSTOM: 2,
  },

  NOTIFY: {
    INFO: 0,
    SUCCESS: 2,
    WARNING: 3,
    ALERT: 4,
    ERROR: 5,
  },

  DYNAMIC_SCAN_STATUS: {
    NOT_STARTED: 0,
    PREPROCESSING: 1,
    PROCESSING_SCAN_REQUEST: 2,
    IN_QUEUE: 3,
    DEVICE_ALLOCATED: 4,
    CONNECTING_TO_DEVICE: 5,
    PREPARING_DEVICE: 6,
    INSTALLING: 7,
    CONFIGURING_API_CAPTURE: 8,
    HOOKING: 9,
    LAUNCHING: 10,
    READY_FOR_INTERACTION: 11,
    DOWNLOADING_AUTO_SCRIPT: 12,
    CONFIGURING_AUTO_INTERACTION: 13,
    INITIATING_AUTO_INTERACTION: 14,
    AUTO_INTERACTION_COMPLETED: 15,
    STOP_SCAN_REQUESTED: 16,
    SCAN_TIME_LIMIT_EXCEEDED: 17,
    SHUTTING_DOWN: 18,
    CLEANING_DEVICE: 19,
    RUNTIME_DETECTION_COMPLETED: 20,
    ANALYZING: 21,
    ANALYSIS_COMPLETED: 22,
    TIMED_OUT: 23,
    ERROR: 24,
    CANCELLED: 25,
    TERMINATED: 26,
  },

  DYNAMIC_MODE: {
    MANUAL: 0,
    AUTOMATED: 1,
  },

  MANUAL: {
    NONE: 0,
    REQUESTED: 1,
    ASSESSING: 2,
    DONE: 3,
  },

  THRESHOLD: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
  },

  ORGANIZATION_ROLES: {
    MEMBER: 0,
    OWNER: 1,
    ADMIN: 2,
  },

  SUBMISSION_STATUS: {
    DOWNLOAD_PREPARE: 0,
    DOWNLOADING: 1,
    DOWNLOAD_FAILED: 2,
    VALIDATE_PREPARE: 3,
    VALIDATING: 4,
    VALIDATE_FAILED: 5,
    ANALYZE_PREPARE: 6,
    ANALYZING: 7,

    STORE_NOT_STARTED: 10100,
    STORE_VALIDATING_URL: 10101,
    STORE_URL_VALIDATION_FAILED: 10102,
    STORE_DOWNLOAD_PREPARE: 10103,
    STORE_DOWNLOADING: 10104,
    STORE_DOWNLOAD_FAILED: 10105,
    STORE_UPLOAD_PREPARE: 10106,
    STORE_UPLOADING: 10107,
    STORE_UPLOAD_FAILED: 10108,
  },

  SUBMISSION_SOURCE: {
    UPLOAD: 0,
    STORE: 1,
    SCM: 2,
  },

  VULNERABILITY_TYPE: {
    STATIC: 1,
    DYNAMIC: 2,
    MANUAL: 3,
    API: 4,
  },

  PAYMENT_DURATION: {
    MONTHLY: 1,
    QUARTERLY: 3,
    HALFYEARLY: 6,
    YEARLY: 10,
  },

  DS_MANUAL_DEVICE_SELECTION: {
    ANY_DEVICE: 0,
    SPECIFIC_DEVICE: 1,
  },

  DS_AUTOMATED_DEVICE_SELECTION: {
    ANY_DEVICE: 0,
    FILTER_CRITERIA: 1,
  },

  DS_DEVICE_TYPE: {
    NO_PREFERENCE: 0,
    PHONE_REQUIRED: 1,
    TABLET_REQUIRED: 2,
  },

  PRODUCT: {
    APPKNOX: 0,
    DEVKNOX: 1,
  },

  NOTIF_PRODUCT: {
    APPKNOX: 0,
    STOREKNOX: 1,
  },

  MFA_METHOD: {
    NONE: 0,
    TOTP: 1,
    HOTP: 2,
  },

  APP_ACTION: {
    NO_PREFERENCE: 0,
    HALT: 1,
    PROCEED: 2,
  },

  APP_ENV: {
    NO_PREFERENCE: 0,
    STAGING: 1,
    PRODUCTION: 2,
  },

  ATTACK_VECTOR: {
    NETWORK: 'N',
    ADJACENT: 'A',
    LOCAL: 'L',
    PHYSICAL: 'P',
  },

  ATTACK_COMPLEXITY: {
    LOW: 'L',
    HIGH: 'H',
  },

  PRIVILEGES_REQUIRED: {
    NONE: 'N',
    LOW: 'L',
    HIGH: 'H',
  },

  IMPACTS: {
    NONE: 'N',
    LOW: 'L',
    HIGH: 'H',
  },

  USER_INTERACTION: {
    NOT_REQUIRED: 'N',
    REQUIRED: 'R',
  },

  SCOPE: {
    UNCHANGED: 'U',
    CHANGED: 'C',
  },

  CONFIDENTIALITY_IMPACT: {
    NONE: 'N',
    LOW: 'L',
    HIGH: 'H',
  },

  INTEGRITY_IMPACT: {
    NONE: 'N',
    LOW: 'L',
    HIGH: 'H',
  },

  AVAILABILITY_IMPACT: {
    NONE: 'N',
    LOW: 'L',
    HIGH: 'H',
  },

  ANALYSIS_STATUS: {
    ERROR: 0,
    WAITING: 1,
    RUNNING: 2,
    COMPLETED: 3,
  },

  SCAN_STATUS: {
    ERROR: 0,
    WAITING: 1,
    RUNNING: 2,
    COMPLETED: 3,
  },

  REGULATORY_STATUS: {
    NONE: 0,
    SHOW: 1,
    HIDE: 2,
  },

  SK_AVAILABILITY: {
    VAPT: 0,
    APP_MONITORING: 1,
    NONE: 2,
  },

  SK_DISCOVERY: {
    AUTO: 0,
    MANUAL: 1,
  },

  SK_APPROVAL_STATUS: {
    PENDING_APPROVAL: 0,
    APPROVED: 1,
    REJECTED: 2,
  },

  SK_APP_STATUS: {
    INACTIVE: 0,
    ACTIVE: 1,
    ARCHIVED: 2,
  },

  DEPENDENCY_TYPE: {
    DEPENDENCIES: 1,
    PARENTS: 2,
  },

  SK_APP_MONITORING_STATUS: {
    PENDING: 0,
    SCANNED: 1,
    UNSCANNED: 2,
    NOT_FOUND: 3,
  },

  SK_ORGANIZATION_MEMBERSHIP_ROLES: {
    MEMBER: 1,
    COLLABORATOR: 2,
    ADMIN: 3,
    OWNER: 4,
  },

  SERVICE_NOW_TABLE_SELECTION: {
    SN_VUL_APP_VULNERABLE_ITEM: 1,
    SN_VUL_VULNERABLE_ITEM: 2,
  },

  PM_STATUS: {
    IN_PROGRESS: 0,
    COMPLETED: 1,
    FAILED: 2,
  },

  PM_REPORT_STATUS: {
    PENDING: 1,
    STARTED: 2,
    IN_PROGRESS: 3,
    COMPLETED: 4,
    FAILED: 5,
  },

  PM_ANALYSIS_STATUS: {
    IN_PROGRESS: 1,
    COMPLETED: 2,
    FAILED: 3,
  },

  PM_DANGER_PERMS_STATUS: {
    STARTED: 0,
    PENDING: 1,
    SUCCESS: 2,
    FAILED: 3,
  },

  PM_TRACKER_STATUS: {
    STARTED: 0,
    PENDING: 1,
    SUCCESS: 2,
    FAILED: 3,
  },
};

export const ENUMS_DISPLAY = {
  PLATFORM: {
    [ENUMS.PLATFORM.ANDROID]: 'Android',
    [ENUMS.PLATFORM.IOS]: 'iOS',
    [ENUMS.PLATFORM.WINDOWS]: 'Windows',
    [ENUMS.PLATFORM.BLACKBERRY]: 'Blackberry',
    [ENUMS.PLATFORM.FIREFOX]: 'Firefox',
  },
};

type ExtendedObject = {
  UNKNOWN: number;
  BASE_CHOICES: { key: string; value: string | number }[];
  BASE_VALUES: (string | number)[];
  CHOICES: { key: string; value: string | number }[];
  VALUES: (string | number)[];
};

type EnumType = {
  [key in keyof typeof ENUMS]: (typeof ENUMS)[key] & ExtendedObject;
};

// Populate `CHOICES`
const finalEnum = Object.entries(ENUMS).reduce(
  (acc, [enumName, enumValues]) => {
    const base_choices = [];
    const base_values = [];
    const choices = [];
    const values = [];

    for (const [key, value] of Object.entries(enumValues)) {
      base_choices.push({ key, value });
      base_values.push(value);
      choices.push({ key, value });
      values.push(value);
    }

    const UNKNOWN_VALUE = -1;

    choices.push({ key: 'UNKNOWN', value: UNKNOWN_VALUE });
    values.push(UNKNOWN_VALUE);

    return {
      ...acc,
      [enumName]: {
        ...enumValues,
        UNKNOWN: UNKNOWN_VALUE,
        BASE_CHOICES: base_choices,
        BASE_VALUES: base_values,
        CHOICES: choices,
        VALUES: values,
      },
    };
  },
  {} as EnumType
);

export default finalEnum;
