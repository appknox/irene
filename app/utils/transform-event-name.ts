/**
 * Transform event names from CSB format to PostHog snake_case format
 *
 * CSB uses human-readable format: "Report Download", "Dynamic Scan Button"
 * PostHog prefers snake_case: "report_download", "dynamic_scan_button"
 *
 * This transformer ensures consistent event naming across providers.
 *
 * @param csbEventName - Event name in CSB format (human-readable with spaces)
 * @returns Event name in snake_case format for PostHog
 *
 * @example
 * transformEventName("Report Download") // => "report_download"
 * transformEventName("Dynamic Scan Button Click") // => "dynamic_scan_button_click"
 * transformEventName("Add Team Member") // => "add_team_member"
 */
export function transformEventName(csbEventName: string): string {
  return csbEventName
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-z0-9_]/g, '') // Remove any non-alphanumeric chars except underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
}
