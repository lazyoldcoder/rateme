// test-ratings.js
// import fetch from "node-fetch";

const baseUrl = "http://localhost:8787/api/ratings";

async function testRatings() {
  try {
    // 1️⃣ GET current ratings
    let res = await fetch(baseUrl);
    let ratings = await res.json();
    console.log("Current ratings:", ratings);

    // 2️⃣ POST some new ratings
    const newRatings = [
      { rating: 3, comment: "Test A" },
      { rating: 5, comment: "Test B" },
      { rating: 4, comment: "Test C" },
    ];

    for (const r of newRatings) {
      res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(r),
      });
      const result = await res.json();
      console.log("Added rating:", result);
    }

    // 3️⃣ GET ratings again to verify storage
    res = await fetch(baseUrl);
    ratings = await res.json();
    console.log("Updated ratings:", ratings);
  } catch (err) {
    console.error("Test error:", err);
  }
}

testRatings();
