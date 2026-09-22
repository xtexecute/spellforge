SPELLFORGE SOUNDTRACK DROP FOLDER

Put the finished soundtrack files in this folder using these exact names:

  menu.mp3      Optional menu or idle theme.
  ember.mp3     Ember Foundry loop.
  frost.mp3     Frost Bastion loop.
  storm.mp3     Storm Crucible loop.
  venom.mp3     Venom Wilds loop.
  radiant.mp3   Radiant Court loop.
  void.mp3      Void Expanse loop.
  crystal.mp3   Crystal Labyrinth loop.
  gravity.mp3   Gravity Well loop.
  ember-boss.mp3    Ember Foundry boss loop.
  frost-boss.mp3    Frost Bastion boss loop.
  storm-boss.mp3    Storm Crucible boss loop.
  venom-boss.mp3    Venom Wilds boss loop.
  radiant-boss.mp3  Radiant Court boss loop.
  void-boss.mp3     Void Expanse boss loop.
  crystal-boss.mp3  Crystal Labyrinth boss loop.
  gravity-boss.mp3  Gravity Well boss loop.
  arena.mp3     Fallback loop used when a realm track is missing.
  boss.mp3      Fallback boss loop used while a realm boss track is missing.
  defeat.mp3    Game-over cue. This one does not loop.

Recommended delivery:

  Format: MP3
  Sample rate: 44.1 kHz or 48 kHz
  Loudness: around -14 LUFS integrated
  Peak: no higher than -1 dBTP
  Loop files: trim all realm tracks, arena.mp3, and boss.mp3 to seamless boundaries

The game uses relative paths, so no code changes are needed after replacing these
files. Keep the assets folder beside index.html when sharing the game.

SFX are generated offline by sound.js from filtered noise, impacts, crackle, whooshes, and low-frequency layers. The MP3 files in this folder are reserved for the musician-authored soundtrack.
Element firing signatures are mixed procedurally: the final Element block is primary, earlier elements become quiet layers, and known elemental reactions add a dedicated accent.
