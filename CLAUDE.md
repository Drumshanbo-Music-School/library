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
- Streaming links (Spotify, Bandcamp or Website only)
- Enhanced 2-4 sentence description
- Album cover image

---

## Data Enrichment Workflow

### Phase 1: Batch Preparation
1. Read the CSV batch from `assets/` directory
2. Check `web-app/public/data/catalog.json` for the last ID (e.g., `cd-061`)
3. Your batch starts at the next ID (e.g., `cd-062`)

### Phase 2: Process Each Item (CRITICAL: Complete ALL Steps Before Moving to Next CD)                                                                                                        
                                                                                                                                                                                                
  For each row in the CSV, you MUST complete these steps in order:                                                                                                                              
                                                                                                                                                                                                
  1. **Parse artists** into array format                                                                                                                                                        
  2. **Perform web search** for metadata (Spotify first, then Bandcamp/theSession.org if needed)                                                                                                   
     - Extract: track count, track listing, runtime, catalog number, instruments, genre, year, streaming links, description                                                                     
     - **CRITICAL: In the SAME web search results, locate and note the album cover image URL**                                                                                                  
  3. **Download album cover image** (REQUIRED - NOT OPTIONAL)                                                                                                                                   
     - Use the image URL from step 2                                                                                                                                                            
     - Save to `web-app/public/images/cd-XXX.jpg` where XXX matches the CD ID                                                                                                                   
     - **VERIFY the file was created** before proceeding                                                                                                                                        
     - If image download fails, try alternate sources (Bandcamp, MusicBrainz, CoverArtArchive)                                                                                                  
     - Maximum 3 web search attempts per CD

     - Ignore discogs website since it always returns 403. 

     - If image cannot be found for an album, then touch a jpg file as a placeholder                                                                                                                                                     
  4. **Generate enriched JSON entry** with all fields                                                                                                                                           
  5. **Append entry to `assets/enriched_batch_cd###-###.json`** immediately                                                                                                                     
  6. **Validate completion**: Confirm both JSON entry AND image file exist before moving to next CD                                                                                             
                                                                                                                                                                                                
  **STOP CONDITIONS**:                                                                                                                                                                          
  - Move to next CD only when BOTH metadata JSON AND image file are successfully created                                                                                                        
  - If after 3 web searches you cannot find complete data, document what's missing in a separate file and move on                                                                               
  - NEVER process metadata without also attempting image download in the same workflow                                                                                                          
                                                                                                                                                                                                
  **EFFICIENCY RULE**:                                                                                                                                                                          
  Extract the image URL from the same web search you use for metadata. Do not make separate searches for images. Most sources (Spotify, Bandcamp, MusicBrainz) include album art in their       
  initial results.

### Phase 3: Finalize
1. Run `node append-to-catalog.js assets/enriched_batch_cd###-###.json`
2. Script automatically appends all items, updates `metadata.totalItems`, and sets `lastUpdated`

**Note**: catalog.json is too large for direct editing. Always use the append script.
