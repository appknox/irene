/**
 * Represents a vulnerable API request.
 */
export interface VulnerableApiRequest {
  body: string;
  headers: Record<string, string>;
  method: string;
  params: {
    key: string;
    token: string;
  };
  url: string;
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
}

type VulnerableApiFindingSection =
  | 'request'
  | 'response'
  | 'request-headers'
  | 'response-headers'
  | 'params'
  | 'other';

/**
 * Represents a finding of a vulnerability in an API.
 */
export interface VulnerableApiFinding {
  severity: string;
  confidence: string;
  description: string;
  request: VulnerableApiRequest;
  response: VulnerableApiResponse;
}

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
      params: { key: '', token: '' },
      url: '',
    },
    response: {
      headers: {},
      reason: '',
      status_code: 0,
      text: '',
      url: '',
    },
    severity: '',
    confidence: '',
    description: '',
  };
}

/**
 * Determines if a given content string contains information indicative of a vulnerable API finding.
 * @param content - The content string to check.
 * @returns `true` if the content contains vulnerability indicators, otherwise `false`.
 */
export function isVulnerableApiFinding(content: string): boolean {
  const vulnerabilityPattern = /(\bseverity\b|\bconfidence\b|\bmethod\b)/;

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
 * Splits the report content into blocks based on double or triple newlines.
 * @param report - The report content to split.
 * @returns An array of strings, each representing a block of the report.
 */
function splitVulnerableApiFindingIntoBlocks(report: string): string[] {
  return report.split(/\n{2,3}/);
}

/**
 * Parses a block of text into a `VulnerableApiFinding` object.
 * @param block - The text block to parse.
 * @returns A `VulnerableApiFinding` object parsed from the block.
 */
function parseVulnerableApiFindingBlock(block: string): VulnerableApiFinding {
  const lines = block.split('\n');
  const finding = initializeVulnerableApiFinding();

  let currentSection: VulnerableApiFindingSection = 'other';
  let currentHeaders: Record<string, string> | null = null;

  processFirstLine(lines, finding);

  lines.forEach((line) => {
    const parsedLine = parseLine(line);

    if (parsedLine) {
      const [key, value] = parsedLine;

      const { updatedSection, updatedHeaders } = updateVulnerableApiFinding(
        finding,
        key,
        value,
        currentSection,
        currentHeaders
      );

      // update the current section and headers
      currentSection = updatedSection;
      currentHeaders = updatedHeaders;
    }
  });

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

    const genericUrlRegex = /^http[s]?:\/\/[a-zA-Z0-9.-]+(:\d+)?\/[^\s:]+/;

    const match = firstLine.match(genericUrlRegex);

    if (match) {
      finding.request.url = finding.request.url = firstLine
        .substring(0, colonIndex)
        .trim();
    }

    if (!firstLine.startsWith('confidence:')) {
      if (colonIndex !== -1) {
        finding.description = firstLine.substring(colonIndex + 2).trim();
      }
    }
  }
}

/**
 * Updates the severity and confidence fields of the finding based on the key-value pair.
 * @param finding - The `VulnerableApiFinding` object to update.
 * @param key - The key indicating the type of information (`severity` or `confidence`).
 * @param value - The value to set.
 */
function updateFindingSeverityAndConfidence(
  finding: VulnerableApiFinding,
  key: string,
  value: string
): void {
  if (key === 'severity') {
    finding.severity = value;
  } else if (key === 'confidence') {
    finding.confidence = value;
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
  currentSection: VulnerableApiFindingSection
): VulnerableApiFindingSection {
  switch (key) {
    case 'request':
    case 'method':
      return 'request';

    case 'response':
    case 'reason':
    case 'text':
    case 'status_code':
      return 'response';

    case 'headers':
      return currentSection === 'response'
        ? 'response-headers'
        : 'request-headers';

    case 'params':
      return 'params';

    case 'severity':
    case 'confidence':
      return 'other';

    default:
      return currentSection;
  }
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
  currentSection: VulnerableApiFindingSection
): void {
  const isRequestSection = currentSection === 'request';
  const isResponseSection = currentSection === 'response';
  const isParamsSection = currentSection === 'params';

  if (key === 'body') {
    if (isRequestSection) {
      finding.request.body = value;
    } else if (isResponseSection) {
      finding.response.text = value;
    }
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
  }
}

/**
 * Updates the headers of the finding based on the current section.
 * @param currentHeaders - The current headers to update.
 * @param key - The key of the header.
 * @param value - The value of the header.
 */
function updateFindingHeaders(
  currentHeaders: Record<string, string> | null,
  key: string,
  value: string
): void {
  if (currentHeaders) {
    currentHeaders[key] = value;
  }
}

/**
 * Updates the parameters of the finding.
 * @param paramKey - The key of the parameter.
 * @param paramValue - The value of the parameter.
 * @param finding - The `VulnerableApiFinding` object to update.
 */
function updateFindingParams(
  paramKey: string,
  paramValue: string | undefined,
  finding: VulnerableApiFinding
): void {
  if (paramKey === 'key' || paramKey === 'token') {
    finding.request.params[paramKey] = paramValue || '';
  }
}

/**
 * Updates a `VulnerableApiFinding` based on the key-value pair and current section.
 * @param finding - The `VulnerableApiFinding` object to update.
 * @param key - The key indicating what to update.
 * @param value - The value to set.
 * @param currentSection - The current section of the finding.
 * @param currentHeaders - The current headers being processed.
 * @returns The updated section and headers.
 */
function updateVulnerableApiFinding(
  finding: VulnerableApiFinding,
  key: string,
  value: string,
  currentSection: VulnerableApiFindingSection,
  currentHeaders: Record<string, string> | null
): {
  updatedSection: VulnerableApiFindingSection;
  updatedHeaders: Record<string, string> | null;
} {
  updateFindingSeverityAndConfidence(finding, key, value);

  currentSection = updateSection(key, currentSection);

  updateFindingField(finding, key, value, currentSection);

  if (key === 'headers' && currentSection === 'request-headers') {
    currentHeaders = finding.request.headers;
  } else if (key === 'headers' && currentSection === 'response-headers') {
    currentHeaders = finding.response.headers;
  } else if (key === 'params') {
    currentSection = 'params';
  } else if (currentSection === 'params') {
    updateFindingParams(key, value, finding);
  } else if (
    currentSection === 'request-headers' ||
    currentSection === 'response-headers'
  ) {
    updateFindingHeaders(currentHeaders, key, value);
  }

  return { updatedSection: currentSection, updatedHeaders: currentHeaders };
}
