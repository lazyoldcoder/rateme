// SECTION 1 Durable Object class ------------------------------------------------------------------

export class MyDurableObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  // helper: get all ratings from DO storage
  async getRatings() {
    let ratings = await this.state.storage.get("ratings");
    if (!ratings) ratings = [];
    return ratings;
  }

  // helper: save ratings array
  async saveRatings(ratings) {
    await this.state.storage.put("ratings", ratings);
  }

  async fetch(request) {
    const ratings = await this.getRatings();

    if (request.method === "GET") {
      // return all ratings as an array
      return new Response(JSON.stringify(ratings), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (request.method === "POST") {
      // add new rating
      const newRating = await request.json();
      ratings.push(newRating);
      await this.saveRatings(ratings);
      return new Response(JSON.stringify(newRating), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  }
}







// SECTION 2 --- Worker Default Export for the Worker ----------------------------------------------
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- Favicon ---
    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });

    // --- Ratings (Durable Object) ---
    if (url.pathname.startsWith("/api/ratings")) {
      try {
        const stub = env.MY_DURABLE_OBJECT.getByName("rateme");
        return await stub.fetch(request);
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // --- Users (KV) ---
    if (url.pathname === "/api/users") {
      const username = url.searchParams.get("username");
      if (!username) return new Response("Missing username", { status: 400 });

      let user = await env.USERS_KV.get(username, { type: "json" });
      if (!user) {
        user = { username, email: "", phone: "" };
        await env.USERS_KV.put(username, JSON.stringify(user));
      }

      return new Response(JSON.stringify(user), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // --- Static assets fallback ---
    try {
      return await fetch(request);
    } catch (err) {
      return new Response("Not found", { status: 404 });
    }
  },
};
