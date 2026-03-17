// seedBusinesses.js
import fetch from "node-fetch"; // ensure node-fetch is installed: npm install node-fetch

// Replace with your deployed Worker URL
const WORKER_URL = "https://rateme.gatekeeper2.workers.dev/api/businesses";

const businesses = [
  {
    "id": "johns-coffee",
    "name": "Johns Coffee",
    "email": "info@johnscoffee.nz",
    "location": "19CF",
    "lat": -36.88405,
    "lng": 174.83155,
    "img": "images/johns-coffee.jpg"
  },
  {
    "id": "jills-hair",
    "name": "Jills Hair",
    "email": "contact@jillshair.co.nz",
    "location": "44NG",
    "lat": -36.88401,
    "lng": 174.83694,
    "img": "images/jills-hair.jpg"
  },
  {
    "id": "jack-plumber",
    "name": "Jack Plumber",
    "email": "jack@plumbingservices.nz",
    "location": "41MG",
    "lat": -36.88502,
    "lng": 174.83597,
    "img": "images/jack-plumber.jpg"
  },
  {
    "id": "test-4",
    "name": "Test Business 4",
    "email": "test4@example.com",
    "location": "72PN",
    "lat": -36.88242,
    "lng": 174.83439,
    "img": ""
  },
  {
    "id": "test-5",
    "name": "Test Business 5",
    "email": "test5@example.com",
    "location": "58PN",
    "lat": -36.88099,
    "lng": 174.83491,
    "img": ""
  },
  {
    "id": "test-6",
    "name": "Test Business 6",
    "email": "test6@example.com",
    "location": "52PN",
    "lat": -36.87965,
    "lng": 174.83529,
    "img": ""
  },
  {
    "id": "test-7",
    "name": "Test Business 7",
    "email": "test7@example.com",
    "location": "38HG",
    "lat": -36.87799,
    "lng": 174.83414,
    "img": ""
  },
  {
    "id": "test-8",
    "name": "Test Business 8",
    "email": "test8@example.com",
    "location": "22GB",
    "lat": -36.87582,
    "lng": 174.83672,
    "img": ""
  },
  {
    "id": "test-9",
    "name": "Test Business 9",
    "email": "test9@example.com",
    "location": "94PN",
    "lat": -36.88237,
    "lng": 174.83593,
    "img": ""
  },
  {
    "id": "test-10",
    "name": "Test Business 10",
    "email": "test10@example.com",
    "location": "24NG",
    "lat": -36.88291,
    "lng": 174.83813,
    "img": ""
  },
  {
    "id": "test-11",
    "name": "Test Business 11",
    "email": "test11@example.com",
    "location": "17MG",
    "lat": -36.88362,
    "lng": 174.83771,
    "img": ""
  }
];

async function seed() {
  for (const business of businesses) {
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(business),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`Failed to seed: ${business.id}`, res.status, text);
        continue;
      }

      const data = await res.json();
      console.log(`Seeded: ${data.id}`);
    } catch (err) {
      console.error(`Error seeding ${business.id}:`, err.message);
    }
  }
}

seed();