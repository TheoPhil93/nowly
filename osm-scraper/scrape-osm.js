// scrape-osm.js
import fetch from 'node-fetch';
import fs from 'fs';

// Overpass Query: alle Kategorien in Zürich
const query = `
[out:json][timeout:25];
area["name"="Zürich"]->.searchArea;
(
  node["healthcare"="dentist"](area.searchArea);
  node["amenity"="pharmacy"](area.searchArea);
  node["healthcare"="physiotherapist"](area.searchArea);
  node["amenity"="veterinary"](area.searchArea);
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
    .map(el => {
      let type = 'Sonstiges';

      if (el.tags.healthcare === 'dentist') type = 'Zahnarzt';
      else if (el.tags.amenity === 'pharmacy') type = 'Apotheke';
      else if (el.tags.healthcare === 'physiotherapist') type = 'Physiotherapie';
      else if (el.tags.amenity === 'veterinary') type = 'Tierarzt';

      return {
        id: el.id,
        name: el.tags.name,
        lat: el.lat,
        lon: el.lon,
        type,
        address: el.tags['addr:street'] || '',
        city: 'Zürich',
        phone: el.tags['phone'] || '',
        website: el.tags['website'] || ''
      };
    });

    fs.writeFileSync('osm-gesundheit.json', JSON.stringify(results, null, 2));
  console.log(`✅ ${results.length} Einträge gespeichert in osm-gesundheit.json`);
}

run(); 
