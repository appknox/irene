const GOOGLE_PLAYSTORE_DOMAIN = 'play.google.com';
const APPLE_APPSTORE_DOMAIN = 'apps.apple.com';
const ERROR_MESSAGE = 'URL should have valid Playstore or Appstore Domain';

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
          const appStoreRegex = /^\/([^/]+)\/app\/[^/]+\/id([^/]+)$/;
          const match = url.pathname.match(appStoreRegex);

          if (match) {
            return true;
          } else {
            return 'Appstore url should be valid, the expected format is : https://apps.apple.com/{country_code}/app/{app_slug}/id{app_id}';
          }
        }
      }
    } catch {
      return ERROR_MESSAGE;
    }
  };
}

export default {};
