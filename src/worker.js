// ====================== SECTION 1: Durable Object Class ======================
export class MyDurableObject {
  constructor(state, env) { // 1.1
    this.state = state;
    this.env = env;
  }

  // 1.2 - Fetch handler for ratings
  async fetch(request) {
    let ratings = await this.state.storage.get("ratings");

    if (!Array.isArray(ratings)) { // 1.2a - convert old object-style to array
        if (ratings && typeof ratings === "object") {
            ratings = Object.values(ratings);
        } else {
            ratings = [];
        }
        await this.state.storage.put("ratings", ratings);
    }

    if (request.method === "POST") { // 1.2b - add new rating
        try {
            const newRating = await request.json();
            newRating.id = ratings.length ? ratings[ratings.length - 1].id + 1 : 1;
            newRating.timestamp = newRating.timestamp || new Date().toISOString();
            ratings.push(newRating);
            await this.state.storage.put("ratings", ratings);
            return new Response(JSON.stringify(newRating), { headers: { "Content-Type": "application/json" } });
        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), { status: 400 });
        }
    }

    return new Response(JSON.stringify(ratings), { headers: { "Content-Type": "application/json" } }); // 1.2c
  }
}

// ====================== SECTION 2: Default Worker Export ======================
export default {
  async fetch(request, env) { // 2.1
    const url = new URL(request.url);

    // 2.2 - Favicon
    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });

    // 2.3 - Ratings endpoint
    if (url.pathname.startsWith("/api/ratings")) {
      try {
        const businessId = url.searchParams.get("businessId");
        if (!businessId) return new Response(JSON.stringify({ error: "businessId required" }), { status: 400, headers: { "Content-Type": "application/json" } });
        const stub = env.MY_DURABLE_OBJECT.getByName(`ratings:${businessId}`);
        return await stub.fetch(request);
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // ====================== SECTION 3: USERS API ======================
    if (url.pathname === "/api/users") { // 3.1
      if (request.method === "POST") { // 3.2 - create/update user
        const { username, email, phone } = await request.json();
        if (!username) return new Response(JSON.stringify({ username: null }), { status: 200, headers: { "Content-Type": "application/json" } });
        const existing = await env.USERS_KV.get(username, { type: "json" }) || {};
        const user = { username, email: email || existing.email || "", phone: phone || existing.phone || "" };
        await env.USERS_KV.put(username, JSON.stringify(user));
        return new Response(JSON.stringify(user), { headers: { "Content-Type": "application/json", "Set-Cookie": `rateme_user=${encodeURIComponent(username)}; Path=/; Max-Age=${10*365*24*60*60}; Secure; SameSite=Lax` } });
      }

      // 3.3 - GET: fetch user
      const cookieHeader = request.headers.get("Cookie") || "";
      let username = (cookieHeader.match(/rateme_user=([^;]+)/) || [])[1];
      if (!username) username = url.searchParams.get("username");
      if (!username) return new Response(JSON.stringify({ username: null }), { headers: { "Content-Type": "application/json" } });
      const user = await env.USERS_KV.get(username, { type: "json" });
      return new Response(JSON.stringify(user || { username: null }), { headers: { "Content-Type": "application/json" } });
    }

    // ====================== SECTION 4: BUSINESSES API ======================
    if (url.pathname === "/api/businesses") { // 4.1
      if (request.method === "GET") { // 4.2 - fetch all businesses
        const keys = await env.BUSINESSES_KV.list();
        const allBusinesses = [];
        for (const k of keys.keys) {
          const data = await env.BUSINESSES_KV.get(k.name, { type: "json" });
          if (data) allBusinesses.push(data);
        }
        return new Response(JSON.stringify(allBusinesses), { headers: { "Content-Type": "application/json" } });
      }

      // if (request.method === "POST") { // 4.3 - add/update business
      //   const business = await request.json();
      //   if (!business.email) return new Response(JSON.stringify({ error: "Email required" }), { status: 400 });
      //   const key = business.id;
      //   await env.BUSINESSES_KV.put(key, JSON.stringify(business));
      //   return new Response(JSON.stringify(business), { headers: { "Content-Type": "application/json" } });
      // }


      // 4.3 - add/update business



      // if (request.method === "POST") { 
      //   const business = await request.json();

      //   // 1️⃣ Assign sequential ID
      //   const keys = await env.BUSINESSES_KV.list();
      //   let nextId = 1;
      //   if (keys.keys.length) {
      //       const lastKey = keys.keys[keys.keys.length - 1].name;
      //       const lastBiz = await env.BUSINESSES_KV.get(lastKey, { type: "json" });
      //       nextId = (lastBiz?.id || 0) + 1;
      //   }
      //   business.id = nextId;

      //   // 2️⃣ Optional: default email
      //   if (!business.email) business.email = "";

      //   // 3️⃣ Save to KV
      //   await env.BUSINESSES_KV.put(business.id.toString(), JSON.stringify(business));

      //   // 4️⃣ Return the new business
      //   return new Response(JSON.stringify(business), { headers: { "Content-Type": "application/json" } });
      // }
      


      if (request.method === "POST") { // 4.3 - add business
        const business = await request.json();

        if (!business.name) {
          return new Response(JSON.stringify({ error: "Business name required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }




        // get all existing businesses to determine next ID
        const keys = await env.BUSINESSES_KV.list();

        let nextId = 1;

        if (keys.keys.length > 0) {
          const ids = keys.keys.map(k => parseInt(k.name)).filter(n => !isNaN(n));
          nextId = Math.max(...ids) + 1;
        }



        // let nextId = 1;
        // const keys = await env.BUSINESSES_KV.list();

        // if (keys.keys.length > 0) {
        //   const numericIds = keys.keys
        //     .map(k => parseInt(k.name))
        //     .filter(n => !isNaN(n) && n > 0);

        //   if (numericIds.length > 0) {
        //     nextId = Math.max(...numericIds) + 1;
        //   }
        // }





        business.id = nextId;




        business.created = new Date().toISOString();

        await env.BUSINESSES_KV.put(String(nextId), JSON.stringify(business));

        return new Response(JSON.stringify(business), {
          headers: { "Content-Type": "application/json" }
        });
      }
      
      
      // 4.3 - END of add/update business




    }

    





    // Open your local dev environment with npx wrangler dev (http://localhost:8787).
    // Add a POST /api/businesses/reindex endpoint in your Worker, e.g.:
    // 4.4 - Reindex all businesses with sequential integer IDs
    
    if (url.pathname === "/api/businesses/reindex" && request.method === "POST") {
      try {
        let allBusinesses = [];
        let cursor;

        // 1️⃣ Fetch all businesses (paginated)
        do {
          const { keys, list_complete, cursor: newCursor } = await env.BUSINESSES_KV.list({ cursor });
          for (const k of keys) {
            const data = await env.BUSINESSES_KV.get(k.name, { type: "json" });
            if (data) allBusinesses.push(data);
          }
          cursor = newCursor;
        } while (cursor);

        // 2️⃣ Overwrite IDs with sequential integers
        for (let i = 0; i < allBusinesses.length; i++) {
          const biz = allBusinesses[i];
          biz.id = i + 1; // sequential ID
          if (!biz.created) biz.created = new Date().toISOString(); // optional: add timestamp if missing
          await env.BUSINESSES_KV.put(String(biz.id), JSON.stringify(biz));
        }

        // 3️⃣ Return full reindexed list
        return new Response(JSON.stringify(allBusinesses), {
          headers: { "Content-Type": "application/json" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }





    if (url.pathname === "/api/businesses/raw" && request.method === "GET") {
      const keys = await env.BUSINESSES_KV.list();
      const allBusinesses = [];
      for (const k of keys.keys) {
        const data = await env.BUSINESSES_KV.get(k.name, { type: "json" });
        if (data) allBusinesses.push(data);
      }
      return new Response(JSON.stringify(allBusinesses, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }


    
    // Step 1: Delete the null-ID business
    // In your Worker, add a temporary endpoint:

    if (url.pathname === "/api/businesses/clean-null" && request.method === "POST") {
      const keys = await env.BUSINESSES_KV.list();
      let deleted = 0;
      for (const k of keys.keys) {
        const data = await env.BUSINESSES_KV.get(k.name, { type: "json" });
        if (data && data.id === null) {
          await env.BUSINESSES_KV.delete(k.name);
          deleted++;
        }
      }
      
      
      // return new Response(JSON.stringify({ deleted }), {
      //   headers: { "Content-Type": "application/json" }
      // });
    
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",   // ✅ allow all origins (for dev/testing)
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
        }
      });    
    
    
    }






    // 2.4 - Static assets fallback
    try { return await fetch(request); } catch (err) { return new Response("Not found", { status: 404 }); }
 




  }
};
