import { NestedKeyOf } from './types';

/**
 * Represents a vulnerable API request.
 */
export interface VulnerableApiRequest {
  body: string;
  headers: Record<string, string>;
  method: string;
  params: Record<string, string>;
  url: string;
  cookies: Record<string, string>;
}

/**
 * Represents a vulnerable API response.
 */
export interface VulnerableApiResponse {
  headers: Record<string, string>;
  reason: string;
  status_code: number;
  text: string;
  url: string;
  cookies: Record<string, string>;
}

/**
 * Represents a finding of a vulnerability in an API.
 */
export interface VulnerableApiFinding {
  severity: string;
  confidence: string;
  cvssScore: number | null;
  cvssMetrics: string | null;
  description: string;
  url: string;
  request: VulnerableApiRequest;
  response: VulnerableApiResponse;
}

type VulnerabilityApiFindingSection = NestedKeyOf<VulnerableApiFinding>;

/**
 * Initializes a `VulnerableApiFinding` with default values.
 * @returns A `VulnerableApiFinding` object with default values.
 */
function initializeVulnerableApiFinding(): VulnerableApiFinding {
  return {
    request: {
      body: '',
      headers: {},
      method: '',
      params: {},
      url: '',
      cookies: {},
    },
    response: {
      headers: {},
      reason: '',
      status_code: 0,
      text: '',
      url: '',
      cookies: {},
    },
    severity: '',
    confidence: '',
    url: '',
    description: '',
    cvssScore: null,
    cvssMetrics: null,
  };
}

/**
 * Determines if a given content string contains information indicative of a vulnerable API finding.
 * @param content - The content string to check.
 * @returns `true` if the content contains vulnerability indicators, otherwise `false`.
 */
export function isVulnerableApiFinding(content: string): boolean {
  const severityPattern =
    '\\bseverity:\\s*?(PASSED|LOW|MEDIUM|HIGH|CRITICAL|UNKNOWN)\\b';

  const confidencePattern = '\\bconfidence:\\s*?(LOW|HIGH|MEDIUM)\\b';

  const methodPattern =
    '\\bmethod:\\s*?(GET|POST|PUT|DELETE|TRACE|HEAD|CONNECT|OPTIONS|PATCH)\\b';

  const vulnerabilityPattern = new RegExp(
    `(${severityPattern}|${confidencePattern}|${methodPattern})`,
    'i'
  );

  return content.length > 0 && vulnerabilityPattern.test(content);
}

/**
 * Parses a content string and extracts vulnerable API findings from it.
 * @param content - The content string to parse.
 * @returns An array of `VulnerableApiFinding` objects extracted from the content.
 */
export function parseVulnerableApiFinding(
  content: string
): VulnerableApiFinding[] {
  const vulnerableApiFindings: VulnerableApiFinding[] = [];

  const vulnerableApiFindingBlocks =
    splitVulnerableApiFindingIntoBlocks(content);

  vulnerableApiFindingBlocks.forEach((block) => {
    const finding = parseVulnerableApiFindingBlock(block);

    // Validate and push only if valid
    if (isValidVulnerableApiFinding(finding)) {
      vulnerableApiFindings.push(finding);
    }
  });

  return vulnerableApiFindings;
}

/**
 * Validates if a `VulnerableApiFinding` object is valid.
 * @param finding - The `VulnerableApiFinding` object to validate.
 * @returns `true` if the finding is valid, otherwise `false`.
 */
function isValidVulnerableApiFinding(finding: VulnerableApiFinding): boolean {
  return !!(finding.severity || finding.confidence);
}

/**
 * Splits the content into blocks based on double or triple newlines.
 * @param content - The content to split.
 * @returns An array of strings, each representing a block of the content.
 */
function splitVulnerableApiFindingIntoBlocks(content: string): string[] {
  return content.split(/\n{2,3}/);
}

/**
 * Parses a block of text into a `VulnerableApiFinding` object.
 * @param block - The text block to parse.
 * @returns A `VulnerableApiFinding` object parsed from the block.
 */
function parseVulnerableApiFindingBlock(block: string): VulnerableApiFinding {
  const lines = block.split('\n');
  const finding = initializeVulnerableApiFinding();

  let currentSection: VulnerabilityApiFindingSection = 'confidence';
  let currentBuffer: string | null = null;
  let currentKey: string | null = null;

  // Process the first line separately to handle initial URL or description
  processFirstLine(lines, finding);

  lines.forEach((line) => {
    const parsedLine = parseLine(line);

    if (parsedLine) {
      const [key, value] = parsedLine;

      if (currentKey && currentBuffer) {
        // If a previous key exists, update it with the accumulated buffer
        updateFindingField(finding, currentKey, currentBuffer, currentSection);
        currentBuffer = null; // Reset buffer after updating
        currentKey = null; // Reset key after updating
      }

      if (key) {
        if (currentKey && currentBuffer) {
          // Continue accumulating the value if the same key is detected
          currentBuffer += `\n${value}`;
        } else {
          // If a new key is detected, update section and headers
          const { updatedSection } = updateVulnerableApiFinding(
            finding,
            key,
            value,
            currentSection
          );

          // Update current section and headers
          if (updatedSection !== currentSection) {
            currentSection = updatedSection;
          }

          currentKey = key; // Track the current key
          currentBuffer = value; // Start accumulating value
        }
      }
    } else if (currentBuffer) {
      // Continue accumulating the value if no new key is detected
      currentBuffer += `\n${line}`;
    }
  });

  // Finalize any remaining buffer
  if (currentBuffer && currentKey) {
    updateFindingField(finding, currentKey, currentBuffer, currentSection);
  }

  return finding;
}

/**
 * Parses a single line of text into a key-value pair.
 * @param line - The line of text to parse.
 * @returns A tuple containing the key and value as strings, or `null` if the line cannot be parsed.
 */
function parseLine(line: string): [string, string] | null {
  const [key, ...valueParts] = line.split(':');

  if (!key) {
    return null;
  }

  // Split the line into key and value parts based on the first colon
  const colonIndex = line.indexOf(':');

  // If there's no colon, return null as it's not a valid key-value pair
  if (colonIndex === -1) {
    return null;
  }

  const value = valueParts.join(':').trim();

  return [key.trim().toLowerCase(), value];
}

/**
 * Processes the first line of a block to set the description of the finding.
 * @param lines - The lines of the block.
 * @param finding - The `VulnerableApiFinding` object to update.
 */
function processFirstLine(
  lines: string[],
  finding: VulnerableApiFinding
): void {
  if (lines[0]) {
    const firstLine = lines[0].trim();
    const colonIndex = firstLine.indexOf(': ');
    const beforeColon = firstLine.substring(0, colonIndex).trim();

    const genericUrlRegex =
      /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9.-]+(:\d+)?(\/[^\s]*)?$/;

    const match = beforeColon.match(genericUrlRegex);

    if (match) {
      finding.url = firstLine.substring(0, colonIndex).trim();
    }

    if (!firstLine.startsWith('confidence:') && colonIndex !== -1) {
      finding.description = firstLine.substring(colonIndex + 2).trim();
    }
  }
}

/**
 * Updates the current section of the finding based on the key.
 * @param key - The key indicating the section to update.
 * @param currentSection - The current section of the finding.
 * @returns The updated section of the finding.
 */
function updateSection(
  key: string,
  currentSection: VulnerabilityApiFindingSection
): VulnerabilityApiFindingSection {
  const sectionMap: Record<string, VulnerabilityApiFindingSection> = {
    request: 'request',
    response: 'response',
    headers: currentSection.startsWith('response')
      ? 'response.headers'
      : 'request.headers',
    params: 'request.params',
    severity: 'severity',
    confidence: 'confidence',
    url: currentSection.startsWith('response') ? 'response.url' : 'request.url',
    method: 'request.method',
    body: 'request.body',
    text: 'response.text',
    status_code: 'response.status_code',
    reason: 'response.reason',
    cookies: currentSection.startsWith('response')
      ? 'response.cookies'
      : 'request.cookies',
    cvss_base: 'cvssScore',
    cvss_metrics_humanized: 'cvssMetrics',
  };

  return sectionMap[key] || currentSection;
}

/**
 * Updates a specific field in the `VulnerableApiFinding` based on the current section.
 * @param finding - The `VulnerableApiFinding` object to update.
 * @param key - The key indicating the field to update.
 * @param value - The value to set.
 * @param currentSection - The current section of the finding.
 */
function updateFindingField(
  finding: VulnerableApiFinding,
  key: string,
  value: string,
  currentSection: VulnerabilityApiFindingSection
): void {
  const isRequestSection = currentSection.startsWith('request');
  const isResponseSection = currentSection.startsWith('response');
  const isParamsSection = currentSection.startsWith('request.params');

  if (key === 'body' && isRequestSection) {
    finding.request.body = value;
  } else if (key === 'url') {
    if (isRequestSection || isParamsSection) {
      finding.request.url = value;
    } else if (isResponseSection) {
      finding.response.url = value;
    }
  } else if (key === 'method' && isRequestSection) {
    finding.request.method = value;
  } else if (key === 'status_code' && isResponseSection) {
    finding.response.status_code = Number(value);
  } else if (key === 'reason' && isResponseSection) {
    finding.response.reason = value;
  } else if (key === 'text' && isResponseSection) {
    finding.response.text = value;
  } else if (key === 'severity') {
    finding.severity = value;
  } else if (key === 'confidence') {
    finding.confidence = value;
  } else if (key === 'cvss_base') {
    finding.cvssScore = Number(value);
  } else if (key === 'cvss_metrics_humanized') {
    finding.cvssMetrics = value;
  }
}

/**
 * Updates the headers in the given section of the finding object.
 *
 * @param currentSection - The section of the finding to update, which can be either 'request.headers' or 'response.headers'.
 * @param finding - The vulnerable API finding object.
 * @param key - The header key to update or add.
 * @param value - The value to set for the specified header key.
 */
function updateFindingHeaders(
  currentSection: VulnerabilityApiFindingSection,
  finding: VulnerableApiFinding,
  key: string,
  value: string
): void {
  const currentHeaders =
    currentSection === 'request.headers'
      ? finding.request.headers
      : currentSection === 'response.headers'
        ? finding.response.headers
        : null;

  if (currentHeaders) {
    currentHeaders[key] = value;
  }
}

/**
 * Updates the cookies in the given section of the finding object.
 *
 * @param currentSection - The section of the finding to update, which can be either 'request.cookies' or 'response.cookies'.
 * @param finding - The vulnerable API finding object.
 * @param key - The cookie key to update or add.
 * @param value - The value to set for the specified cookie key.
 */
function updateFindingCookies(
  currentSection: VulnerabilityApiFindingSection,
  finding: VulnerableApiFinding,
  key: string,
  value: string
): void {
  const currentCookies =
    currentSection === 'request.cookies'
      ? finding.request.cookies
      : currentSection === 'response.cookies'
        ? finding.response.cookies
        : null;

  if (currentCookies) {
    currentCookies[key] = value;
  }
}

/**
 * Updates the parameters in the request section of the finding object.
 *
 * @param currentSection - The section of the finding to update, which should be 'request.params'.
 * @param finding - The vulnerable API finding object.
 * @param key - The parameter key to update or add.
 * @param value - The value to set for the specified parameter key.
 */
function updateFindingParams(
  currentSection: VulnerabilityApiFindingSection,
  finding: VulnerableApiFinding,
  key: string,
  value: string
): void {
  const currentParams =
    currentSection === 'request.params' ? finding.request.params : null;

  if (currentParams) {
    currentParams[key] = value;
  }
}

/**
 * Updates a field in a vulnerable API finding and returns the updated section.
 *
 * @param finding - The vulnerable API finding object to update.
 * @param key - The key of the field to update.
 * @param value - The new value for the specified field key.
 * @param currentSection - The current section of the finding to update, which determines where the update occurs.
 * @returns An object containing the updated section of the finding.
 */
function updateVulnerableApiFinding(
  finding: VulnerableApiFinding,
  key: string,
  value: string,
  currentSection: VulnerabilityApiFindingSection
): {
  updatedSection: VulnerabilityApiFindingSection;
} {
  currentSection = updateSection(key, currentSection);

  // Handle empty objects for headers, cookies, and params
  if (
    ['headers', 'cookies', 'params'].includes(key) &&
    (value === '' || value === '{}')
  ) {
    return { updatedSection: currentSection };
  }

  updateFindingField(finding, key, value, currentSection);

  // Handle headers separately based on the current section
  if (currentSection.endsWith('headers')) {
    updateFindingHeaders(currentSection, finding, key, value);
  }

  // Handle cookies separately based on the current section
  if (currentSection.endsWith('cookies')) {
    updateFindingCookies(currentSection, finding, key, value);
  }

  // Handle params separately based on the current section
  if (currentSection.endsWith('params')) {
    updateFindingParams(currentSection, finding, key, value);
  }

  return {
    updatedSection: currentSection,
  };
}
