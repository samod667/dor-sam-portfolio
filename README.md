# Dor Sam — Portfolio

Private, unpublished portfolio draft for Dor Sam: bass player and sound designer based in Tel Aviv. Built with static HTML, CSS and JavaScript; no build step or dependencies.

## Preview locally

Run `python3 preview.py`, or double-click `Open Preview.command` on macOS. Keep the terminal window open while viewing the site. An HTTP preview is required for reliable embedded music playback; opening `index.html` directly is suitable for reviewing the layout only.

## Project files

- `index.html`: page structure, section headings and biography.
- `content.js`: video projects, recording credits, platform links and contact information.
- `styles.css`: responsive layout and animations.
- `script.js`: gallery, theater player, music players and contact links.
- `assets/`: poster images, artwork, portrait and icons.
- `recording-links.md`: recording destinations.

## Video files are not stored in Git

The full-resolution MP4 files and downloadable website ZIP are intentionally ignored. They remain in the local project folder. A fresh clone includes posters and code, but needs the video files restored into `assets/video/` to play the portfolio films. See `assets/video/README.md` for the filenames.

Before launch, select video hosting and replace the local `video` paths in `content.js` with hosted MP4 URLs or supported embeds. Do not commit the full-resolution videos to Git.

## Current content

The gallery contains Cortex (sound design and original music), Agora Marketing Film (sound design), Lava Marketing Concept (sound design), and one upcoming Agora placeholder. The recording panel contains 21 credits with Spotify, Apple Music and available YouTube links. The supplied biography, portrait, email, LinkedIn and Instagram are connected.

Some official YouTube uploads reject embedded playback. Entries with `youtubeEmbed: false` use Spotify for inline listening and link directly to YouTube through the YouTube icon. Other YouTube entries play inline, with provider-error fallback. Full-track availability depends on the streaming provider, browser, region and account.

## Before publishing

- Replace the upcoming Agora placeholder with the final video and credits.
- Configure video hosting and test the films on the deployed domain.
- Check music playback, keyboard navigation and mobile layout.
- Choose the production hosting service and domain.

Creating or updating this repository does not publish the website. No deployment workflow is configured.
