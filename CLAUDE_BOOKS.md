# CLAUDE_BOOKS.md - Drumshanbo Music Library Book Enrichment Guide

## Project Overview

### Purpose
This guide provides instructions for enriching book catalog data for the **Drumshanbo Music Course Library** - a collection of Irish Traditional Music books housed at the Drumshanbo Local Library in County Leitrim, Ireland.

### Current State
- **Total CDs**: 414
- **Total Books**: 0 (to be enriched)
- **Schema Version**: 1.0
- **Source Data**: CSV with basic fields (Title, Author, Description, Publisher, Year)
- **Enriched Output**: JSON with 18+ fields per book item

### Repository Structure
```
library/
├── CATALOG_SCHEMA_BOOKS.md    # Book schema documentation
├── CLAUDE_BOOKS.md             # This file - enrichment instructions
├── assets/
│   ├── book_*.csv              # Source CSV batch files
│   └── enriched_batch_book-*.json  # Enriched book batches
└── web-app/
    ├── public/
    │   ├── data/
    │   │   ├── catalog.json     # CD catalog
    │   │   └── catalog-books.json  # Enriched books catalog (TARGET FILE)
    │   └── images/
    │       ├── cd-XXX.jpg       # CD cover images
    │       └── book-XXX.jpg     # Book cover images
    └── src/                     # React application source
```

---

## Scope of Work

### What You Will Receive
CSV batches of 20-40 book items with these columns:
| Column | Description |
|--------|-------------|
| Title | Book title |
| Author | Author name(s) - may contain multiple authors |
| Description | Often empty or minimal |
| Publisher | Publisher name |
| Year | Publication year (may be empty) |

### What You Will Produce
Enriched JSON entries with 18+ fields per book item, ready to append to `catalog-books.json`.

### Enrichment Goals
For each book, search the web to find:
- ISBN-13 and ISBN-10 (if available)
- Page count
- Book edition information
- Publisher details
- Physical format (Hardcover, Paperback, Spiral-bound, etc.)
- Subject tags (topics, themes)
- Category classification
- Tune count (if applicable for tune books)
- Content types (Sheet Music, Lyrics, Historical Notes, etc.)
- External links (Goodreads, WorldCat, publisher website)
- Enhanced 2-4 sentence description
- Book cover image

---

## Data Enrichment Workflow

### Phase 1: Batch Preparation
1. Read the CSV batch from `assets/` directory
2. Check `web-app/public/data/catalog-books.json` for the last ID (e.g., `book-010`)
3. Your batch starts at the next ID (e.g., `book-011`)

### Phase 2: Process Each Book (CRITICAL: Complete ALL Steps Before Moving to Next Book)

For each row in the CSV, you MUST complete these steps in order:

1. **Parse authors** into array format
   - Use delimiters: " & ", ", ", " / "
   - Handle special cases: "Compiled by...", "Edited by..." → include as author
   - See CATALOG_SCHEMA_BOOKS.md for detailed parsing rules

2. **Perform web search** for metadata (Search sources in order of preference)

   **Primary Sources (in order):**
   - **Google Books** (https://books.google.com) - Has ISBN, page count, preview, cover image
   - **Open Library** (https://openlibrary.org) - Free, comprehensive, good for Irish books
   - **Goodreads** (https://goodreads.com) - Best for book discovery and metadata

   **Secondary Sources:**
   - **WorldCat** (https://worldcat.org) - For ISBN lookup and library availability
   - **Publisher websites** - For official metadata and links
   - **Internet Archive** (https://archive.org) - For public domain and digitized books

   **Extract from search results:**
   - ISBN-13 and ISBN-10 (if available)
   - Page count
   - Edition information
   - Publisher name
   - Publication year (if missing from CSV)
   - Physical format (Hardcover, Paperback, Spiral-bound, etc.)
   - Content description
   - Subjects/topics/keywords
   - Author information (birth year, biographical context)
   - Tune count (for tune collections)
   - Content types (Sheet Music, Lyrics, Historical Notes, etc.)
   - **CRITICAL: In the SAME web search results, locate and note the book cover image URL**

3. **Download book cover image** (REQUIRED - NOT OPTIONAL)
   - Use image URL from step 2
   - Save to `web-app/public/images/book-XXX.jpg` where XXX matches the book ID
   - **VERIFY the file was created** before proceeding

   **Image download sources (in priority order):**
   - Google Books API (ISBN-based cover lookup)
   - Open Library Cover API: `https://covers.openlibrary.org/b/isbn/{isbn}-M.jpg`
   - Goodreads book page (right-click image)
   - Direct download from book preview pages
   - Maximum 3 web search attempts per book

   **If image cannot be found:**
   - Create placeholder file with `touch book-XXX.jpg`
   - Document missing cover in `need-more-info.txt`

4. **Generate enriched JSON entry** with all fields
   - Use CATALOG_SCHEMA_BOOKS.md for complete field list
   - Ensure all required core fields are present
   - Set optional fields to `null` if not found
   - Use empty arrays `[]` for missing array fields
   - Keep description concise: 2-4 sentences

5. **Append entry to `assets/enriched_batch_book-###-###.json`** immediately
   - Create batch file in format: `enriched_batch_book-001-020.json` (or appropriate range)
   - Each entry should be a complete JSON object

6. **Validate completion**: Confirm both JSON entry AND image file exist before moving to next book
   ```bash
   # Verify file exists
   ls -lh web-app/public/images/book-XXX.jpg
   ```

**STOP CONDITIONS:**
- Move to next book only when BOTH metadata JSON AND image file are successfully created
- If after 3 web searches you cannot find complete data, document what's missing in a separate file and move on
- NEVER process metadata without also attempting image download in the same workflow

**EFFICIENCY RULE:**
Extract the image URL from the same web search you use for metadata. Do not make separate searches for images. Most book sources (Google Books, Open Library, Goodreads) include book covers in their initial search results.

---

## Metadata Extraction Guide

### ISBN (Books Only)

**What to look for:**
- ISBN-13: 13-digit code starting with 978 or 979
- ISBN-10: 10-digit code (for older books)
- Typically found on book back cover or copyright page

**Format:**
```
ISBN-13: 978-1-234567-89-0
ISBN-10: 1-234567-89-X (X can be 0-9)
```

**Search tips:**
- Google Books search: Search title + author, look at "Book details" section
- Open Library: Direct ISBN search field available
- Goodreads: Listed in book details
- For books before 1970: ISBN may not exist, leave as `null`

### Page Count

**What to look for:**
- Usually listed as "pages: XXX" in book metadata
- For very old books, may only have page estimate

**Search tips:**
- Google Books: "Pages: XXX"
- Open Library: Listed in book details
- Goodreads: Listed under "Details"
- If only page range found (e.g., pp. 50-150), calculate total

### Edition

**What to look for:**
- "2nd Edition", "Revised Edition", "3rd Printing"
- First editions typically just show publication year without edition label

**Format:**
- "1st Edition" or null for first edition
- "2nd Edition", "Revised Edition", etc. for subsequent editions
- "Reprint" for reprints of older works

### Subjects and Categories

**Subjects (Examples for Irish Music Books):**
- Irish Traditional Music
- Dance Tunes (Reels, Jigs, Hornpipes, etc.)
- Song Collections
- Ceili Music
- Regional Music (County Clare, Donegal, etc.)
- Instrument-specific (Uilleann Pipes, Tin Whistle, Fiddle, etc.)
- Music Notation
- Biographies
- Regional Traditions

**Categories (Examples):**
- Music Reference
- Music History
- Irish Culture
- Traditional Music
- Local History
- Biography
- Instruction & Tutoring

**How to find:**
- Google Books: "About this book" section, "Genres" tags
- Goodreads: "Shelves" on book page
- Open Library: Classification tags
- WorldCat: Subject headings

### Tune Count (Optional, for tune books)

**What to look for:**
- "1,001 tunes", "500 traditional airs", "Collection of 2,000 reels and jigs"
- Usually mentioned in title or description

### Content Types

**Possible values:**
- Sheet Music (musical notation)
- Lyrics (song lyrics)
- Historical Notes (background information)
- Biographical Information (about composers/musicians)
- Photographs (pictures included)
- Notation System Guide (how to read notation)
- Musical Analysis (detailed analysis of pieces)
- Cultural Context (background on traditions)
- Regional Variations (different versions by region)

**How to find:**
- Google Books: Preview pages show content type
- Goodreads: Reader reviews often mention content
- Publisher descriptions: Often describe what's included

---

## External Links Guide

### Goodreads
- **URL Format**: `https://www.goodreads.com/book/show/12345678-title-slug`
- **How to find**: Search book title on Goodreads
- **Required for all books** (if available)

### WorldCat
- **URL Format**: `https://www.worldcat.org/title/[title-with-isbn]/`
- **How to find**: Search ISBN on worldcat.org
- **Useful for**: Library availability, ISBN verification

### Publisher Website
- **How to find**: Publisher name → company website → search books section
- **Include if**: Publisher has active website and book is still in print

### Internet Archive
- **URL Format**: `https://archive.org/details/[unique-id]`
- **How to find**: Search book title on archive.org
- **Include for**: Public domain or digitized books

### Author Website
- **How to find**: Author name search + "official website"
- **Include if**: Author has official website with book information

---

## Special Cases

### Multi-Author Books
- Parse all authors using delimiters: " & ", ", ", " / "
- Include editors and compilers as authors
- Example: "Compiled by Francis O'Neill with annotations by Ceol Rince" → `["Francis O'Neill", "Ceol Rince"]`

### Reissued/Reprinted Books
- Use original publication year if available
- Add edition info: `"Reprint"` or `"2020 Edition"` in `edition` field
- Include original publisher in description if significantly different

### Books Without ISBN
- Older books (pre-1970s) may not have ISBN
- Leave `isbn` and `isbn10` as `null`
- Try to find book in WorldCat for catalog number

### Regional or Self-Published Books
- May have limited online presence
- Search using title + author + "Irish music" or "traditional music"
- Include self-published status in description if applicable

### Irish Language Titles
- Use title as it appears in original source
- If English translation differs, include translated title in description
- Example: `"Díreach Ón gCroí"` (Irish) vs "Straight from the Heart" (English)

---

## Quality Assurance Checklist

For each enriched book entry, verify:

- [ ] **Required fields present**
  - [ ] id (format: book-XXX)
  - [ ] type ("Book")
  - [ ] title (not empty)
  - [ ] authors (array with at least one entry)
  - [ ] description (2-4 sentences)
  - [ ] publisher
  - [ ] year
  - [ ] image (file exists)

- [ ] **Optional fields properly formatted**
  - [ ] isbn (null or proper format)
  - [ ] pageCount (null or positive integer)
  - [ ] subjects (array, no empty strings)
  - [ ] categories (array, no empty strings)
  - [ ] links (object with valid URLs)

- [ ] **Data quality**
  - [ ] No duplicate author names in array
  - [ ] Description reads naturally (2-4 sentences)
  - [ ] Year is 4-digit number (or null/"Unknown")
  - [ ] All URLs in links are valid and reachable
  - [ ] Image file downloaded and verified

- [ ] **Uniqueness**
  - [ ] Book ID not already in catalog-books.json
  - [ ] ISBN not duplicated (if multiple editions exist, use different IDs)

---

## Phase 3: Finalize

1. Validate JSON syntax:
   ```bash
   node -e "const data = require('./assets/enriched_batch_book-001-020.json'); console.log('Valid JSON, entries:', data.length);"
   ```

2. Run append script:
   ```bash
   node append-to-catalog-books.js assets/enriched_batch_book-001-020.json
   ```

3. Script automatically:
   - Appends all entries to `catalog-books.json`
   - Updates `metadata.totalItems`
   - Sets `metadata.lastUpdated` to current date
   - Validates for duplicate IDs
   - Validates required fields

4. Verify in web app:
   - Open http://localhost:5173
   - Click "📚 Books" toggle
   - Verify books display correctly with cover images
   - Test filters and search functionality

**Note**: catalog-books.json is too large for direct editing. Always use the append script.

---

## Tips and Troubleshooting

### Book Not Found Online
- Try variations of title and author name
- Search for alternative spellings
- Add "Irish music" or "traditional music" to search
- Check if it's a self-published or regional publication
- Document in `need-more-info.txt` for follow-up research

### ISBN Not Available
- Older books (pre-1970s) typically don't have ISBN
- Try WorldCat ISBN search as alternative
- Leave isbn fields as `null` and note in description if relevant

### Cover Image Not Found
- Try multiple sources: Google Books → Open Library → Goodreads → Internet Archive
- For very rare/regional books, may not have cover available online
- Create placeholder file with `touch book-XXX.jpg`
- Document in `need-more-info.txt`

### Author Parsing Issues
- If author field contains collaborators: "Written with..."  → include as separate author
- If field contains role info: "Edited by John Doe" → extract just the name
- For traditional tune collections: "Compiled by..." → include compiler as author

### Metadata Inconsistencies
- Different sources may show different page counts (hardcover vs paperback)
- Use the most recent/authoritative source (usually publisher)
- If significantly different, document in description

---

## Examples

### Example 1: Traditional Tune Collection

**CSV Input:**
```
The Dance Music of Ireland, Francis O'Neill, Collection of 1001 tunes, Waltons Irish Music, 1907
```

**Enriched Output:**
```json
{
  "id": "book-001",
  "type": "Book",
  "title": "The Dance Music of Ireland",
  "authors": ["Francis O'Neill"],
  "description": "A comprehensive collection of 1,001 traditional Irish dance tunes compiled by Chicago Police Chief Francis O'Neill. This seminal work represents one of the most important archives of Irish traditional music, featuring detailed settings in standard musical notation. Originally published in 1907, this definitive reference remains essential for musicians and scholars.",
  "publisher": "Waltons Irish Music",
  "year": "1907",
  "image": "book-001.jpg",
  "isbn": "978-1-85791-123-4",
  "isbn10": null,
  "pageCount": 368,
  "edition": "Reprint",
  "format": "Hardcover",
  "language": "English",
  "subjects": ["Irish Traditional Music", "Dance Tunes", "Music Notation"],
  "categories": ["Music Reference", "Irish Music", "Traditional Music"],
  "tuneCount": 1001,
  "contentType": ["Sheet Music", "Historical Notes"],
  "links": {
    "goodreads": "https://www.goodreads.com/book/show/...",
    "worldcat": "https://www.worldcat.org/title/...",
    "archive": "https://archive.org/details/..."
  }
}
```

### Example 2: Contemporary Instruction Book

**CSV Input:**
```
How to Play the Uilleann Pipes, Paddy Moloney, Modern instruction method, Waltons Music, 2015
```

**Enriched Output:**
```json
{
  "id": "book-002",
  "type": "Book",
  "title": "How to Play the Uilleann Pipes",
  "authors": ["Paddy Moloney"],
  "description": "A comprehensive modern instruction method for learning the uilleann pipes. Paddy Moloney, world-renowned musician, presents step-by-step techniques for beginners through intermediate players. The book includes detailed diagrams, fingering charts, and musical exercises.",
  "publisher": "Waltons Music",
  "year": "2015",
  "image": "book-002.jpg",
  "isbn": "978-1-85791-456-7",
  "isbn10": null,
  "pageCount": 240,
  "edition": null,
  "format": "Paperback",
  "language": "English",
  "subjects": ["Uilleann Pipes", "Music Instruction", "Irish Traditional Music"],
  "categories": ["Instruction & Tutoring", "Music"],
  "tuneCount": null,
  "contentType": ["Notation", "Photographs", "Diagrams"],
  "links": {
    "goodreads": "https://www.goodreads.com/book/show/...",
    "publisher": "https://www.waltonmusic.com/..."
  }
}
```

---

## Estimated Enrichment Time

- **Per book**: 10-15 minutes
- **Batch of 20 books**: 3-4 hours
- **Batch of 40 books**: 6-8 hours

Factors affecting time:
- Availability of metadata online
- Clarity of original source data
- Number of images that need downloading
- Complexity of author parsing

---

## Resources and References

**Web Resources:**
- [Google Books](https://books.google.com) - ISBN lookup, preview, cover images
- [Open Library](https://openlibrary.org) - Free book database, covers, ISBN lookup
- [Goodreads](https://goodreads.com) - Book discovery, user data, covers
- [WorldCat](https://worldcat.org) - Library catalog, ISBN verification
- [Internet Archive](https://archive.org) - Public domain books, digital library
- [The Session](https://thesession.org) - Irish traditional music database

**Tools:**
- ISBN Validator: [https://isbn-validator.io](https://isbn-validator.io)
- Image Downloader: Browser developer tools (F12 → Network tab)
- JSON Validator: [https://jsonlint.com](https://jsonlint.com)

**Documentation:**
- CATALOG_SCHEMA_BOOKS.md - Complete field specifications
- ISBN Format Guide: https://en.wikipedia.org/wiki/International_Standard_Book_Number

---

This guide mirrors the CD enrichment process while adapting for book-specific metadata. Follow the same workflow, quality standards, and validation procedures established for the CD catalog.
