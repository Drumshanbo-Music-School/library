# Catalog JSON Schema Documentation

## Overview

The `data/catalog.json` file contains a structured catalog of CD items from the library. Each item follows a consistent schema with standardized fields.

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
| `items` | Array | Yes | Array of CD item objects |
| `metadata` | Object | Yes | Metadata about the catalog |

## Metadata Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `totalItems` | Number | Yes | Total number of items in the catalog |
| `type` | String | Yes | Type of items ("CD", "Book", etc.) |
| `source` | String | Yes | Source of the catalog data |
| `dataVersion` | String | Yes | Version number of the data schema |
| `lastUpdated` | String | Yes | ISO date of last update (YYYY-MM-DD) |

## CD Item Object Schema

All CD items have the following standardized fields. Fields marked as "Required" must always be present, even if the value is `null` or an empty array.

### Core Fields (Always Required)

| Field | Type | Required | Default if Missing | Description |
|-------|------|----------|-------------------|-------------|
| `id` | String | Yes | - | Unique identifier (format: "cd-XXX") |
| `type` | String | Yes | "CD" | Item type |
| `title` | String | Yes | - | Album title |
| `artists` | Array[String] | Yes | [] | Array of artist names (see Artist Parsing section) |
| `description` | String | Yes | "" | Detailed description of the album |
| `publisher` | String | Yes | "Independent" | Record label or publisher |
| `year` | String | Yes | "Unknown" | Release year (can be specific year or decade) |
| `image` | String | Yes | - | Filename of cover image (format: "cd-XXX.jpg") |

### Optional Metadata Fields

These fields are included when available, otherwise set to `null` or empty array:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `catalogNumber` | String \| null | null | Publisher's catalog number |
| `tracks` | Number \| String \| null | null | Number of tracks (can be number or string like "100+") |
| `runtime` | String \| null | null | Total runtime (format: "MM:SS" or "HH:MM:SS") |
| `discs` | Number \| null | null | Number of discs (for multi-disc sets) |
| `format` | String \| null | null | Special format notes (e.g., "CD + DVD") |
| `instruments` | Array[String] | [] | Instruments featured on the album |
| `genre` | Array[String] | [] | Music genres/styles |
| `links` | Object | {} | External links (see Links section) |

### Links Object

The `links` object contains URLs to external platforms where the album can be found:

```json
"links": {
  "spotify": "https://open.spotify.com/album/...",
  "bandcamp": "https://example.bandcamp.com/album/...",
  "appleMusic": "https://music.apple.com/us/album/...",
  "website": "https://..."
}
```

All link fields are optional. Only include links that have been verified.

## Artist Parsing Rules

The `artists` field is always an array, even for single artists. Multiple artists are parsed from the original data using these rules:

### Parsing Delimiters
- **" & "** (ampersand with spaces): Split into separate artists
  - Example: "Joe Burke & Charlie Lennon" → `["Joe Burke", "Charlie Lennon"]`

- **", "** (comma with space): Split into separate artists
  - Example: "Seamus Begley, John Carty, Donal Lunny" → `["Seamus Begley", "John Carty", "Donal Lunny"]`

- **" / "** (slash with spaces): Split into separate artists
  - Example: "Artist A / Artist B" → `["Artist A", "Artist B"]`

### Featured Artists
Featured artists mentioned in descriptions or original data are included in the main `artists` array:
- Example: Album by "Kilfenora Ceili Band" featuring "Don Stiffe" → `["Kilfenora Ceili Band", "Don Stiffe"]`

### Special Cases
- **"Various Artists"**: Remains as a single entry: `["Various Artists"]`
- **"Compilation"**: Use `["Various Artists"]` if no specific artists are listed
- **Band names with "&"**: If the "&" is part of the official band name (rare), keep as single entry

## Example Complete Item

```json
{
  "id": "cd-001",
  "type": "CD",
  "title": "The Morning Mist",
  "artists": ["Joe Burke", "Charlie Lennon"],
  "description": "Features Joe Burke on accordion and Charlie Lennon on piano...",
  "publisher": "New Century Music",
  "year": "2002",
  "image": "cd-001.jpg",
  "catalogNumber": "689232077563",
  "tracks": 21,
  "runtime": null,
  "discs": null,
  "format": null,
  "instruments": ["accordion", "piano"],
  "genre": [],
  "links": {
    "spotify": "https://open.spotify.com/track/0HGKM6v5OUMYes8QYQZf07",
    "appleMusic": "https://music.apple.com/us/album/morning-mist/302176372"
  }
}
```

## Validation Rules

### Required Field Validation
- All core fields must be present in every item
- `id` must be unique across all items
- `id` must match pattern: `cd-\d{3}`
- `image` must match pattern: `cd-\d{3}\.(jpg|png)`
- `artists` array must contain at least one entry
- `year` should be 4-digit year or decade (e.g., "2000s")

### Type Validation
- `tracks`: Must be positive integer or string (for special cases like "100+")
- `discs`: Must be positive integer
- `runtime`: Must match pattern MM:SS or HH:MM:SS
- `links`: All values must be valid URLs

### Array Fields
- Empty arrays are preferred over null for array fields
- Arrays should not contain duplicate entries
- Arrays should not contain empty strings

## Schema Version History

### Version 2.0 (Current)
- Added `artists` as array field
- Added `links` object for external URLs
- Standardized all optional fields (present in all items)
- Removed `featuredArtists` (merged into `artists`)
- Changed `artist` to `artists` (plural array)

### Version 1.0 (Previous)
- Original structure with `artist` as string field
- Inconsistent optional fields
- Some items had `featuredArtists` field

## Usage in Web Application

### Loading Data
```javascript
fetch('data/catalog.json')
  .then(response => response.json())
  .then(data => {
    const items = data.items;
    const metadata = data.metadata;
    // Use items...
  });
```

### Displaying Artists
```javascript
// Join artists with proper grammar
function formatArtists(artists) {
  if (artists.length === 0) return 'Unknown Artist';
  if (artists.length === 1) return artists[0];
  if (artists.length === 2) return artists.join(' & ');
  return artists.slice(0, -1).join(', ') + ' & ' + artists[artists.length - 1];
}
```

### Filtering by Artist
```javascript
function findByArtist(items, artistName) {
  return items.filter(item =>
    item.artists.some(artist =>
      artist.toLowerCase().includes(artistName.toLowerCase())
    )
  );
}
```

### Checking for Links
```javascript
function hasSpotifyLink(item) {
  return item.links && item.links.spotify;
}
```

## Maintenance Notes

- When adding new items, always include all core and optional fields
- Use `null` for missing optional metadata, not `undefined`
- Use empty array `[]` for missing array fields
- Verify external links are working before adding them
- Keep descriptions concise but informative (2-4 sentences)
- Always increment `dataVersion` in metadata when schema changes
- Update `lastUpdated` in metadata when any data changes
