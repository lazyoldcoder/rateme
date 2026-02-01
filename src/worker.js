// SECTION 1 Durable Object class ------------------------------------------------------------------
// --- Durable Object class ---

// --- Durable Object class ---
export class MyDurableObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    let ratings = (await this.state.storage.get("ratings")) || [];
    const url = new URL(request.url);

    if (request.method === "POST") {
      try {
        const newRating = await request.json();
        newRating.id = ratings.length ? ratings[ratings.length - 1].id + 1 : 1;
        ratings.push(newRating);
        await this.state.storage.put("ratings", ratings);
        return new Response(JSON.stringify(newRating), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 400 });
      }
    }

    return new Response(JSON.stringify(ratings), {
      headers: { "Content-Type": "application/json" },
    });
  }
}

// --- Default Worker export ---
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Favicon
    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });

    // Ratings
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




    // ================= USERS API (START) =================
    
    
    
    
    if (url.pathname === "/api/users") {

      // ---------- POST: create OR update user ----------
      if (request.method === "POST") {
        const { username, email, phone } = await request.json();
        if (!username) return new Response("Username required", { status: 400 });

        // merge with existing user if present
        const existing = await env.USERS_KV.get(username, { type: "json" }) || {};
        const user = {
          username,
          email: email || existing.email || "",
          phone: phone || existing.phone || ""
        };

        await env.USERS_KV.put(username, JSON.stringify(user));

        return new Response(JSON.stringify(user), {
          headers: {
            "Content-Type": "application/json",
           
           
           
            // "Set-Cookie": `rateme_user=${encodeURIComponent(username)}; Path=/; Max-Age=${10*365*24*60*60}`
            "Set-Cookie": `rateme_user=${encodeURIComponent(username)};
              Path=/;
              Max-Age=${10 * 365 * 24 * 60 * 60};
              Secure;
              SameSite=Lax`

          
          
          }
        });
      }

      // ---------- GET: fetch user ----------
      const cookieHeader = request.headers.get("Cookie") || "";
      let username = (cookieHeader.match(/rateme_user=([^;]+)/) || [])[1];
      if (!username) username = url.searchParams.get("username");
      if (!username) return new Response(JSON.stringify({ username: null }), { headers: { "Content-Type": "application/json" } });

      const user = await env.USERS_KV.get(username, { type: "json" });
      return new Response(JSON.stringify(user || { username: null }), { headers: { "Content-Type": "application/json" } });
    }

        
        
        
    
    
    
    
    
    
    
    
    
    // if (url.pathname === "/api/users") {

    //   // ---------- POST: create OR update user ----------
    //   if (request.method === "POST") {
    //     const { username, email, phone } = await request.json();

    //     if (!username) {
    //       return new Response("Username required", { status: 400 });
    //     }

    //     const existing = await env.USERS_KV.get(username, { type: "json" }) || {};

    //     const user = {
    //       username,
    //       email: email || existing.email || "",
    //       phone: phone || existing.phone || ""
    //     };

    //     await env.USERS_KV.put(username, JSON.stringify(user));

    //     return new Response(JSON.stringify(user), {
    //       headers: {
    //         "Content-Type": "application/json",
    //         "Set-Cookie": `rateme_user=${encodeURIComponent(username)}; Path=/; Max-Age=${10 * 365 * 24 * 60 * 60}`
    //       }
    //     });
    //   }

    //   // ---------- GET: fetch user via cookie or query ----------
    //   const cookieHeader = request.headers.get("Cookie") || "";
    //   let username = null;

    //   const match = cookieHeader.match(/rateme_user=([^;]+)/);
    //   if (match) {
    //     username = decodeURIComponent(match[1]);
    //   }

    //   if (!username) {
    //     username = url.searchParams.get("username");
    //   }

    //   if (!username) {
    //     return new Response(JSON.stringify({ username: null }), {
    //       headers: { "Content-Type": "application/json" }
    //     });
    //   }

    //   const user = await env.USERS_KV.get(username, { type: "json" });

    //   if (!user) {
    //     return new Response(JSON.stringify({ username: null }), {
    //       headers: { "Content-Type": "application/json" }
    //     });
    //   }

    //   return new Response(JSON.stringify(user), {
    //     headers: { "Content-Type": "application/json" }
    //   });
    // }



    // ================= USERS API (END) =================








    // // Users (per-device login with cookie)
    // if (url.pathname === "/api/users") {
    //   const cookieHeader = request.headers.get("Cookie") || "";
    //   let username = null;

    //   // Check cookie
    //   const match = cookieHeader.match(/rateme_user=([^;]+)/);
    //   if (match) {
    //     username = decodeURIComponent(match[1]);
    //   }

    //   // First-time login
    //   if (!username) {
    //     username = url.searchParams.get("username");
    //     if (!username) return new Response("Missing username", { status: 400 });
    //   }




    //   // // Get or create user in KV
    //   // let user = await env.USERS_KV.get(username, { type: "json" });
    //   // if (!user) {
    //   //   user = { username, email: "", phone: "" };
    //   //   await env.USERS_KV.put(username, JSON.stringify(user));
    //   // }


    //   // GET: only return existing user
    //   let user = await env.USERS_KV.get(username, { type: "json" });

    //   if (!user) {
    //     return new Response(JSON.stringify({ username: null }), {
    //       headers: { "Content-Type": "application/json" }
    //     });
    //   }






    //   // Set cookie if first time
    //   const headers = { "Content-Type": "application/json" };
    //   if (!match) {
    //     headers["Set-Cookie"] = `rateme_user=${encodeURIComponent(username)}; Path=/; Max-Age=${10*365*24*60*60}`;
    //   }

    //   return new Response(JSON.stringify(user), { headers });
    // }


























    // Static assets fallback
    try {
      return await fetch(request);
    } catch (err) {
      return new Response("Not found", { status: 404 });
    }
  },
};





// if (url.pathname === "/api/users" && request.method === "POST") {
//   const body = await request.json();
//   const { username, email, phone } = body;

//   if (!username) {
//     return new Response("Username required", { status: 400 });
//   }

//   const user = { username, email, phone };
//   await env.USERS_KV.put(username, JSON.stringify(user));

//   return new Response(JSON.stringify(user), {
//     headers: {
//       "Content-Type": "application/json",
//       "Set-Cookie": `rateme_user=${encodeURIComponent(username)}; Path=/; Max-Age=${10*365*24*60*60}`
//     }
//   });
// }



