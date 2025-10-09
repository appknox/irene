const GOOGLE_PLAYSTORE_DOMAIN = 'play.google.com';
const ERROR_MESSAGE = 'Only Google PlayStore URLs are accepted';

export function validateStoreDomain() {
  return function (key: string, value: string) {
    if (value) {
      try {
        const url = new URL(value);

        return (
          [GOOGLE_PLAYSTORE_DOMAIN].includes(url.hostname) || ERROR_MESSAGE
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
      }
    } catch {
      return ERROR_MESSAGE;
    }
  };
}

export default {};
