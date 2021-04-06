const CONSTANTS = {
  ANDROID_STORE_URL_RE: /(http(s?):\/\/play.google.com\/store\/apps\/details\?id=([A-Za-z].*))|(market:\/\/[A-Za-z].*)/,
  WINDOWS_STORE_URL_RE: /microsoft.com(.*)store\/p\/(.*)\/(.*)/
};

export const RISK_COLOR_CODE = {
  CRITICAL: '#EF4836',
  DANGER: '#FF8C00',
  WARNING: '#F5D76E',
  INFO: '#2CC2F8',
  SUCCESS: '#80C081',
  DEFAULT: '#6B6B6B'
}
//Configurable input constants
export const INPUT = {
  MIN_LENGTH: 3
};

// File details tag max limit
export const FILE_TAG_MAX_CHAR = 250;

export default CONSTANTS;
