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

    // Users (per-device login with cookie)
    if (url.pathname === "/api/users") {
      const cookieHeader = request.headers.get("Cookie") || "";
      let username = null;

      // Check cookie
      const match = cookieHeader.match(/rateme_user=([^;]+)/);
      if (match) {
        username = decodeURIComponent(match[1]);
      }

      // First-time login
      if (!username) {
        username = url.searchParams.get("username");
        if (!username) return new Response("Missing username", { status: 400 });
      }

      // Get or create user in KV
      let user = await env.USERS_KV.get(username, { type: "json" });
      if (!user) {
        user = { username, email: "", phone: "" };
        await env.USERS_KV.put(username, JSON.stringify(user));
      }

      // Set cookie if first time
      const headers = { "Content-Type": "application/json" };
      if (!match) {
        headers["Set-Cookie"] = `rateme_user=${encodeURIComponent(username)}; Path=/; Max-Age=${10*365*24*60*60}`;
      }

      return new Response(JSON.stringify(user), { headers });
    }

    // Static assets fallback
    try {
      return await fetch(request);
    } catch (err) {
      return new Response("Not found", { status: 404 });
    }
  },
};















// export class MyDurableObject {
//   constructor(state, env) {
//     this.state = state;
//     this.env = env;
//   }

//   async fetch(request) {
//     // Get existing ratings array or empty
//     let ratings = (await this.state.storage.get("ratings")) || [];

//     const url = new URL(request.url);

//     if (request.method === "POST") {
//       // Add a new rating if POSTed
//       try {
//         const newRating = await request.json();
//         newRating.id = ratings.length ? ratings[ratings.length - 1].id + 1 : 1;
//         ratings.push(newRating);
//         await this.state.storage.put("ratings", ratings);
//         return new Response(JSON.stringify(newRating), {
//           headers: { "Content-Type": "application/json" },
//         });
//       } catch (err) {
//         return new Response(JSON.stringify({ error: err.message }), { status: 400 });
//       }
//     }

//     // GET: return all ratings
//     return new Response(JSON.stringify(ratings), {
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }






// // SECTION 2 --- Worker Default Export for the Worker ----------------------------------------------
// // export default {
// //   async fetch(request, env) {
// //     const url = new URL(request.url);

// //     // --- Favicon ---
// //     if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });

// //     // --- Ratings (Durable Object) ---
// //     if (url.pathname.startsWith("/api/ratings")) {
// //       try {
// //         const stub = env.MY_DURABLE_OBJECT.getByName("rateme");
// //         return await stub.fetch(request);
// //       } catch (err) {
// //         return new Response(JSON.stringify({ error: err.message }), {
// //           status: 500,
// //           headers: { "Content-Type": "application/json" },
// //         });
// //       }
// //     }

// //     // --- Users (KV) ---
// //     if (url.pathname === "/api/users") {
// //       const username = url.searchParams.get("username");
// //       if (!username) return new Response("Missing username", { status: 400 });

// //       let user = await env.USERS_KV.get(username, { type: "json" });
// //       if (!user) {
// //         user = { username, email: "", phone: "" };
// //         await env.USERS_KV.put(username, JSON.stringify(user));
// //       }

// //       return new Response(JSON.stringify(user), {
// //         headers: { "Content-Type": "application/json" },
// //       });
// //     }

// //     // --- Static assets fallback ---
// //     try {
// //       return await fetch(request);
// //     } catch (err) {
// //       return new Response("Not found", { status: 404 });
// //     }
// //   },
// // };


// // // --- Users (KV) with per-device login ---
// // if (url.pathname === "/api/users") {
// //   const cookieHeader = request.headers.get("Cookie") || "";
// //   let username = null;

// //   // Check if the device already has a cookie
// //   const match = cookieHeader.match(/rateme_user=([^;]+)/);
// //   if (match) {
// //     username = decodeURIComponent(match[1]);
// //   }

// //   // If no cookie, get username from query (first-time login)
// //   if (!username) {
// //     username = url.searchParams.get("username");
// //     if (!username) return new Response("Missing username", { status: 400 });
// //   }

// //   // Get user from KV or create new one
// //   let user = await env.USERS_KV.get(username, { type: "json" });
// //   if (!user) {
// //     user = { username, email: "", phone: "" };
// //     await env.USERS_KV.put(username, JSON.stringify(user));
// //   }

// //   // Set cookie only if this is a first-time login (no cookie)
// //   const headers = { "Content-Type": "application/json" };
// //   if (!match) {
// //     // Cookie lasts 10 years (arbitrary long-term)
// //     headers["Set-Cookie"] = `rateme_user=${encodeURIComponent(username)}; Path=/; Max-Age=${10 * 365 * 24 * 60 * 60}; HttpOnly`;
// //   }

// //   return new Response(JSON.stringify(user), { headers });
// // }



// export default {
//   async fetch(request, env) {
//     const url = new URL(request.url);

//     // --- Favicon ---
//     if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });

//     // --- Ratings (Durable Object) ---
//     if (url.pathname.startsWith("/api/ratings")) {
//       try {
//         const stub = env.MY_DURABLE_OBJECT.getByName("rateme");
//         return await stub.fetch(request);
//       } catch (err) {
//         return new Response(JSON.stringify({ error: err.message }), {
//           status: 500,
//           headers: { "Content-Type": "application/json" },
//         });
//       }
//     }

//     // --- Users (KV) with per-device login ---
//     if (url.pathname === "/api/users") {
//       const cookieHeader = request.headers.get("Cookie") || "";
//       let username = null;

//       // Check if the device already has a cookie
//       const match = cookieHeader.match(/rateme_user=([^;]+)/);
//       if (match) {
//         username = decodeURIComponent(match[1]);
//       }

//       // If no cookie, get username from query (first-time login)
//       if (!username) {
//         username = url.searchParams.get("username");
//         if (!username) return new Response("Missing username", { status: 400 });
//       }

//       // Get user from KV or create new one
//       let user = await env.USERS_KV.get(username, { type: "json" });
//       if (!user) {
//         user = { username, email: "", phone: "" };
//         await env.USERS_KV.put(username, JSON.stringify(user));
//       }

//       // Set cookie only if this is a first-time login (no cookie)
//       const headers = { "Content-Type": "application/json" };
//       if (!match) {
//         // Cookie lasts 10 years (arbitrary long-term)
//         headers["Set-Cookie"] = `rateme_user=${encodeURIComponent(username)}; Path=/; Max-Age=${10 * 365 * 24 * 60 * 60}; HttpOnly`;
//       }

//       return new Response(JSON.stringify(user), { headers });
//     }

//     // --- Static assets fallback ---
//     try {
//       return await fetch(request);
//     } catch (err) {
//       return new Response("Not found", { status: 404 });
//     }
//   },
// };
