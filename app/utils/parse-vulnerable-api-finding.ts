/* eslint-disable no-control-regex */
import { load as yamlLoad } from 'js-yaml';

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
  description: string;
  url: string;
  request: VulnerableApiRequest;
  response: VulnerableApiResponse;
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
    try {
      const finding = parseVulnerableApiFindingBlock(block);

      if (finding) {
        vulnerableApiFindings.push(finding);
      }
    } catch (error) {
      // Log error but continue processing other blocks
      console.warn(`Failed to parse block: ${error}`);
    }
  });

  return vulnerableApiFindings;
}

/**
 * Splits the content into blocks based on double or triple newlines.
 * @param content - The content to split.
 * @returns An array of strings, each representing a block of the content.
 */
function splitVulnerableApiFindingIntoBlocks(content: string): string[] {
  const rawBlocks = content.split(/\n{2,3}/);
  const validBlocks: string[] = [];

  for (const block of rawBlocks) {
    const lines = block.split('\n');
    const firstLine = lines[0];
    const result = processFirstLine(firstLine);

    // Check if the block meets the criteria
    const isValidBlock = result || firstLine?.startsWith('confidence:');

    if (isValidBlock) {
      // If it's a valid block, add it as a new entry
      validBlocks.push(block);
    } else if (validBlocks.length > 0) {
      // If it's not a valid block, append it to the previous block
      validBlocks[validBlocks.length - 1] += '\n' + block;
    } else {
      // If it's the first block and invalid, still add it to start the list
      validBlocks.push(block);
    }
  }

  return validBlocks;
}

/**
 * Processes the first line of a block to set the description of the finding.
 * @param lines - The lines of the block.
 * @param finding - The VulnerableApiFinding object to update.
 */
function processFirstLine(
  firstLine: string | undefined
): { description?: string; url?: string } | undefined {
  if (!firstLine) {
    return undefined;
  }

  const colonIndex = firstLine.indexOf(': ');
  const genericUrlRegex =
    /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9.-]+(:\d+)?(\/[^\s]*)?$/;

  if (colonIndex === -1) {
    return;
  }

  const beforeColon = firstLine.substring(0, colonIndex).trim();
  const afterColon = firstLine.substring(colonIndex + 2).trim();

  // Check if 'beforeColon' matches the URL pattern
  const urlMatch = genericUrlRegex.exec(beforeColon);

  if (urlMatch) {
    return { url: beforeColon, description: afterColon || undefined };
  } else {
    return { description: afterColon };
  }
}

/**
 * Parses a block of text into a `VulnerableApiFinding` object.
 * @param block - The text block to parse.
 * @returns A `VulnerableApiFinding` object parsed from the block.
 */
function parseVulnerableApiFindingBlock(
  block: string
): VulnerableApiFinding | null {
  try {
    // Extract the description (first line) and the rest of the YAML
    const lines = block.split('\n');

    // Process the first line to set the description and URL
    const firstLine = processFirstLine(lines[0]);

    let yamlContent = lines.slice(1).join('\n');

    yamlContent = yamlContent
      .replace(/\\n/g, '\n') // Convert \n to newline
      .replace(/\\r/g, '\r') // Convert \r to carriage return
      .replace(/\\t/g, '\t'); // Convert \t to tab

    // Parse the YAML content
    const parsed = yamlLoad(yamlContent) as Omit<
      VulnerableApiFinding,
      'description' | 'url'
    >;

    // Combine the description with the parsed YAML
    const finalObject = { ...firstLine, ...parsed };

    if (Object.keys(finalObject).length !== 0) {
      return finalObject as VulnerableApiFinding;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(`Failed to parse YAML content: ${error}`);
  }
}

export function indentHTML(html: string): string {
  // Remove existing whitespace between tags
  const formatted = html.trim().replace(/>\s+</g, '><');

  // Track indentation level
  let indent = 0;
  const tab = '  '; // 2 spaces for indentation
  let result = '';
  let inComment = false;

  // Elements that don't need newlines
  const inlineElements = new Set([
    'span',
    'em',
    'strong',
    'i',
    'b',
    'br',
    'img',
  ]);

  // Process each character
  for (let i = 0; i < formatted.length; i++) {
    const char = formatted[i];

    // Check for comment start
    if (char === '<' && formatted.slice(i, i + 4) === '<!--') {
      inComment = true;
      result += '\n' + formatted.slice(i, formatted.indexOf('-->', i) + 3);
      i = formatted.indexOf('-->', i) + 2;
      continue;
    }

    // Skip processing if we're in a comment
    if (!inComment) {
      // Handle opening tags
      if (char === '<' && formatted[i + 1] !== '/') {
        // Get tag name
        let tagName = '';
        let j = i + 1;
        while (
          j < formatted.length &&
          formatted[j] !== ' ' &&
          formatted[j] !== '>'
        ) {
          tagName += formatted[j];
          j++;
        }

        // Add newline and indent for block elements
        if (!inlineElements.has(tagName.toLowerCase())) {
          result += '\n' + tab.repeat(indent);
        }
        result += char;
        indent++;
      }
      // Handle closing tags
      else if (char === '<' && formatted[i + 1] === '/') {
        indent--;
        // Get tag name
        let tagName = '';
        let j = i + 2;
        while (
          j < formatted.length &&
          formatted[j] !== ' ' &&
          formatted[j] !== '>'
        ) {
          tagName += formatted[j];
          j++;
        }

        // Add newline and indent for block elements
        if (!inlineElements.has(tagName.toLowerCase())) {
          result += '\n' + tab.repeat(indent);
        }
        result += char;
      }
      // Normal character
      else {
        result += char;
      }
    }
  }

  return result;
}
