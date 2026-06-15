# Book Catalog JSON Schema Documentation

## Overview

The `data/catalog-books.json` file contains a structured catalog of book items from the Drumshanbo Music Library. Each book follows a consistent schema with standardized fields, mirroring the structure of the CD catalog but with book-specific metadata.

## File Structure

```json
{
  "items": [...],
  "metadata": {...}
}
```

## Root Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | Array | Yes | Array of book item objects |
| `metadata` | Object | Yes | Metadata about the catalog |

## Metadata Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `totalItems` | Number | Yes | Total number of items in the catalog |
| `type` | String | Yes | Type of items ("Book") |
| `source` | String | Yes | Source of the catalog data |
| `dataVersion` | String | Yes | Version number of the data schema |
| `lastUpdated` | String | Yes | ISO date of last update (YYYY-MM-DD) |

## Book Item Object Schema

All book items have the following standardized fields. Fields marked as "Required" must always be present, even if the value is `null` or an empty array.

### Core Fields (Always Required)

| Field | Type | Required | Default if Missing | Description |
|-------|------|----------|-------------------|-------------|
| `id` | String | Yes | - | Unique identifier (format: "book-XXX") |
| `type` | String | Yes | "Book" | Item type |
| `title` | String | Yes | - | Book title |
| `authors` | Array[String] | Yes | [] | Array of author names (see Author Parsing section) |
| `description` | String | Yes | "" | Detailed description of the book (2-4 sentences) |
| `publisher` | String | Yes | "Self-published" | Publisher name |
| `year` | String | Yes | "Unknown" | Publication year (can be specific year or decade) |
| `image` | String | Yes | - | Filename of cover image (format: "book-XXX.jpg") |

### ISBN and Edition Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `isbn` | String \| null | No | null | ISBN-13 identifier (format: 978-1-234567-89-0) |
| `isbn10` | String \| null | No | null | ISBN-10 identifier (if applicable) |
| `edition` | String \| null | No | null | Edition information (e.g., "2nd Edition", "Revised Edition") |

### Physical and Content Details

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `pageCount` | Number \| null | No | null | Total number of pages |
| `format` | String \| null | No | null | Physical format (Hardcover, Paperback, Spiral-bound, etc.) |
| `language` | String | No | "English" | Primary language of the book |

### Classification and Categorization

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `subjects` | Array[String] | No | [] | Subject tags (e.g., "Irish Traditional Music", "Dance Tunes") |
| `categories` | Array[String] | No | [] | Broader categories (e.g., "Music History", "Reference") |

### Content-Specific Metadata

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `tuneCount` | Number \| null | No | null | Number of tunes (for tune collections and reference books) |
| `contentType` | Array[String] | No | [] | Content types included in the book (e.g., "Sheet Music", "Lyrics", "Historical Notes", "Photographs", "Notation") |

### External Links

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `links` | Object | No | {} | External links (see Links section) |

## Links Object

The `links` object contains URLs to external platforms where the book can be found or researched:

```json
"links": {
  "goodreads": "https://www.goodreads.com/book/show/...",
  "worldcat": "https://www.worldcat.org/title/...",
  "publisher": "https://www.publisher.com/book/...",
  "website": "https://example.com/...",
  "archive": "https://archive.org/details/..."
}
```

All link fields are optional. Only include links that have been verified.

### Recommended Link Types

- **goodreads**: Link to Goodreads book page (primary source for book discovery)
- **worldcat**: Link to WorldCat entry (for ISBN lookup and library availability)
- **publisher**: Link to official publisher page
- **website**: Official book or author website
- **archive**: Internet Archive/Open Library entry (for public domain or digitized books)

## Author Parsing Rules

The `authors` field is always an array, even for single authors. Multiple authors are parsed from the original data using these rules:

### Parsing Delimiters

- **" & "** (ampersand with spaces): Split into separate authors
  - Example: "Joe Burke & Charlie Lennon" → `["Joe Burke", "Charlie Lennon"]`

- **", "** (comma with space): Split into separate authors
  - Example: "Brendan Breathnach, Ceol Rince na hEireann" → `["Brendan Breathnach", "Ceol Rince na hEireann"]`

- **" / "** (slash with spaces): Split into separate authors
  - Example: "Author A / Author B" → `["Author A", "Author B"]`

### Featured Authors

Editors or contributors mentioned in descriptions are included in the main `authors` array:
- Example: Book edited by "Brendan Breathnach" with contributions by "James Moloney" → `["Brendan Breathnach", "James Moloney"]`

### Special Cases

- **"Various Authors"**: Remains as single entry: `["Various Authors"]`
- **"Anonymous"**: Remains as single entry: `["Anonymous"]`
- **"Unknown Author"**: Remains as single entry: `["Unknown Author"]`
- **"Compiled by"**: Include compiler as author: `["Compiled by Name"]` or just `["Name"]`

## Example Complete Item

```json
{
  "id": "book-001",
  "type": "Book",
  "title": "The Dance Music of Ireland",
  "authors": ["Francis O'Neill"],
  "description": "A comprehensive collection of 1,001 traditional Irish dance tunes compiled by Chicago Police Chief Francis O'Neill. This seminal work represents one of the most important archives of Irish traditional music, featuring detailed settings in standard musical notation.",
  "publisher": "Waltons Irish Music",
  "year": "1907",
  "image": "book-001.jpg",
  "isbn": "978-1-85791-123-4",
  "isbn10": "0-95331-050-1",
  "pageCount": 368,
  "edition": "Reprint",
  "format": "Hardcover",
  "language": "English",
  "subjects": ["Irish Traditional Music", "Dance Tunes", "Music Notation"],
  "categories": ["Music Reference", "Irish Music", "Traditional Music"],
  "tuneCount": 1001,
  "contentType": ["Sheet Music", "Historical Notes", "Biographical Information"],
  "links": {
    "goodreads": "https://www.goodreads.com/book/show/...",
    "worldcat": "https://www.worldcat.org/title/...",
    "archive": "https://archive.org/details/..."
  }
}
```

## Validation Rules

### Required Field Validation

- All core fields must be present in every item
- `id` must be unique across all items
- `id` must match pattern: `book-\d{3}`
- `image` must match pattern: `book-\d{3}\.(jpg|png)`
- `authors` array must contain at least one entry
- `year` should be 4-digit year or decade (e.g., "2000s")

### Type Validation

- `pageCount`: Must be positive integer
- `tuneCount`: Must be positive integer
- `isbn`: Must be valid ISBN-13 format (optional)
- `isbn10`: Must be valid ISBN-10 format (optional)
- `links`: All values must be valid URLs

### Array Fields

- Empty arrays are preferred over null for array fields
- Arrays should not contain duplicate entries
- Arrays should not contain empty strings

## Irish Music-Specific Fields

### Subjects (Common Examples)

- Irish Traditional Music
- Dance Tunes (Reels, Jigs, Polkas, Hornpipes)
- Song Collections
- Ceili Music
- Sean-nós (Old-style) Singing
- Regional Music (County Clare, Donegal, etc.)
- Historical Transcriptions
- Music Theory & Notation
- Instrument-Specific (Fiddle, Uilleann Pipes, Concertina, Tin Whistle, Bodhrán, etc.)
- Biographies
- Regional Traditions

### Categories (Common Examples)

- Music Reference
- Irish Culture
- Traditional Music
- Music History
- Local History
- Biography
- Instruction/Tutorial
- Notation Systems
- Song Collections

### Content Types (Common Examples)

- Sheet Music
- Lyrics
- Historical Notes
- Biographical Information
- Photographs
- Notation System Guide
- Play-Along Instructions
- Musical Analysis
- Cultural Context
- Regional Variations

## Schema Version History

### Version 1.0 (Current)

- Initial book schema
- Parallel structure to CD schema (CATALOG_SCHEMA.md v2.1)
- Book-specific fields: ISBN, pageCount, edition, format, subjects, categories, tuneCount, contentType
- Author parsing rules matching artist parsing conventions

## Usage in Web Application

### Loading Book Data

```javascript
fetch('data/catalog-books.json')
  .then(response => response.json())
  .then(data => {
    const books = data.items;
    const metadata = data.metadata;
    // Use books...
  });
```

### Displaying Authors

```javascript
function formatAuthors(authors) {
  if (authors.length === 0) return 'Unknown Author';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return authors.join(' & ');
  return authors.slice(0, -1).join(', ') + ' & ' + authors[authors.length - 1];
}
```

### Filtering by Subject

```javascript
function findBySubject(books, subjectName) {
  return books.filter(book =>
    book.subjects.some(subject =>
      subject.toLowerCase().includes(subjectName.toLowerCase())
    )
  );
}
```

### Checking for Links

```javascript
function hasGoodreadsLink(book) {
  return book.links && book.links.goodreads;
}
```

## Maintenance Notes

- When adding new books, always include all core and optional fields
- Use `null` for missing optional metadata, not `undefined`
- Use empty array `[]` for missing array fields
- Verify external links are working before adding them
- Keep descriptions concise but informative (2-4 sentences)
- Always increment `dataVersion` in metadata when schema changes
- Update `lastUpdated` in metadata when any data changes
- ISBN format: 978-X-XXXXXXXX-X (13 digits, hyphens for readability)
- For older books without ISBN, leave as `null` and search WorldCat for catalog number if available
