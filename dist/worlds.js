/** Imaginary worlds for ORBITE. Each one is a landscape to drift through and a place to listen in. */

// "sound" describes the place to listen in: key and mode, the size of the space (0 small room,
// 1 vast hall), how far the layers wander, how much each pass differs, and which of Loopra's
// 32 layers live here (their numbers are positions in dist/loopra/audio.js).
export const WORLDS = [
  {
    "id": "kepler",
    "index": 0,
    "title": "The gardens of Kepler",
    "subtitle": "A spring with no witness",
    "description": "Crystals grow like trees. Beneath a sky of copper and jade, the landscape seems to remember tomorrow.",
    "tag": "SIDEREAL BOTANY",
    "palette": [
      "#71b6ac",
      "#b75f43",
      "#d9c3a0"
    ],
    "coordinates": "K–041 · GARDEN 07",
    "chapter": "I · The first light",
    "cameraLabel": "Drifting through the gardens",
    "sound": {
      "key": "D",
      "mode": "aeolian",
      "size": 0.45,
      "walk": 0.35,
      "variation": 0.5,
      "layers": [
        0,
        1,
        2,
        4,
        5,
        8,
        9,
        11,
        12,
        14,
        17,
        19,
        26,
        28
      ]
    }
  },
  {
    "id": "moons",
    "index": 1,
    "title": "The sea of moons",
    "subtitle": "The tide comes from the sky",
    "description": "A dark sea breathes beneath an immense world. Its rings brush the horizon; the waves bring back an ancient light.",
    "tag": "EXTRASOLAR OCEAN",
    "palette": [
      "#102f3b",
      "#dfd9c3",
      "#ca8e4e"
    ],
    "coordinates": "M–009 · TIDE 03",
    "chapter": "II · What draws us closer",
    "cameraLabel": "Tracking just above the water",
    "sound": {
      "key": "F",
      "mode": "aeolian",
      "size": 0.8,
      "walk": 0.5,
      "variation": 0.45,
      "layers": [
        0,
        1,
        6,
        7,
        10,
        11,
        12,
        13,
        15,
        20,
        21,
        24,
        25,
        31
      ]
    }
  },
  {
    "id": "cathedral",
    "index": 2,
    "title": "The cathedral of the void",
    "subtitle": "An architecture that listens",
    "description": "An immense cube, hollowed into a thousand chambers, floats in the night. Here, absence becomes matter and every opening contains another horizon.",
    "tag": "SENSITIVE GEOMETRY",
    "palette": [
      "#ee6044",
      "#72e6dc",
      "#24233b"
    ],
    "coordinates": "V–∞ · CHAMBER 12",
    "chapter": "III · The space within",
    "cameraLabel": "Drifting around the cube",
    "sound": {
      "key": "A",
      "mode": "dorian",
      "size": 1,
      "walk": 0.3,
      "variation": 0.4,
      "layers": [
        0,
        1,
        2,
        5,
        8,
        12,
        16,
        18,
        19,
        23,
        24,
        25,
        29,
        30
      ]
    }
  },
  {
    "id": "last-sun",
    "index": 3,
    "title": "The last sun",
    "subtitle": "Silence has a temperature",
    "description": "The wind draws amber dunes around a motionless eclipse. In the distance, something waits for night to finish being born.",
    "tag": "TWILIGHT DESERT",
    "palette": [
      "#dda04d",
      "#a34e35",
      "#282536"
    ],
    "coordinates": "S–001 · HORIZON 00",
    "chapter": "IV · After the last star",
    "cameraLabel": "Gliding over the dunes",
    "sound": {
      "key": "C",
      "mode": "aeolian",
      "size": 0.7,
      "walk": 0.45,
      "variation": 0.5,
      "layers": [
        0,
        1,
        5,
        6,
        7,
        11,
        13,
        14,
        21,
        22,
        25,
        27,
        31
      ]
    }
  },
  {
    "id": "lanterns",
    "index": 4,
    "title": "The forest of lanterns",
    "subtitle": "Everything that grows remembers",
    "description": "Immense mushrooms open their canopies in a luminous mist. Beneath their living vaults, the night breathes in small pools of light.",
    "tag": "CELESTIAL MYCELIUM",
    "palette": [
      "#326e69",
      "#cf8b69",
      "#b8dca5"
    ],
    "coordinates": "F–028 · SPORE 06",
    "chapter": "V · Beneath the canopies",
    "cameraLabel": "Drifting through the undergrowth",
    "sound": {
      "key": "E",
      "mode": "aeolian",
      "size": 0.35,
      "walk": 0.4,
      "variation": 0.6,
      "layers": [
        0,
        1,
        3,
        4,
        8,
        9,
        11,
        12,
        14,
        16,
        17,
        19,
        22,
        26,
        28
      ]
    }
  },
  {
    "id": "frost",
    "index": 5,
    "title": "The gates of frost",
    "subtitle": "A passage through white time",
    "description": "Ice arches stand on an unmarked plain. The sky slips through their hollows, as though winter had kept a secret entrance.",
    "tag": "POLAR ARCHIPELAGO",
    "palette": [
      "#80b9c6",
      "#dbe9df",
      "#6c7998"
    ],
    "coordinates": "P–113 · RIFT 02",
    "chapter": "VI · The memory of cold",
    "cameraLabel": "Approaching the ice arches",
    "sound": {
      "key": "B",
      "mode": "aeolian",
      "size": 0.6,
      "walk": 0.3,
      "variation": 0.4,
      "layers": [
        0,
        2,
        5,
        8,
        10,
        11,
        13,
        15,
        17,
        19,
        24,
        25,
        26,
        29,
        31
      ]
    }
  },
  {
    "id": "archipelago",
    "index": 6,
    "title": "The suspended archipelago",
    "subtitle": "Gravity has forgotten this garden",
    "description": "Stone islands hang motionless above the mist. Their silhouettes form a garden whose paths have never touched the ground.",
    "tag": "WEIGHTLESS GARDEN",
    "palette": [
      "#6d9990",
      "#b99673",
      "#cad9c2"
    ],
    "coordinates": "A–072 · ISLAND 09",
    "chapter": "VII · What the earth lets go",
    "cameraLabel": "Passing between the islands",
    "sound": {
      "key": "G",
      "mode": "dorian",
      "size": 0.85,
      "walk": 0.6,
      "variation": 0.5,
      "layers": [
        0,
        1,
        5,
        6,
        10,
        12,
        13,
        15,
        18,
        20,
        24,
        25,
        29,
        31
      ]
    }
  },
  {
    "id": "obsidian",
    "index": 7,
    "title": "The veins of obsidian",
    "subtitle": "The stone keeps its fire",
    "description": "A dark crust folds into living marble. Between its veins of fire, the landscape slowly continues a thought begun beneath the surface.",
    "tag": "INCANDESCENT GEOLOGY",
    "palette": [
      "#28292f",
      "#d96e36",
      "#e8b46e"
    ],
    "coordinates": "O–088 · VEIN 04",
    "chapter": "VIII · What still burns",
    "cameraLabel": "Passing over the veins",
    "sound": {
      "key": "D",
      "mode": "phrygian",
      "size": 0.5,
      "walk": 0.25,
      "variation": 0.35,
      "layers": [
        0,
        1,
        7,
        11,
        12,
        14,
        15,
        20,
        21,
        22,
        23,
        30,
        31
      ]
    }
  },
  {
    "id": "clouds",
    "title": "The sea of clouds",
    "subtitle": "A sunrise above the weather",
    "description": "Above a slow sea of cloud, a few dark peaks hold the first light. Nothing below you but time.",
    "tag": "ALTITUDE · DAWN",
    "palette": [
      "#e7a7a0",
      "#f2d5a8",
      "#4a5d7c"
    ],
    "coordinates": "N–330 · ALTITUDE 09",
    "chapter": "IX · Above the weather",
    "cameraLabel": "Gliding above the clouds",
    "sound": {
      "key": "G",
      "mode": "lydian",
      "size": 0.9,
      "walk": 0.55,
      "variation": 0.5,
      "layers": [
        0,
        5,
        6,
        8,
        10,
        11,
        12,
        13,
        15,
        17,
        20,
        24,
        25,
        29,
        31
      ]
    },
    "index": 8
  },
  {
    "id": "mirror",
    "title": "The salt mirror",
    "subtitle": "The sky has a floor",
    "description": "A flat white plain holds a film of water, and the sky sinks into it. A few pale slabs hover where the two skies meet.",
    "tag": "MIRROR PLAIN",
    "palette": [
      "#d7e2e0",
      "#8fb3bf",
      "#f1e6d0"
    ],
    "coordinates": "S–512 · FLAT 02",
    "chapter": "X · Two skies",
    "cameraLabel": "Skating on the mirror",
    "sound": {
      "key": "A",
      "mode": "ionian",
      "size": 0.75,
      "walk": 0.3,
      "variation": 0.4,
      "layers": [
        0,
        2,
        4,
        5,
        8,
        9,
        10,
        11,
        12,
        16,
        17,
        19,
        24,
        26,
        28
      ]
    },
    "index": 9
  },
  {
    "id": "fog",
    "title": "The fog columns",
    "subtitle": "Distance, in layers",
    "description": "Tall dark pillars stand in the mist, each one paler than the last. You can count the distance by their silhouettes.",
    "tag": "LAYERED MIST",
    "palette": [
      "#9fb2ae",
      "#33433f",
      "#d8d3c0"
    ],
    "coordinates": "F–207 · MIST 11",
    "chapter": "XI · Layers of distance",
    "cameraLabel": "Walking between the pillars",
    "sound": {
      "key": "E",
      "mode": "dorian",
      "size": 0.6,
      "walk": 0.6,
      "variation": 0.6,
      "layers": [
        0,
        1,
        3,
        4,
        5,
        6,
        9,
        11,
        12,
        13,
        14,
        20,
        22,
        25,
        26,
        31
      ]
    },
    "index": 10
  },
  {
    "id": "orrery",
    "title": "The orrery",
    "subtitle": "Small worlds keeping time",
    "description": "Thin rings turn around a quiet sphere, and small moons keep their own slow hours in the dark.",
    "tag": "CELESTIAL MECHANICS",
    "palette": [
      "#d8b36a",
      "#3b4a7a",
      "#e8e2d0"
    ],
    "coordinates": "O–001 · RING 04",
    "chapter": "XII · The slow machine",
    "cameraLabel": "Circling the rings",
    "sound": {
      "key": "F#",
      "mode": "mixolydian",
      "size": 1,
      "walk": 0.45,
      "variation": 0.4,
      "layers": [
        0,
        1,
        2,
        8,
        10,
        16,
        17,
        18,
        19,
        20,
        23,
        24,
        25,
        29,
        30
      ]
    },
    "index": 11
  }
];

export const PRESETS = [
  {
    "name": "The blue hour",
    "world": 0,
    "speed": 0.24,
    "grain": 0.34,
    "intensity": 0.48,
    "seed": 2049
  },
  {
    "name": "The slow tides",
    "world": 1,
    "speed": 0.18,
    "grain": 0.28,
    "intensity": 0.58,
    "seed": 1977
  },
  {
    "name": "The dreaming machine",
    "world": 2,
    "speed": 0.42,
    "grain": 0.42,
    "intensity": 0.78,
    "seed": 6262
  },
  {
    "name": "Sand in time",
    "world": 3,
    "speed": 0.12,
    "grain": 0.56,
    "intensity": 0.54,
    "seed": 3001
  },
  {
    "name": "The growing night",
    "world": 4,
    "speed": 0.22,
    "grain": 0.32,
    "intensity": 0.64,
    "seed": 1982
  },
  {
    "name": "The polar silence",
    "world": 5,
    "speed": 0.16,
    "grain": 0.2,
    "intensity": 0.4,
    "seed": 4113
  },
  {
    "name": "The weightless stones",
    "world": 6,
    "speed": 0.28,
    "grain": 0.3,
    "intensity": 0.56,
    "seed": 7272
  },
  {
    "name": "Beneath the world’s skin",
    "world": 7,
    "speed": 0.3,
    "grain": 0.46,
    "intensity": 0.72,
    "seed": 8088
  },
  {
    "name": "Altitude",
    "world": 8,
    "speed": 0.22,
    "grain": 0.22,
    "intensity": 0.5,
    "seed": 9100
  },
  {
    "name": "The thin water",
    "world": 9,
    "speed": 0.18,
    "grain": 0.18,
    "intensity": 0.45,
    "seed": 4242
  },
  {
    "name": "Counting the mist",
    "world": 10,
    "speed": 0.2,
    "grain": 0.36,
    "intensity": 0.5,
    "seed": 5151
  },
  {
    "name": "Slow machinery",
    "world": 11,
    "speed": 0.26,
    "grain": 0.3,
    "intensity": 0.6,
    "seed": 6006
  }
];

const FILM = [
  {
    "arrival": "A clearing of crystal opens in the mist.",
    "passage": "The towers part; an entire garden appears.",
    "trace": "A single edge still holds the light."
  },
  {
    "arrival": "A reflection cuts across the surface.",
    "passage": "The sky descends until it touches the waves.",
    "trace": "The rings remain; the tide carries us on."
  },
  {
    "arrival": "A cube floats between its own absences.",
    "passage": "Each chamber opens into another.",
    "trace": "Matter fades; its light remains."
  },
  {
    "arrival": "The sand holds the edge of night.",
    "passage": "A valley appears beyond the ridge.",
    "trace": "The eclipse rests inside one final note."
  },
  {
    "arrival": "Night takes shelter beneath a canopy.",
    "passage": "The undergrowth becomes a constellation.",
    "trace": "One small light keeps breathing."
  },
  {
    "arrival": "The cold has left a door open.",
    "passage": "Another arch waits beyond the first.",
    "trace": "The sky passes through what the ice holds."
  },
  {
    "arrival": "The stone has forgotten how to fall.",
    "passage": "The garden opens between two islands.",
    "trace": "A piece of earth remains in the sky."
  },
  {
    "arrival": "The surface still shelters a little fire.",
    "passage": "The veins draw another geography.",
    "trace": "Beneath the stone, time keeps melting."
  },
  {
    "arrival": "The sun finds the edge of the clouds.",
    "passage": "The peaks drift past like slow ships.",
    "trace": "The light stays; the weather moves on."
  },
  {
    "arrival": "The horizon holds its breath.",
    "passage": "The slabs float above their own reflections.",
    "trace": "Two skies, and you between them."
  },
  {
    "arrival": "The first pillar leaves the mist.",
    "passage": "Each pillar is paler than the last.",
    "trace": "The farthest one is only a rumor."
  },
  {
    "arrival": "A ring begins to turn.",
    "passage": "The small moons keep their hours.",
    "trace": "The sphere stays; the rings go on."
  }
];

const TITLE_FRAGMENTS = [
  [
    "The memory of crystals",
    "A garden after us",
    "The shadow of green worlds",
    "Time grows in silence",
    "A season of copper",
    "The light beneath the stone"
  ],
  [
    "The ocean that remembers",
    "Rings in the night",
    "The tide of the absent",
    "At the surface of the sky",
    "The weight of a moon",
    "A shore with no return"
  ],
  [
    "The chamber of echoes",
    "Infinity in a whisper",
    "A door in the light",
    "The geometries of silence",
    "What the voids know",
    "The space between two notes"
  ],
  [
    "The ashes of tomorrow",
    "A night the color of gold",
    "The desert after hours",
    "The eclipse awaits us",
    "The wind beneath the stars",
    "The last warmth"
  ],
  [
    "The memory of spores",
    "A forest in the night",
    "The canopies of silence",
    "The garden of small lights",
    "Beneath the living sky",
    "The patience of growing things"
  ],
  [
    "Winter has a doorway",
    "The chambers of cold",
    "An arch for the sky",
    "Time beneath the ice",
    "The white silences",
    "The other side of frost"
  ],
  [
    "The weight of light",
    "The earth that never falls",
    "The gardens of the sky",
    "An archipelago between hours",
    "The gentleness of vertigo",
    "Stones on a journey"
  ],
  [
    "The fire beneath the skin",
    "The slowness of volcanoes",
    "The marble remembers",
    "The veins of evening",
    "The stone still living",
    "A geography of embers"
  ],
  [
    "Above the weather",
    "The first light holds still",
    "A sea that never breaks",
    "Peaks like slow ships",
    "Morning without ground",
    "The height of silence"
  ],
  [
    "Two skies, one horizon",
    "The floor remembers the clouds",
    "A lake of salt and light",
    "Where reflection begins",
    "The slow noon",
    "The thin water"
  ],
  [
    "Count the distance in grey",
    "Between the pillars",
    "The hour of mist",
    "A hall with no roof",
    "Layers of quiet",
    "The pale edge of things"
  ],
  [
    "The small machine of hours",
    "Rings that keep time",
    "A moon with its own clock",
    "The patient geometry",
    "Slow worlds in the dark",
    "The orbit of silence"
  ]
];

/** Nested grammars: the same seed always draws the same name. */
export const DISCOVERY_GRAMMARS = [
  "The {gardens|orchards|terraces|groves} {of {Nacre|Vesper|Talos|Iona|Lys|Ophir}|of {silence|daybreak|dusk|return}}",
  "The {sea|tide|lagoon|bay} {of {Selene|Nacre|Vesper|Serein|Lys|Ophir}|of {silence|return|the open sky|dusk}}",
  "The {cube|sanctuary|monument|temple} {of {Nadir|Vesper|Talos|Iona|Serein|Ophir}|of {the void|silence|return|vertigo}}",
  "The {dunes|ashes|plains|lands} {of {Solis|Nacre|Vesper|Iona|Nadir|Ophir}|of {the last evening|return|sunset|silence}}",
  "The {forest|clearing|woodland edge|canopy} {of {Mycene|Nacre|Vesper|Iona|Lys|Serein}|of {early morning|silence|return|dusk}}",
  "The {gates|arches|ice fields|bridges} {of {Boreal|Nacre|Vesper|Iona|Nadir|Serein}|of {the great cold|silence|return|white morning}}",
  "The {islands|stones|terraces|gardens} {of {Levane|Nacre|Vesper|Iona|Talos|Lys}|of {the slow sky|silence|return|vertigo}}",
  "The {veins|embers|rocks|fissures} {of {Solis|Nacre|Vesper|Ophir|Talos|Nadir}|of {the slow fire|silence|return|last evening}}",
  "The {sea|tide|plain|drift} {of {Aurel|Vesper|Iona|Lys|Ophir|Serein}|of {first light|morning|return|the high air}}",
  "The {mirror|salt|flats|lake} {of {Nadir|Vesper|Talos|Iona|Serein|Ophir}|of {two skies|silence|return|noon}}",
  "The {pillars|columns|hall|colonnade} {of {Nacre|Vesper|Talos|Iona|Lys|Serein}|of {mist|silence|return|the grey hour}}",
  "The {orrery|astrolabe|clockwork|rings} {of {Selene|Talos|Vesper|Iona|Nadir|Ophir}|of {slow hours|silence|return|small moons}}"
];

const FORMS = [
  [
    "Lower, more widely separated columns leave broad clearings in the mineral garden.",
    "Crystal towers of varied heights form a balanced mineral garden.",
    "Taller, more closely grouped towers form a dense mineral forest."
  ],
  [
    "A dark sea stretches toward a smaller, lower mineral island.",
    "A stone island punctuates the expanse of the dark sea.",
    "A broader, taller mineral island rises from the dark sea."
  ],
  [
    "A compact cube pierced with repeated square chambers floats above the ground.",
    "A balanced cubical monument opens its square chambers into the night.",
    "A broader monumental cube reveals a deep network of repeated square chambers."
  ],
  [
    "Long, widely spaced dunes surround slender mineral monoliths.",
    "Balanced dune ridges guide the eye toward distant monoliths.",
    "More closely spaced ridges fold the desert around the mineral monoliths."
  ],
  [
    "Lower, more widely separated mushroom canopies leave generous clearings.",
    "Mushroom-like organisms of varied heights form a luminous forest.",
    "Taller, more closely grouped mushroom canopies form a dense luminous forest."
  ],
  [
    "Broad, lower ice arches open across the frozen plain.",
    "Ice arches balance their curved spans in the light.",
    "Taller ice arches raise their open passages against the cold sky."
  ],
  [
    "Stone islands gather into a compact suspended garden.",
    "Stone islands form an archipelago at several heights.",
    "More widely separated islands let open sky pass through the archipelago."
  ],
  [
    "Broad mineral bands fold around widely spaced incandescent veins.",
    "Dark ridges and luminous veins form a volcanic marble landscape.",
    "More tightly spaced folds multiply the veins across the volcanic plain."
  ],
  [
    "Soft, low cloud banks lie beneath a few distant peaks.",
    "A broad sea of cloud rolls beneath dark peaks.",
    "Tall peaks pierce a deep, billowing sea of cloud."
  ],
  [
    "A wide, empty mirror holds a few low slabs.",
    "Pale slabs hover above their own reflections.",
    "Many tall slabs rise from the thin sheet of water."
  ],
  [
    "Widely spaced pillars stand in generous mist.",
    "Pillars of different heights recede into layered mist.",
    "Close-set pillars form a deep colonnade of fog."
  ],
  [
    "A few slender rings turn around a small, quiet sphere.",
    "Rings and small moons keep their slow, separate hours.",
    "A dense lattice of rings circles a large, pale sphere."
  ]
];

const SUBTITLE_GRAMMAR = "{An elsewhere that takes its time|A landscape in a whisper|A memory from far away|A world between two notes|A light that belongs to no one|A horizon for another day|Silence has found a shape|A dream with its own gravity}";

const POETRY_GRAMMAR = "Here, {the light|the silence|time|the horizon} {seems to {hold its breath|remember tomorrow}|keeps {an ancient secret|a place for us}}.";

function worldFrom(value) {
  if (typeof value === 'number') return WORLDS[value] || WORLDS[0];
  if (typeof value === 'string') return WORLDS.find((world) => world.id === value) || WORLDS[0];
  if (value && typeof value === 'object') {
    const index = Number.isInteger(value.baseIndex) ? value.baseIndex : value.index;
    const base = WORLDS[index] || WORLDS.find((world) => world.id === value.id) || WORLDS[0];
    return { ...base, ...value, index: base.index, baseIndex: base.index };
  }
  return WORLDS[0];
}

function normalizeSeed(value = 2049) {
  const number = Number(value);
  const raw = Number.isFinite(number) ? Math.abs(Math.trunc(number)) : hash(String(value));
  return raw ? ((raw - 1) % 999999) + 1 : 1;
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shared with the renderer: these four continuous traits drive visible forms. */
export function seedTraits(seed, baseIndex = 0) {
  const index = Math.max(0, Math.min(WORLDS.length - 1, Math.trunc(Number(baseIndex) || 0)));
  const rng = seededRandom(hash(`${normalizeSeed(seed)}:${index}:orbite-v2`));
  return { geometry: rng(), sky: rng(), light: rng(), composition: rng() };
}

function tintedPalette(palette, light) {
  const target = light < 0.5 ? [114, 188, 202] : [213, 165, 116];
  const weight = Math.abs(light - 0.5) * 0.28;
  return palette.map((color) => {
    const source = [1, 3, 5].map((start) => parseInt(color.slice(start, start + 2), 16));
    return `#${source.map((channel, index) => Math.round(channel * (1 - weight) + target[index] * weight).toString(16).padStart(2, '0')).join('')}`;
  });
}

/** A reproducible place: the same seed gives the same name, form, sky, light and palette. */
export function createWorld(seed, baseIndex) {
  const number = normalizeSeed(seed);
  const requested = Number(baseIndex);
  const index = baseIndex != null && Number.isFinite(requested)
    ? Math.max(0, Math.min(WORLDS.length - 1, Math.trunc(requested)))
    : hash(`destination:${number}`) % WORLDS.length;
  const base = WORLDS[index];
  const traits = seedTraits(number, index);
  const expand = (text, channel) => resolveWildcard(text, seededRandom(hash(`${number}:${index}:${channel}`)));
  const band = traits.geometry < 1 / 3 ? 0 : traits.geometry < 2 / 3 ? 1 : 2;
  const secondMoon = [0, 1, 4, 6, 7].includes(index) && traits.sky > 0.62;
  const haze = traits.sky < 0.34 ? 'Light atmospheric haze leaves the distance open.' : traits.sky < 0.67 ? 'Layered atmospheric haze softens the distance.' : 'Deeper atmospheric haze separates the landscape into layers.';
  const sky = `${haze}${secondMoon ? ' A small secondary moon accompanies the sky.' : ''}`;
  const location = `${base.id.slice(0, 1).toUpperCase()}–${String(number).padStart(6, '0')}`;
  const sector = String((hash(`${number}:sector`) % 89) + 10);
  return {
    ...base,
    id: `discovery-${base.id}-${number}`,
    index, baseIndex: index, world: index, seed: number, generated: true, recipeVersion: 3,
    title: expand(DISCOVERY_GRAMMARS[index], 'name'),
    subtitle: expand(SUBTITLE_GRAMMAR, 'subtitle'),
    description: `${FORMS[index][band]} ${sky} ${expand(POETRY_GRAMMAR, 'poetry')}`,
    coordinates: `${location} · SECTOR ${sector}`,
    palette: tintedPalette(base.palette, traits.light),
    variant: { ...traits, secondMoon },
  };
}

/** Resolve the simple, serializable app state into the place being shown. */
export function getWorld(state = {}) {
  const safe = state && typeof state === 'object' ? state : {};
  if (safe.generated || safe.generatedWorld || safe.discoverySeed != null) {
    const stored = safe.generatedWorld && typeof safe.generatedWorld === 'object' ? safe.generatedWorld : {};
    return createWorld(safe.discoverySeed ?? safe.seed ?? stored.seed, safe.world ?? stored.baseIndex);
  }
  return WORLDS[safe.world] || WORLDS[0];
}

/**
 * Resolve {one|two|{three|four}} while preserving unmatched and literal braces.
 * Backslash-escaped delimiters remain untouched. rng may be seeded by callers.
 */
export function resolveWildcard(input, rng = Math.random) {
  const source = input == null ? '' : String(input);
  const random = typeof rng === 'function' ? rng : Math.random;

  function resolve(text, depth) {
    if (depth > 32) return text;
    let result = '';
    for (let cursor = 0; cursor < text.length;) {
      if (text[cursor] === '\\' && cursor + 1 < text.length) {
        result += text.slice(cursor, cursor + 2);
        cursor += 2;
        continue;
      }
      if (text[cursor] !== '{') {
        result += text[cursor++];
        continue;
      }
      let level = 1;
      let end = cursor + 1;
      const boundaries = [];
      for (; end < text.length && level > 0; end++) {
        const char = text[end];
        if (char === '\\') { end++; continue; }
        if (char === '{') level++;
        else if (char === '}') level--;
        else if (char === '|' && level === 1) boundaries.push(end);
      }
      if (level !== 0) {
        result += text.slice(cursor);
        break;
      }
      const close = end - 1;
      if (!boundaries.length) {
        result += `{${resolve(text.slice(cursor + 1, close), depth + 1)}}`;
      } else {
        const stops = [cursor, ...boundaries, close];
        let sample;
        try { sample = Number(random()); } catch { sample = 0; }
        const bounded = Number.isFinite(sample) ? Math.max(0, Math.min(0.999999999999, sample)) : 0;
        const choice = Math.floor(bounded * (stops.length - 1));
        result += resolve(text.slice(stops[choice] + 1, stops[choice + 1]), depth + 1);
      }
      cursor = end;
    }
    return result;
  }

  return resolve(source, 0);
}

function hash(text) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index++) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

export function remixTitle(world, seed = 2049) {
  const selected = worldFrom(world);
  if (selected.generated) return selected.title;
  const titles = TITLE_FRAGMENTS[selected.index];
  return titles[hash(`${selected.id}:${String(seed)}`) % titles.length];
}

/** Three director's cues, with a complete running time of 24 seconds. */
export function buildFlightPlan(world, state = {}) {
  const selected = worldFrom(world);
  const scene = FILM[selected.index];
  const speed = Number.isFinite(state?.speed) ? Math.max(0, Math.min(1, state.speed)) : 0.3;
  return [
    { title: '01 · Make room for silence', duration: 7, caption: selected.generated ? selected.subtitle : scene.arrival },
    { title: `02 · ${speed < 0.3 ? 'Let the world come closer' : 'Move through the light'}`, duration: 10, caption: scene.passage },
    { title: '03 · Keep a trace', duration: 7, caption: `${scene.trace} “${remixTitle(selected, state?.seed ?? 2049)}”` },
  ];
}
