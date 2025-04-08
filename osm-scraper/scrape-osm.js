// scrape-osm.js (für Gastro)
import fetch from 'node-fetch';
import fs from 'fs';

const query = `
[out:json][timeout:25];
area["name"="Zürich"]->.searchArea;
(
  node["amenity"="restaurant"](area.searchArea);
  node["amenity"="cafe"](area.searchArea);
);
out body;
>;
out skel qt;
`;

async function run() {
  console.log('🔍 Hole Gastro-Daten von Overpass API...');
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
      type: 'Gastro',
      address: el.tags['addr:street'] || '',
      city: 'Zürich',
      phone: el.tags['phone'] || '',
      website: el.tags['website'] || ''
    }));

  fs.writeFileSync('osm-gastro.json', JSON.stringify(results, null, 2));
  console.log(`✅ ${results.length} Gastro-Einträge gespeichert in osm-gastro.json`);
}

run();
