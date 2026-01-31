import { DurableObject } from "cloudflare:workers";

// --------------------
// Durable Object
// --------------------
export class MyDurableObject extends DurableObject {
	constructor(state, env) {
		super(state, env);
		// Initialize ratings array
		this.state.blockConcurrencyWhile(async () => {
			if (!(await this.state.storage.get("ratings"))) {
				await this.state.storage.put("ratings", []);
			}
		});
	}

	async addRating(rating) {
		const ratings = (await this.state.storage.get("ratings")) || [];
		ratings.push({ ...rating, timestamp: Date.now() });
		await this.state.storage.put("ratings", ratings);
		return rating;
	}

	async getRatings() {
		return (await this.state.storage.get("ratings")) || [];
	}

	async fetch(request) {
		if (request.method === "POST") {
			const data = await request.json();
			const rating = await this.addRating(data);
			return new Response(JSON.stringify(rating), { status: 201 });
		} else if (request.method === "GET") {
			const ratings = await this.getRatings();
			return new Response(JSON.stringify(ratings));
		} else {
			return new Response("Method not allowed", { status: 405 });
		}
	}
}

// --------------------
// Worker fetch handler
// --------------------
export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// --------------------
		// API route
		// --------------------
		if (url.pathname.startsWith("/api/ratings")) {
			const stub = env.MY_DURABLE_OBJECT.getByName("rateme");
			return stub.fetch(request);
		}

		// --------------------
		// Serve static assets
		// --------------------
		// Cloudflare automatically serves public/*.html, *.js, *.css
		return fetch(request);
	}
};













// addEventListener('fetch', event => {
//   event.respondWith(handleRequest(event));
// });

// async function handleRequest(event) {
//   const url = new URL(event.request.url);
  
//   // Serve the correct HTML page
//   if (url.pathname === '/business') {
//     return fetch(event.request, { cf: { cacheEverything: true } }).then(r => r);
//   }
//   if (url.pathname === '/admin') {
//     return fetch(event.request, { cf: { cacheEverything: true } }).then(r => r);
//   }
  
//   // Default to user page
//   return fetch(event.request, { cf: { cacheEverything: true } });
// }





// export class MyDurableObject extends DurableObject {
// 	constructor(state, env) {
// 		super(state, env);
// 		// Initialize ratings store in Durable Object
// 		this.state.blockConcurrencyWhile(async () => {
// 			if (!(await this.state.storage.get("ratings"))) {
// 				await this.state.storage.put("ratings", []);
// 			}
// 		});
// 	}

// 	// Add a new rating
// 	async addRating(rating) {
// 		const ratings = (await this.state.storage.get("ratings")) || [];
// 		ratings.push({ ...rating, timestamp: Date.now() });
// 		await this.state.storage.put("ratings", ratings);
// 		return rating;
// 	}

// 	// Get all ratings
// 	async getRatings() {
// 		return (await this.state.storage.get("ratings")) || [];
// 	}

// 	// Handle fetch requests sent directly to this Durable Object
// 	async fetch(request) {
// 		const url = new URL(request.url);
// 		if (request.method === "POST") {
// 			const data = await request.json();
// 			const rating = await this.addRating(data);
// 			return new Response(JSON.stringify(rating), { status: 201 });
// 		} else if (request.method === "GET") {
// 			const ratings = await this.getRatings();
// 			return new Response(JSON.stringify(ratings));
// 		} else {
// 			return new Response("Method not allowed", { status: 405 });
// 		}
// 	}
// }




// import { DurableObject } from "cloudflare:workers";






// /**
//  * Welcome to Cloudflare Workers! This is your first Durable Objects application.
//  *
//  * - Run `npm run dev` in your terminal to start a development server
//  * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
//  * - Run `npm run deploy` to publish your application
//  *
//  * Learn more at https://developers.cloudflare.com/durable-objects
//  */

// /**
//  * Env provides a mechanism to reference bindings declared in wrangler.jsonc within JavaScript
//  *
//  * @typedef {Object} Env
//  * @property {DurableObjectNamespace} MY_DURABLE_OBJECT - The Durable Object namespace binding
//  */

// /** A Durable Object's behavior is defined in an exported Javascript class */
// export class MyDurableObject extends DurableObject {
// 	/**
// 	 * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
// 	 * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
// 	 *
// 	 * @param {DurableObjectState} ctx - The interface for interacting with Durable Object state
// 	 * @param {Env} env - The interface to reference bindings declared in wrangler.jsonc
// 	 */
// 	constructor(ctx, env) {
// 		super(ctx, env);
// 	}

// 	/**
// 	 * The Durable Object exposes an RPC method sayHello which will be invoked when a Durable
// 	 *  Object instance receives a request from a Worker via the same method invocation on the stub
// 	 *
// 	 * @param {string} name - The name provided to a Durable Object instance from a Worker
// 	 * @returns {Promise<string>} The greeting to be sent back to the Worker
// 	 */
// 	async sayHello(name) {
// 		return `Hello, ${name}!`;
// 	}
// }

// export default {
// 	/**
// 	 * This is the standard fetch handler for a Cloudflare Worker
// 	 *
// 	 * @param {Request} request - The request submitted to the Worker from the client
// 	 * @param {Env} env - The interface to reference bindings declared in wrangler.jsonc
// 	 * @param {ExecutionContext} ctx - The execution context of the Worker
// 	 * @returns {Promise<Response>} The response to be sent back to the client
// 	 */
// 	async fetch(request, env, ctx) {
// 		// Create a stub to open a communication channel with the Durable Object
// 		// instance named "foo".
// 		//
// 		// Requests from all Workers to the Durable Object instance named "foo"
// 		// will go to a single remote Durable Object instance.
// 		const stub = env.MY_DURABLE_OBJECT.getByName("foo");

// 		// Call the `sayHello()` RPC method on the stub to invoke the method on
// 		// the remote Durable Object instance.
// 		const greeting = await stub.sayHello("world");

// 		return new Response(greeting);
// 	}
// };
