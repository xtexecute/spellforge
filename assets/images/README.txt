SPELLFORGE VISUAL ASSETS

The current/ folder contains transparent PNG exports of every procedural entity,
pickup, projectile, and arena object drawn by game.js. Use these as redraw guides.

Conventions:
  - Every sprite faces right.
  - The center of the PNG is the in-game position and rotation point.
  - Regular sprites use 128 x 128 canvases.
  - Large bosses use 256 x 256 canvases.
  - Preserve transparent backgrounds.
  - Keep filenames unchanged when replacing art.

sprite-manifest.json records canvas size, anchor, facing, and gameplay radius.
current-sprites-contact-sheet.png previews the full exported set.

Dynamic boss layers:
  - engine_core.png is the blocky Twelvefold Engine body.
  - engine_arm.png is drawn up to twelve times and disappears as health falls.
  - voidboss_core.png is the Void Sovereign body.
  - void_orb.png is drawn once for every currently available boss orb.

Run export_current_sprites.py to regenerate all PNGs from the present style guide.
