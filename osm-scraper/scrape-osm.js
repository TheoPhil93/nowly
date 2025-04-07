// scrape-osm.js
import fetch from 'node-fetch';
import fs from 'fs';

const query = `
[out:json][timeout:25];
area["name"="Zürich"]->.searchArea;
(
  node["shop"="hairdresser"](area.searchArea);
);
out body;
>;
out skel qt;
`;

async function run() {
  console.log('🔍 Hole Daten von Overpass API...');
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  const data = await res.json();

  const results = data.elements
    .filter(el => el.tags && el.tags.name)
    .map(el => ({
      id: el.id,
      name: el.tags.name,
      lat: el.lat,
      lon: el.lon,
      type: 'Friseur',
      address: el.tags['addr:street'] || '',
      city: 'Zürich',
      phone: el.tags['phone'] || '',
      website: el.tags['website'] || ''
    }));

  fs.writeFileSync('osm-friseure.json', JSON.stringify(results, null, 2));
  console.log(`✅ ${results.length} Einträge gespeichert in osm-friseure.json`);
}

run();
