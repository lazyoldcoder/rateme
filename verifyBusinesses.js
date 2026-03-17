import fetch from 'node-fetch';

const WORKER_URL = 'https://rateme.gatekeeper2.workers.dev';

async function verifyBusinesses() {
  try {
    // const res = await fetch(`${WORKER_URL}/businesses.json`);
    const res = await fetch(`${WORKER_URL}/api/businesses`);
    if (!res.ok) {
      console.error('Failed to fetch businesses:', res.status, res.statusText);
      return;
    }

    const businesses = await res.json();

    console.log('Businesses in KV:');
    businesses.forEach(b => {
      // Automatically print all fields of the business
      const fields = Object.entries(b)
        .map(([key, value]) => `${key}:${value}`)
        .join(', ');
      console.log(`- ${b.id}: ${fields}`);
    });

  } catch (err) {
    console.error('Error fetching businesses:', err);
  }
}

verifyBusinesses();





// import fetch from 'node-fetch';

// const WORKER_URL = 'https://rateme.gatekeeper2.workers.dev';

// async function verifyBusinesses() {
//   try {
//     const res = await fetch(`${WORKER_URL}/businesses.json`);
//     if (!res.ok) {
//       console.error('Failed to fetch businesses:', res.status, res.statusText);
//       return;
//     }
//     const businesses = await res.json();
    
    
    
//     console.log('Businesses in KV:');
//     businesses.forEach(b => {
//       console.log(`- ${b.id}: ${b.name} (${b.location}, lat:${b.lat}, lng:${b.lng}, img:${b.img})`);
//     });
  
  
  
  
  
//   } catch (err) {
//     console.error('Error fetching businesses:', err);
//   }
// }

// verifyBusinesses();