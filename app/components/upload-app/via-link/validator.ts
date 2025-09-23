const GOOGLE_PLAYSTORE_DOMAIN = 'play.google.com';
const APPLE_APPSTORE_DOMAIN = 'apps.apple.com';
const ERROR_MESSAGE =
  'Only valid Google Play Store or Apple App Store URLs are accepted';

export function validateStoreDomain() {
  return function (key: string, value: string) {
    if (value) {
      try {
        const url = new URL(value);

        return (
          [GOOGLE_PLAYSTORE_DOMAIN, APPLE_APPSTORE_DOMAIN].includes(
            url.hostname
          ) || ERROR_MESSAGE
        );
      } catch {
        return ERROR_MESSAGE;
      }
    }

    return ERROR_MESSAGE;
  };
}

export function validateStorePathname() {
  return function (key: string, value: string) {
    try {
      if (value) {
        const url = new URL(value);

        if (url.host === GOOGLE_PLAYSTORE_DOMAIN) {
          const playStorePathnameRegex = /\/store\/apps\/details/;
          const playStoreSearchRegex = /[?&]id=([^&]+)/;
          const matchPathname = url.pathname.match(playStorePathnameRegex);
          const matchSearch = url.search.match(playStoreSearchRegex);

          if (matchPathname && matchSearch) {
            return true;
          } else {
            return 'Playstore url should be valid, the expected format is : https://play.google.com/store/apps/details?id={package_name}';
          }
        }

        if (url.host === APPLE_APPSTORE_DOMAIN) {
          const appStorePathnameRegex = /^\/[a-z]{2}\/app\/[^/]+\/id\d+$/;
          const matchPathname = url.pathname.match(appStorePathnameRegex);

          if (matchPathname) {
            return true;
          } else {
            return 'App Store URL should be valid. Expected format: https://apps.apple.com/{country_code}/app/{app_slug}/id{app_id}';
          }
        }
      }
    } catch {
      return ERROR_MESSAGE;
    }
  };
}

export default {};
