# Dor Sam — Portfolio

Portfolio for Dor Sam: bass player and sound designer based in Tel Aviv. Built with static HTML, CSS and JavaScript; no build step or dependencies.

## Preview locally

Run `python3 preview.py`, or double-click `Open Preview.command` on macOS. Keep the terminal window open while viewing the site. An HTTP preview is required for reliable embedded music playback; opening `index.html` directly is suitable for reviewing the layout only.

## Project files

- `index.html`: page structure, section headings and biography.
- `content.js`: video projects, recording credits, platform links and contact information.
- `styles.css`: responsive layout and animations.
- `script.js`: gallery, theater player, music players and contact links.
- `assets/`: poster images, artwork, portrait and icons.
- `recording-links.md`: recording destinations.

## Video files

The website uses 1080p H.264/AAC exports in `assets/video/web/`, tracked in Git. They include fast-start metadata and 320 kbps audio. Full-resolution originals in `assets/video/` remain local and ignored, along with ZIP backups. Do not overwrite the originals when exporting future films.

## GitHub Pages

Live site: https://samod667.github.io/dor-sam-portfolio/

Publish from the `main` branch and repository root in Settings → Pages. `.nojekyll` keeps this buildless site unchanged. All website paths are relative, so the same files support a GitHub project URL and a future custom domain. Configure a custom domain only after purchasing it and setting its DNS records.

## Current content

The gallery contains Cortex Launch and Cortex Teaser (both sound design and original music), Agora Marketing Film (sound design), and Lava Marketing Concept (sound design). The recording panel contains 21 credits with Spotify, Apple Music and available YouTube links. The supplied biography, portrait, email, LinkedIn and Instagram are connected.

Some official YouTube uploads reject embedded playback. Entries with `youtubeEmbed: false` use Spotify for inline listening and link directly to YouTube through the YouTube icon. Other YouTube entries play inline, with provider-error fallback. Full-track availability depends on the streaming provider, browser, region and account.

## Publication checks

Verify all four films, music providers, contact links, and mobile layout on the deployed domain. Source syncing alone does not enable GitHub Pages; its publishing source must be configured in repository settings.
