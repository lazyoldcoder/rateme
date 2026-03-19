// import { loadBusinesses } from "./businessUI.js";
// import { fetchRatings } from "./ratingsUI.js";
// import { fetchUser } from "./user.js";
// import { getCurrentLocation } from "./geoUtils.js";


// /* ====================== SECTION 1: App Init ====================== */

// async function init() {
//   await fetchUser();
//   await loadBusinesses();
//   fetchRatings();
// }


// /* ====================== SECTION 2: Location ====================== */

// document.getElementById("nearMeBtn")
// .addEventListener("click", ()=>{
//   getCurrentLocation(()=>{
//     console.log("location updated");
//   });
// });


// /* ====================== SECTION 3: Start App ====================== */

// init();





import { loadBusinesses } from "./businessUI.js";
import { fetchRatings } from "./ratingsUI.js";
import { fetchUser } from "./user.js";
import { getCurrentLocation } from "./geoUtils.js";

/* ====================== SECTION 1: App Init ====================== */

async function init() {
  await fetchUser();
  await loadBusinesses();
  fetchRatings();
}

/* ====================== SECTION 2: Location ====================== */

function setupLocationButton() {
  const nearBtn = document.getElementById("nearMeBtn");
  if (!nearBtn) return console.warn("No Near Me button found");
  
  nearBtn.addEventListener("click", () => {
    getCurrentLocation(() => {
      console.log("location updated");
    });
  });
}

/* ====================== SECTION 3: Start App ====================== */

window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded, starting app...");
  setupLocationButton();
  init();
});