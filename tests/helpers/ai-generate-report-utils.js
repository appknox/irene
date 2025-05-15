import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// Columns for the sample report data
const AI_REPORT_COLUMNS = [
  {
    field: 'id',
    type: 'integer',
    label: 'Project ID',
  },
  {
    field: 'package_name',
    type: 'string',
    label: 'Namespace',
  },
  {
    field: 'platform',
    type: 'integer',
    label: 'Platform',
  },
  {
    field: 'last_file_created_on',
    type: 'datetime',
    label: 'Last File Created On',
  },
  {
    field: 'created_on',
    type: 'datetime',
    label: 'Created On',
  },
  {
    field: 'updated_on',
    type: 'datetime',
    label: 'Updated On',
  },
  {
    field: 'last_file__id',
    type: 'integer',
    label: 'Last File ID',
  },
  {
    field: 'last_file__name',
    type: 'string',
    label: 'App Name',
  },
  {
    field: 'last_file__version',
    type: 'string',
    label: 'App Version',
  },
  {
    field: 'last_file__version_code',
    type: 'string',
    label: 'App Version Code',
  },
  {
    field: 'last_file__is_static_done',
    type: 'boolean',
    label: 'SAST Status',
  },
  {
    field: 'last_file__is_dynamic_done',
    type: 'boolean',
    label: 'DAST Status',
  },
  {
    field: 'last_file__is_api_done',
    type: 'boolean',
    label: 'API Scan Status',
  },
  {
    field: 'last_file__submission__user__username',
    type: 'string',
    label: 'Last File Uploaded By',
  },
  {
    field: 'last_file__created_on',
    type: 'datetime',
    label: 'Last file Created on',
  },
  {
    field: 'last_file__updated_on',
    type: 'datetime',
    label: 'Last file Updated on',
  },
  {
    field: 'file_count',
    type: 'integer',
    label: 'File count',
  },
].map((column, idx) => {
  const is_default = idx === 0 || faker.datatype.boolean(0.5);

  return {
    is_default,
    ...column,
    name: column.label,
    val_field: column.field,
    field_type: column.type,
    selected: is_default,
  };
});

const PLATFORM_CHOICES = [
  ['Android', 0],
  ['iOS', 1],
];

/**
 * Generates a test dataset that resembles the project report data structure
 * @param {number} count - Number of data items to generate
 * @returns {Object} Complete data structure with columns, data, pagination and filters
 */
function generateTestData(count = 10, options = {}) {
  // Generate the data array based on columns
  const data = generateDataFromColumns(AI_REPORT_COLUMNS, count);

  // Create the complete data structure
  return {
    title: 'Project Report',
    columns: AI_REPORT_COLUMNS,
    data: data,
    pagination: {
      count: count,
      limit: count,
      offset: 0,
    },
    filter_details: generateFilterDetails(),
    ...options,
  };
}

/**
 * Generates filter details based on available columns
 * @param {Array} columns - Array of column objects (optional)
 * @returns {Array} Array of filter objects
 */
function generateFilterDetails(columns = null) {
  // Default filter fields if not provided
  const defaultFilterFields = [
    {
      field: 'id',
      label: 'Project ID',
      type: 'integer',
      is_nullable: false,
      is_related: false,
    },
    {
      field: 'package_name',
      label: 'Namespace',
      type: 'string',
      is_nullable: false,
      is_related: false,
    },
    {
      field: 'platform',
      label: 'Platform',
      type: 'integer',
      is_nullable: false,
      is_related: false,
      choices: PLATFORM_CHOICES,
    },
    {
      field: 'last_file_created_on',
      label: 'Last file created on',
      type: 'datetime',
      is_nullable: false,
      is_related: false,
    },
    {
      field: 'last_file__is_api_done',
      label: 'Last file API Scan Status',
      type: 'boolean',
      is_nullable: false,
      is_related: false,
    },
    {
      field: 'risk',
      label: 'Original Severity',
      type: 'integer',
      is_nullable: false,
      is_related: false,
      choices: [
        ['Unknown', -1],
        ['Passed', 0],
        ['Low', 1],
        ['Medium', 2],
        ['High', 3],
        ['Critical', 4],
      ],
    },
    {
      field: 'overridden_risk',
      label: 'Overridden Severity',
      type: 'integer',
      is_nullable: true,
      is_related: false,
      choices: [
        ['Unknown', -1],
        ['Passed', 0],
        ['Low', 1],
        ['Medium', 2],
        ['High', 3],
        ['Critical', 4],
      ],
    },
    {
      field: 'status',
      label: 'Status',
      type: 'integer',
      is_nullable: false,
      is_related: false,
      choices: [
        ['Unknown', -1],
        ['Error', 0],
        ['Not Started', 1],
        ['Running', 2],
        ['Completed', 3],
      ],
    },
    {
      field: 'cvss_base',
      label: 'CVSS Score',
      type: 'float',
      is_nullable: false,
      is_related: false,
    },
    {
      field: 'created_on',
      label: 'Created on',
      type: 'datetime',
      is_nullable: false,
      is_related: false,
    },
    {
      field: 'vulnerability__name',
      label: 'Vulnerability Name',
      type: 'string',
      is_nullable: false,
      is_related: false,
      filter_key: 'vulnerability__name_en',
      is_nested: true,
      parent_field: 'vulnerability',
      nested_field: 'name',
    },
  ];

  // If columns are provided, create filter fields based on them
  let filterFields = defaultFilterFields;

  if (columns) {
    // Get non-nested fields that make sense as filters
    const filterableFields = columns.filter(
      (col) =>
        !col.field.includes('__') &&
        ['string', 'integer', 'datetime'].includes(col.type)
    );

    // Select up to 4 filterable fields
    const selectedFields =
      filterableFields.length <= 4
        ? filterableFields
        : faker.helpers.arrayElements(filterableFields, 4);

    // Convert column definitions to filter fields
    filterFields = selectedFields.map((col) => {
      const field = {
        field: col.field,
        label: col.label,
        type: col.type,
        is_nullable: false,
        is_related: false,
      };

      // Add choices for platform field
      if (col.field === 'platform') {
        field.choices = PLATFORM_CHOICES;
      }

      return field;
    });
  }

  // Add additional filter fields for date fields
  const textFields = filterFields.filter((f) => f.type === 'string');
  const dateFields = filterFields.filter((f) => f.type === 'datetime');
  const integerFields = filterFields.filter((f) => f.type === 'integer');

  const otherFields = filterFields.filter(
    (f) => !['string', 'datetime', 'integer'].includes(f.type)
  );

  return [
    {
      id: faker.string.uuid() + '==',
      model_name: 'Other Data Types',
      has_filters: otherFields.length > 0,
      fields: otherFields,
    },
    {
      id: faker.string.uuid() + '==',
      model_name: 'String Data Type',
      has_filters: textFields.length > 0,
      fields: textFields,
    },
    {
      id: faker.string.uuid() + '==',
      model_name: 'Integer Data Type',
      has_filters: integerFields.length > 0,
      fields: integerFields,
    },
    {
      id: faker.string.uuid() + '==',
      model_name: 'Date Data Type',
      has_filters: dateFields.length > 0,
      fields: dateFields,
    },
  ];
}

/**
 * Advanced version that allows filtering by columns
 * @param {number} count - Number of data items to generate
 * @param {Array} customColumns - Optional array of column names to include (null for all)
 * @returns {Object} Complete data structure with selected columns, data, pagination and filters
 */
function generateCustomTestData(count = 10, customColumns = null) {
  // Filter columns if custom selection provided
  const columns = customColumns
    ? AI_REPORT_COLUMNS.filter((col) => customColumns.includes(col.field))
    : AI_REPORT_COLUMNS;

  // Generate the data array based on columns
  const data = generateDataFromColumns(columns, count);

  // Create the complete data structure
  return {
    title: 'Project Report',
    columns: columns,
    data: data,
    pagination: {
      count: count,
      limit: count,
      offset: 0,
    },
    filter_details: generateFilterDetails(columns),
  };
}

/**
 * Generates data specifically for the provided columns
 * @param {Array} columns - The columns to generate data for
 * @param {number} count - Number of data items to generate
 * @returns {Array} Array of data objects with only the specified columns
 */
function generateDataFromColumns(columns, count) {
  const data = [];
  const fieldNames = columns.map((col) => col.field);

  for (let i = 0; i < count; i++) {
    // Create date caches to ensure consistent dates within each item
    const dateMap = createDateMap();

    // Start with an empty item
    const item = {};

    // Track if we need a last_file object
    let needsLastFile = false;
    const lastFileFields = {};

    // Add fields based on column definitions
    for (const field of fieldNames) {
      if (field.startsWith('last_file__')) {
        // This is a nested field, collect it for the last_file object
        needsLastFile = true;
        const nestedField = field.replace('last_file__', '');
        lastFileFields[nestedField] = true;
      } else {
        // Add regular fields
        switch (field) {
          case 'id':
            item.id = faker.number.int({ min: 1, max: 300 });
            break;

          case 'package_name':
            item.package_name = generatePackageName();
            break;

          case 'platform':
            item.platform = faker.helpers.arrayElement(['Android', 'iOS']);
            break;

          case 'last_file_created_on':
            item.last_file_created_on = dateMap.lastFileCreatedOn;
            break;

          case 'created_on':
            item.created_on = dateMap.createdOn;
            break;

          case 'updated_on':
            item.updated_on = dateMap.updatedOn;
            break;

          case 'file_count':
            item.file_count = faker.number.int({ min: 1, max: 614 });
            break;

          default:
            // Handle any other fields by type if we need to add more
            break;
        }
      }
    }

    // If we need a last_file object, add it
    if (needsLastFile) {
      item.last_file = {};
      const statusTexts = ['Completed', 'Not Completed'];

      // Set up basic last_file properties that others depend on
      if (lastFileFields.name || !Object.keys(lastFileFields).length) {
        item.last_file.name = faker.company.name().split(' ')[0];
      }

      // Add the fields that were requested
      if (lastFileFields.id) {
        item.last_file.id = 1900 + faker.number.int({ min: 30, max: 50 });
      }

      if (lastFileFields.version) {
        item.last_file.version = generateVersion();
      }

      if (lastFileFields.version_code) {
        item.last_file.version_code = generateVersionCode();
      }

      if (lastFileFields.is_static_done) {
        item.last_file.is_static_done = faker.helpers.arrayElement(statusTexts);
      }

      if (lastFileFields.is_dynamic_done) {
        item.last_file.is_dynamic_done =
          faker.helpers.arrayElement(statusTexts);
      }

      if (lastFileFields.is_api_done) {
        item.last_file.is_api_done = faker.helpers.arrayElement(statusTexts);
      }

      if (lastFileFields.submission__user__username) {
        item.last_file.submission__user__username = 'example_username';
      }

      if (lastFileFields.created_on) {
        item.last_file.created_on = dateMap.lastFileCreatedOn;
      }

      if (lastFileFields.updated_on) {
        item.last_file.updated_on = dateMap.lastFileUpdatedOn;
      }
    }

    data.push(item);
  }

  return data;
}

/**
 * Creates a set of consistent dates for a single data item
 * @returns {Object} Object with formatted date strings
 */
function createDateMap() {
  // Base creation date between 2021 and now
  const createdOn = faker.date.between({
    from: '2021-01-01T00:00:00.000Z',
    to: new Date(),
  });

  // Last file created date after project creation
  const lastFileCreatedOn = faker.date.between({
    from: createdOn,
    to: new Date(),
  });

  // Last file updated after its creation
  const lastFileUpdatedOn = faker.date.between({
    from: lastFileCreatedOn,
    to: new Date(),
  });

  // Project updated date after last file creation
  const updatedOn = faker.date.between({
    from: lastFileCreatedOn,
    to: new Date(),
  });

  return {
    createdOn: formatDate(createdOn),
    lastFileCreatedOn: formatDate(lastFileCreatedOn),
    lastFileUpdatedOn: formatDate(lastFileUpdatedOn),
    updatedOn: formatDate(updatedOn),
  };
}

/**
 * Formats date to match sample data format
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return date.toISOString().replace('Z', '+00:00');
}

/**
 * Generates realistic package names
 * @returns {string} Package name in format like "com.example.app"
 */
function generatePackageName() {
  // Generate dynamic packages
  const patterns = [
    `com.${faker.word.noun().toLowerCase()}.${faker.word.adjective().toLowerCase()}`,
    `com.${faker.company.name().split(' ')[0].toLowerCase()}.app`,
    `org.${faker.word.noun().toLowerCase()}.${faker.word.noun().toLowerCase()}`,
    `io.${faker.internet.domainWord()}.${faker.internet.domainWord()}`,
    `com.${faker.internet.domainWord()}.${faker.company.buzzNoun().toLowerCase()}`,
  ];

  const packageName = faker.helpers.arrayElement(patterns);

  return Math.random() > 0.9 //NOSONAR
    ? `com.${faker.company.name().replace(/[^a-zA-Z0-9-]/g, '')}-app`
    : packageName;
}

/**
 * Generates realistic version strings
 * @returns {string} Version string like "1.2.3"
 */
function generateVersion() {
  // Base version patterns
  const patterns = [
    `${faker.number.int({ min: 1, max: 11 })}.${faker.number.int({ min: 0, max: 120 })}.${faker.number.int({ min: 0, max: 20 })}`,
    `${faker.number.int({ min: 1, max: 9 })}.${faker.number.int({ min: 0, max: 9 })}.${faker.number.int({ min: 0, max: 9 })}.${faker.number.int({ min: 0, max: 9 })}`,
    `${faker.number.int({ min: 1, max: 10 })}.${faker.number.int({ min: 0, max: 10 })}.${faker.number.int({ min: 0, max: 10 })} build ${faker.number.int({ min: 1, max: 100 })} ${faker.number.int({ min: 10000, max: 99999 })}`,
  ];

  return faker.helpers.arrayElement(patterns);
}

/**
 * Generates realistic version codes
 * @returns {string} Version code string
 */
function generateVersionCode() {
  const patterns = [
    String(faker.number.int({ min: 1, max: 9999 })),
    String(faker.number.int({ min: 10000, max: 99999 })),
    String(faker.number.int({ min: 100000000, max: 999999999 })),
  ];

  return faker.helpers.arrayElement(patterns);
}

/**
 * ================================================
 * Test utilities for AiReportingPreviewColumnValue component
 * ================================================
 */

function getNestedValue(obj, path) {
  const parts = path.split('__');
  let current = obj;
  let partsConsumed = 0;

  while (partsConsumed < parts.length) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return undefined; // Cannot traverse further
    }

    const currentPart = parts[partsConsumed];

    // 1. Try accessing the current part directly
    if (currentPart in current) {
      current = current[currentPart];
      partsConsumed++;

      continue; // Move to the next part
    }

    // 2. If direct access failed, try reconstructing the rest of the path
    const remainingPath = parts.slice(partsConsumed).join('__');

    if (remainingPath in current) {
      return current[remainingPath]; // Found the value using the reconstructed key
    }

    // 3. If both direct access and reconstructed path failed
    return undefined;
  }

  // If all parts were consumed individually
  return current;
}

function getColumnValue(data, column) {
  // Get the nested value from the data using the column's val_field
  const value = getNestedValue(data, column.val_field);

  // Format datetime values using dayjs
  if (column.field_type === 'datetime') {
    if (value) {
      return dayjs(value).format('MMM DD, YYYY');
    }

    return '';
  }

  // For all other types, return the value as is
  return value;
}

/**
 * Returns the truncated display value
 * @param {string} value - The original value
 * @param {boolean} isExpanded - Whether the display is expanded
 * @param {number} threshold - Character threshold (default: 1000)
 * @returns {string} The truncated or full value based on expansion state
 */
function getDisplayValue(
  colValue,
  column,
  isExpanded = false,
  threshold = 1000
) {
  const value = getColumnValue(colValue, column);
  const strValue = String(value || '');

  if (strValue.length <= threshold || isExpanded) {
    return strValue;
  }

  return strValue.substring(0, threshold) + '...';
}

export {
  generateTestData,
  generateCustomTestData,
  generateDataFromColumns,
  generateFilterDetails,
  AI_REPORT_COLUMNS,

  // Used for generating display values for columns in preview table
  getDisplayValue,
};
