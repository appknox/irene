import Service from '@ember/service';
import ENV from 'irene/config/environment';

// https://github.com/ember-cli/ember-ajax/blob/c178c5e28a316a23cd1da5736c0e29621d838cb1/addon/-private/utils/url-helpers.ts#L55
const completeUrlRegex = /^(http|https)/;

export function isFullURL(url) {
  return !!url.match(completeUrlRegex);
}

function startsWithSlash(string) {
  return string.charAt(0) === '/';
}

function endsWithSlash(string) {
  return string.charAt(string.length - 1) === '/';
}


function removeLeadingSlash(string) {
  return string.substring(1);
}

function removeTrailingSlash(string) {
  return string.slice(0, -1);
}

function stripSlashes(path) {
  // make sure path starts with `/`
  if (startsWithSlash(path)) {
    path = removeLeadingSlash(path);
  }

  // remove end `/`
  if (endsWithSlash(path)) {
    path = removeTrailingSlash(path);
  }
  return path;
}


export default class BuildURL extends Service {
  host = ENV.host
  namespace = ENV.namespace;

  isFullURL(url) {
    return !!url.match(completeUrlRegex);
  }

  build(url, options = {}) {
    if (isFullURL(url)) {
      return url;
    }

    const urlParts = [];

    let host = options.host || this.host;
    if (host) {
      host = endsWithSlash(host) ? removeTrailingSlash(host) : host;
      urlParts.push(host);
    }

    let namespace = options.namespace || this.namespace;
    if (namespace) {
      // If host is given then we need to strip leading slash too( as it will be added through join)
      if (host) {
        namespace = stripSlashes(namespace);
      } else if (endsWithSlash(namespace)) {
        namespace = removeTrailingSlash(namespace);
      }

      // If the URL has already been constructed (presumably, by Ember Data), then we should just leave it alone
      const hasNamespaceRegex = new RegExp(`^(/)?${stripSlashes(namespace)}/`);
      if (!hasNamespaceRegex.test(url)) {
        urlParts.push(namespace);
      }
    }

    // *Only* remove a leading slash when there is host or namespace -- we need to maintain a trailing slash for
    // APIs that differentiate between it being and not being present
    if (startsWithSlash(url) && urlParts.length !== 0) {
      url = removeLeadingSlash(url);
    }
    urlParts.push(url);
    const finalurl = urlParts.join('/');

    if (isFullURL(finalurl)) {
      return finalurl;
    }

    if(finalurl.length && !startsWithSlash(finalurl)) {
      return '/' + finalurl;
    }

    return finalurl;
  }
}
