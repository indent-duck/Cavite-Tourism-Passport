#!/usr/bin/env node
/**
 * Builds the expressway lines for the About Cavite map from OpenStreetMap and
 * writes them to supabase/migrations/006_expressway_routes.sql.
 *
 *   node scripts/build-expressway-routes.mjs [--preview <file.geojson>]
 *
 * --preview also writes the lines as GeoJSON, to check them on geojson.io.
 *
 * Re-run when a new section opens (or OpenStreetMap fixes a road), then run
 * the regenerated SQL file in the Supabase SQL editor. No dependencies: needs
 * Node 18+ (global fetch).
 *
 * How a route is built:
 *   1. Overpass returns every motorway piece whose name matches (links and
 *      ramps are `motorway_link` and left out). Each direction of a divided
 *      expressway is its own one-way road, split into many short pieces.
 *   2. Pieces that share an end point are joined into long lines, so the
 *      simplification in step 3 has something to work with (a 2-point piece
 *      can't lose any points).
 *   3. Douglas-Peucker simplification (SIMPLIFY_METERS), then coordinates are
 *      rounded to 5 decimals (about 1 m).
 *   4. One MultiLineString per expressway: the two directions, plus any
 *      separate open sections, are its parts.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_SQL = resolve(ROOT, 'supabase/migrations/006_expressway_routes.sql');

/**
 * `name` must match public.expressways.name. `osm` matches OpenStreetMap's
 * `name` tag, which mixes hyphens and en dashes (hence the `.`) and has at
 * least one typo ("Expresswayy", hence no `$`).
 */
const EXPRESSWAYS = [
  { name: 'CAVITEX', osm: '^Manila.Cavite Expressway' },
  { name: 'CAVITEX C5 Link', osm: '^CAVITEX.C-5 Link' },
  // The CAVITEX–CALAX Link is the ~2 km piece in Kawit between CAVITEX's
  // south end and CALAX's north end. Drawn as part of CALAX so the two lines
  // meet instead of leaving a gap.
  { name: 'CALAX', osm: '^(Cavite.Laguna Expressway|CAVITEX.CALAX Link)' },
];

// south, west, north, east: Cavite plus the Metro Manila and Laguna ends
const BBOX = [14.0, 120.7, 14.65, 121.2];

const SIMPLIFY_METERS = 10;
const DECIMALS = 5;

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

// ---------------------------------------------------------------------------

async function fetchWays() {
  const nameRegex = EXPRESSWAYS.map((e) => e.osm.replace(/^\^/, '')).join('|');
  const query = `[out:json][timeout:90];
way["highway"="motorway"]["name"~"^(${nameRegex})"](${BBOX.join(',')});
out geom tags;`;

  for (const url of OVERPASS_URLS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'expressway-route-builder/1.0',
          },
          body: new URLSearchParams({ data: query }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        return json.elements;
      } catch (error) {
        console.warn(`${url} attempt ${attempt} failed: ${error.message}`);
        await new Promise((r) => setTimeout(r, 3000 * attempt));
      }
    }
  }
  throw new Error('Every Overpass server failed; try again later');
}

/** Joins lines that share an end point (in either direction) into longer lines. */
function joinLines(lines) {
  const key = (p) => `${p[0]},${p[1]}`;
  const byEndpoint = new Map();
  lines.forEach((line, i) => {
    for (const p of [line[0], line[line.length - 1]]) {
      const k = key(p);
      if (!byEndpoint.has(k)) byEndpoint.set(k, []);
      byEndpoint.get(k).push(i);
    }
  });

  const used = new Set();
  const takeLineAt = (point) => {
    const i = (byEndpoint.get(key(point)) ?? []).find((j) => !used.has(j));
    if (i === undefined) return null;
    used.add(i);
    const line = lines[i];
    // Oriented to start at `point`
    return key(line[0]) === key(point) ? line : [...line].reverse();
  };

  const joined = [];
  lines.forEach((start, i) => {
    if (used.has(i)) return;
    used.add(i);
    let line = [...start];
    for (let next; (next = takeLineAt(line[line.length - 1])); ) {
      line.push(...next.slice(1));
    }
    for (let prev; (prev = takeLineAt(line[0])); ) {
      line = [...prev.reverse().slice(0, -1), ...line];
    }
    joined.push(line);
  });
  return joined;
}

/** Douglas-Peucker, with the tolerance in meters (local flat projection). */
function simplify(line, toleranceMeters) {
  if (line.length <= 2) return line;
  const lat0 = (line[0][1] * Math.PI) / 180;
  const xy = line.map(([lon, lat]) => [lon * 111320 * Math.cos(lat0), lat * 110540]);

  const distanceToSegment = (p, a, b) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq === 0
      ? 0
      : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lengthSq));
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
  };

  const keep = new Uint8Array(line.length);
  keep[0] = keep[line.length - 1] = 1;
  const stack = [[0, line.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDistance = 0;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const d = distanceToSegment(xy[i], xy[first], xy[last]);
      if (d > maxDistance) {
        maxDistance = d;
        index = i;
      }
    }
    if (maxDistance > toleranceMeters) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return line.filter((_, i) => keep[i]);
}

function roundLine(line) {
  const factor = 10 ** DECIMALS;
  const rounded = line.map(([lon, lat]) => [
    Math.round(lon * factor) / factor,
    Math.round(lat * factor) / factor,
  ]);
  return rounded.filter(
    (p, i) => i === 0 || p[0] !== rounded[i - 1][0] || p[1] !== rounded[i - 1][1],
  );
}

/** GeoJSON with one part per line, so the SQL file stays readable. */
function geometryJson(geometry) {
  const parts = geometry.coordinates.map((part) => JSON.stringify(part));
  return `{"type":"MultiLineString","coordinates":[\n${parts.join(',\n')}\n]}`;
}

function buildSql(routes, fetchedOn) {
  const values = routes
    .map(({ name, geometry }) => `  ('${name}', '${geometryJson(geometry)}')`)
    .join(',\n\n');
  const names = routes.map(({ name }) => `'${name}'`).join(', ');

  return `-- 006: expressway route lines for the About Cavite map (${fetchedOn})
--
-- Adds expressways.route: the expressway as a GeoJSON LineString or
-- MultiLineString ([longitude, latitude] pairs), drawn on the About Cavite
-- map. An expressway without a route still shows its card, just no line.
--
-- GENERATED by scripts/build-expressway-routes.mjs from OpenStreetMap data
-- (c) OpenStreetMap contributors, ODbL. Don't edit the coordinates by hand:
-- re-run the script when a new section opens, then run this file again.
--
-- Safe to run more than once.

begin;

alter table public.expressways
  add column if not exists route jsonb;

alter table public.expressways
  drop constraint if exists expressways_route_geojson;

alter table public.expressways
  add constraint expressways_route_geojson check (
    route is null
    or (route ->> 'type' in ('LineString', 'MultiLineString')
        and jsonb_typeof(route -> 'coordinates') = 'array')
  );

update public.expressways e
   set route = v.route::jsonb
  from (values
${values}
  ) as v (name, route)
 where e.name = v.name;

-- Every route above must have matched an expressway by name
do $$
declare
  missing text;
begin
  select string_agg(n, ', ') into missing
    from unnest(array[${names}]) as n
   where not exists (select 1 from public.expressways where name = n);
  if missing is not null then
    raise exception 'No expressway named: %', missing;
  end if;
end;
$$;

commit;
`;
}

// ---------------------------------------------------------------------------

const previewIndex = process.argv.indexOf('--preview');
const previewPath = previewIndex > -1 ? resolve(process.argv[previewIndex + 1]) : null;

const ways = await fetchWays();
const fetchedOn = new Date().toISOString().slice(0, 10);

const routes = EXPRESSWAYS.map(({ name, osm }) => {
  const pattern = new RegExp(osm);
  const pieces = ways
    .filter((way) => pattern.test(way.tags.name))
    .map((way) => way.geometry.map(({ lon, lat }) => [lon, lat]));
  if (pieces.length === 0) throw new Error(`No OpenStreetMap roads matched ${name}`);

  const parts = joinLines(pieces)
    .map((line) => roundLine(simplify(line, SIMPLIFY_METERS)))
    .filter((line) => line.length >= 2);
  const geometry = { type: 'MultiLineString', coordinates: parts };

  const pointsBefore = pieces.reduce((sum, piece) => sum + piece.length, 0);
  const pointsAfter = parts.reduce((sum, part) => sum + part.length, 0);
  console.log(
    `${name.padEnd(16)} ${String(pieces.length).padStart(3)} pieces -> ${String(parts.length).padStart(2)} lines, ` +
      `${pointsBefore} -> ${pointsAfter} points, ${(JSON.stringify(geometry).length / 1024).toFixed(1)} KB`,
  );
  return { name, geometry };
});

writeFileSync(OUTPUT_SQL, buildSql(routes, fetchedOn));
console.log(`\nWrote ${OUTPUT_SQL}`);

if (previewPath) {
  mkdirSync(dirname(previewPath), { recursive: true });
  const featureCollection = {
    type: 'FeatureCollection',
    features: routes.map(({ name, geometry }) => ({
      type: 'Feature',
      properties: { name },
      geometry,
    })),
  };
  writeFileSync(previewPath, JSON.stringify(featureCollection));
  console.log(`Wrote ${previewPath}`);
}
