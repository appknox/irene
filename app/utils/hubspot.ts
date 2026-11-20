export const HUBSPOT_SCRIPT_ID = 'hs-script-loader';

/**
 * Add the HubSpot conversations script for the given portal to the page.
 * Calling it again while the script is already on the page does nothing.
 *
 * @param doc - The document to add the script to
 * @param portalId - The HubSpot portal id (public, part of the script URL)
 */
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
