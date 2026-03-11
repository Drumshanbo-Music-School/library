# Deployment Instructions for GitHub Pages

## Quick Setup

### 1. Create GitHub Repository
```bash
# Initialize git (if not already done)
cd web-app
git init
git add .
git commit -m "Initial commit: Drumshanbo Music Library"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/drumshanbo-music-library.git
git push -u origin main
```

### 2. Configure Base Path (if needed)
If deploying to a repository path (not custom domain), update `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/drumshanbo-music-library/', // <- Your repo name
})
```

For custom domain or root deployment, keep:
```javascript
base: '/',
```

### 3. Build the Project
```bash
npm run build
```

This creates a `dist/` folder with your production build.

### 4. Deploy to GitHub Pages

#### Option A: Manual Deployment
1. Go to your GitHub repository settings
2. Navigate to Pages section
3. Select "Deploy from a branch"
4. Choose `gh-pages` branch (we'll create this)
5. Push the dist folder to gh-pages branch:

```bash
# Build the project
npm run build

# Create gh-pages branch (first time only)
git checkout --orphan gh-pages
git reset --hard
git commit --allow-empty -m "Initialize gh-pages"
git push origin gh-pages
git checkout main

# Deploy
cd dist
git init
git add .
git commit -m "Deploy"
git push -f https://github.com/YOUR_USERNAME/drumshanbo-music-library.git main:gh-pages
cd ..
```

#### Option B: Using GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml` in your repository root:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd web-app
          npm install

      - name: Build
        run: |
          cd web-app
          npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v3

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: './web-app/dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

Then push to GitHub:
```bash
git add .
git commit -m "Add GitHub Actions deployment"
git push origin main
```

### 5. Access Your Site

After deployment, your site will be available at:
- With repo path: `https://YOUR_USERNAME.github.io/drumshanbo-music-library/`
- With custom domain: `https://your-custom-domain.com`

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Images not loading
- Make sure `/images` and `/data` folders are in the `public/` directory
- Check that image paths in catalog.json are correct
- Verify base path in vite.config.js matches your deployment URL

### 404 on page refresh
- GitHub Pages serves static files only
- This is normal for single-page apps
- The app will redirect to home page automatically

### Base path issues
- If assets aren't loading, double-check the `base` setting in `vite.config.js`
- It should match your GitHub Pages URL structure

## Project Structure

```
web-app/
├── public/
│   ├── data/
│   │   └── catalog.json
│   └── images/
│       ├── cd-001.jpg
│       ├── cd-002.jpg
│       └── ...
├── src/
│   ├── components/
│   │   ├── AlbumCard.jsx
│   │   ├── AlbumDetail.jsx
│   │   ├── AlbumGrid.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── Header.jsx
│   │   └── SearchBar.jsx
│   ├── App.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Features

✅ Search by title, artist, description, or publisher
✅ Filter by year, publisher, genre
✅ Interactive browsing (click artists, instruments, genres to filter)
✅ Responsive design (mobile, tablet, desktop)
✅ Album detail modal with all information
✅ Streaming links (Spotify, Apple Music, websites)
✅ Beautiful Tailwind CSS design
✅ Fast performance with Vite
✅ Static site - no server needed

## Updates

To update the site:
1. Make changes to code
2. Commit and push to main branch
3. GitHub Actions will automatically rebuild and deploy (if using Option B)
4. Or run manual deployment steps (if using Option A)
