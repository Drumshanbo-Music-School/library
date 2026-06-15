#!/usr/bin/env node

/**
 * append-to-catalog-books.js
 * Appends enriched book entries to web-app/public/data/catalog-books.json
 *
 * Usage:
 *   node append-to-catalog-books.js <input-json-file>
 *   node append-to-catalog-books.js --stdin < entries.json
 */

const fs = require('fs');
const path = require('path');

// Paths
const CATALOG_PATH = path.join(__dirname, 'web-app/public/data/catalog-books.json');

/**
 * Read and parse the catalog
 */
function readCatalog() {
  try {
    const content = fs.readFileSync(CATALOG_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading catalog: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Write the catalog back to file
 */
function writeCatalog(catalog) {
  try {
    const content = JSON.stringify(catalog, null, 2);
    fs.writeFileSync(CATALOG_PATH, content, 'utf-8');
    console.log(`✓ Catalog updated: ${CATALOG_PATH}`);
  } catch (error) {
    console.error(`Error writing catalog: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validate a book entry has required fields
 */
function validateEntry(entry, index) {
  const required = ['id', 'type', 'title', 'authors'];
  const missing = required.filter(field => !entry[field]);

  if (missing.length > 0) {
    console.error(`Entry ${index + 1}: Missing required fields: ${missing.join(', ')}`);
    return false;
  }

  if (!Array.isArray(entry.authors)) {
    console.error(`Entry ${index + 1}: 'authors' must be an array`);
    return false;
  }

  if (entry.type !== 'Book') {
    console.error(`Entry ${index + 1}: 'type' must be "Book"`);
    return false;
  }

  // Validate ID format (book-XXX)
  if (!/^book-\d{3}$/.test(entry.id)) {
    console.error(`Entry ${index + 1}: 'id' must match format "book-XXX" (got: ${entry.id})`);
    return false;
  }

  return true;
}

/**
 * Append entries to catalog
 */
function appendEntries(entries) {
  if (!Array.isArray(entries)) {
    entries = [entries];
  }

  console.log(`\nProcessing ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}...\n`);

  // Validate all entries
  const validEntries = entries.filter((entry, index) => validateEntry(entry, index));

  if (validEntries.length === 0) {
    console.error('No valid entries to append.');
    process.exit(1);
  }

  if (validEntries.length < entries.length) {
    console.warn(`Warning: ${entries.length - validEntries.length} invalid entries skipped.\n`);
  }

  // Read catalog
  const catalog = readCatalog();

  // Check for duplicate IDs
  const existingIds = new Set(catalog.items.map(item => item.id));
  const duplicates = validEntries.filter(entry => existingIds.has(entry.id));

  if (duplicates.length > 0) {
    console.error('Duplicate IDs found:');
    duplicates.forEach(entry => console.error(`  - ${entry.id}`));
    console.error('\nPlease ensure all new entries have unique IDs.');
    process.exit(1);
  }

  // Append entries
  catalog.items.push(...validEntries);

  // Update metadata
  catalog.metadata.totalItems = catalog.items.length;
  catalog.metadata.lastUpdated = getTodayDate();

  // Write back
  writeCatalog(catalog);

  // Summary
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✓ Added ${validEntries.length} ${validEntries.length === 1 ? 'entry' : 'entries'}`);
  console.log(`✓ Total items: ${catalog.metadata.totalItems}`);
  console.log(`✓ Last updated: ${catalog.metadata.lastUpdated}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // Show added IDs
  console.log('Added Books:');
  validEntries.forEach(entry => {
    console.log(`  ${entry.id}: ${entry.title} - ${entry.authors.join(', ')}`);
  });
  console.log();
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(`
Usage:
  node append-to-catalog-books.js <input-json-file>
  node append-to-catalog-books.js --stdin < entries.json
  echo '{"id":"book-999",...}' | node append-to-catalog-books.js --stdin

Examples:
  node append-to-catalog-books.js assets/enriched_batch_book_001-020.json
  cat new_books.json | node append-to-catalog-books.js --stdin
`);
    process.exit(1);
  }

  let input;

  // Read from stdin
  if (args[0] === '--stdin') {
    try {
      input = fs.readFileSync(0, 'utf-8');
    } catch (error) {
      console.error(`Error reading stdin: ${error.message}`);
      process.exit(1);
    }
  }
  // Read from file
  else {
    const inputFile = args[0];
    if (!fs.existsSync(inputFile)) {
      console.error(`File not found: ${inputFile}`);
      process.exit(1);
    }
    try {
      input = fs.readFileSync(inputFile, 'utf-8');
    } catch (error) {
      console.error(`Error reading file: ${error.message}`);
      process.exit(1);
    }
  }

  // Parse JSON
  let entries;
  try {
    entries = JSON.parse(input);
  } catch (error) {
    console.error(`Invalid JSON: ${error.message}`);
    process.exit(1);
  }

  // Append entries
  appendEntries(entries);
}

// Run
main();
