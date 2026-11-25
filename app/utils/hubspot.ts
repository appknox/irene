export const HUBSPOT_SCRIPT_ID = 'hs-script-loader';

export const injectHubspotChatScript = (doc: Document, portalId: string) => {
  if (doc.getElementById(HUBSPOT_SCRIPT_ID)) {
    return;
  }

  const script = doc.createElement('script');

  script.id = HUBSPOT_SCRIPT_ID;
  script.async = true;
  script.defer = true;
  script.src = `https://js.hs-scripts.com/${encodeURIComponent(portalId)}.js`;

  doc.body.appendChild(script);
};
