# CLAUDE.md - Drumshanbo Music Library Data Enrichment Guide

## Project Overview

### Purpose
This repository contains the catalog data and web application for the **Drumshanbo Music Course Library** - a collection of Irish Traditional Music CDs housed at the Drumshanbo Local Library in County Leitrim, Ireland.

### Current State
- **Total Items**: 101 CDs cataloged
- **Schema Version**: 2.1
- **Source Data**: Excel/CSV with basic fields (Title, Artist, Description, Publisher, Year)
- **Enriched Output**: JSON with 18+ fields per item

### Repository Structure
```
library/
├── CATALOG_SCHEMA.md          # Complete schema documentation
├── CLAUDE.md                  # This file - enrichment instructions
├── assets/
│   ├── *.csv                  # Source CSV batch files
│   └── *.xlsx                 # Master Excel catalog
└── web-app/
    ├── public/
    │   ├── data/
    │   │   └── catalog.json   # Enriched catalog output (TARGET FILE)
    │   └── images/
    │       └── cd-XXX.jpg     # Album cover images
    └── src/                   # React application source
```

---

## Scope of Work

### What You Will Receive
CSV batches of 40-60 items with these columns:
| Column | Description |
|--------|-------------|
| Title | Album title |
| Artist | Artist name(s) - may contain multiple artists |
| Description | Often empty or minimal |
| Publisher | Record label |
| Year | Release year (may be empty) |

### What You Will Produce
Enriched JSON entries with 17 fields per item, ready to append to `catalog.json`.

### Enrichment Goals
For each item, search the web to find:
- Track count, track listing, and total runtime
- Catalog/barcode number
- Instruments featured
- Genre classification
- Release year (if missing)
- Streaming links (Spotify, Bandcamp)
- Enhanced 2-4 sentence description
- Album cover image

---

## Data Enrichment Workflow

### Phase 1: Batch Preparation
1. Read the CSV batch from `assets/` directory
2. Check `web-app/public/data/catalog.json` for the last ID (e.g., `cd-061`)
3. Your batch starts at the next ID (e.g., `cd-062`)

### Phase 2: Process Each Item
For each row in the CSV:
1. Parse artists into array format
2. Perform web searches.
Important: Make sure to make web searches without spinning new agents. Make a web search for an artist + album in Spotify first, if all of the relavant information including album cover jpg is not found within this first search, then try another source like bandcamp/thesession.org/MusicBrainz. Only after the CD is fully enriched, go to the next entry. If a CD cannot be enriched in 3 web call attempts, write out what you have, and move to the next one. Make sure to extract the album cover jpg and save it within these calls.
3. Generate enriched JSON entry
4. Validate against schema
5. **Append entry to `assets/enriched_batch_cd###-###.json`** (write after each CD is enriched)

### Phase 3: Finalize
1. Run `node append-to-catalog.js assets/enriched_batch_cd###-###.json`
2. Script automatically appends all items, updates `metadata.totalItems`, and sets `lastUpdated`

**Note**: catalog.json is too large for direct editing. Always use the append script.
