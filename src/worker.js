// Durable Object
export class MyDurableObject {
  constructor(state) {
    this.state = state;

    // Initialize storage safely
    this.state.blockConcurrencyWhile(async () => {
      try {
        const existing = await this.state.storage.get("ratings");
        if (!existing) {
          await this.state.storage.put("ratings", []);
        }
      } catch (err) {
        console.error("DO init error:", err);
      }
    });
  }

  async addRating(data) {
    try {
      const ratings = (await this.state.storage.get("ratings")) || [];
      ratings.push({ ...data, timestamp: Date.now() });
      await this.state.storage.put("ratings", ratings);
      return data;
    } catch (err) {
      console.error("addRating error:", err);
      throw err;
    }
  }

  async getRatings() {
    try {
      return (await this.state.storage.get("ratings")) || [];
    } catch (err) {
      console.error("getRatings error:", err);
      return [];
    }
  }

  async fetch(request) {
    try {
      if (request.method === "POST") {
        const data = await request.json();
        const rating = await this.addRating(data);
        return new Response(JSON.stringify(rating), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      } else if (request.method === "GET") {
        const ratings = await this.getRatings();
        return new Response(JSON.stringify(ratings), {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response("Method not allowed", { status: 405 });
      }
    } catch (err) {
      console.error("DO fetch error:", err);
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
}

// Worker
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle favicon explicitly to avoid 500
    if (url.pathname === "/favicon.ico") {
      return new Response(null, { status: 204 });
    }

    // API route for ratings
    if (url.pathname.startsWith("/api/ratings")) {
      try {
        // Use consistent DO instance name "rateme"
        const stub = env.MY_DURABLE_OBJECT.getByName("rateme");
        return await stub.fetch(request);
      } catch (err) {
        console.error("DO error:", err);
        return new Response(
          JSON.stringify({ error: err.message, stack: err.stack }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Serve static assets from public folder
    try {
      return await fetch(request);
    } catch (err) {
      console.error("Asset fetch error:", err);
      return new Response("Not found", { status: 404 });
    }
  },
};
