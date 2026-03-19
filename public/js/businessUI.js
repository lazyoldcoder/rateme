import { getDistance, userLat, userLng } from "./geoUtils.js";

export let businesses = [];
export let currentBusiness = null;

const businessList = document.getElementById("businessList");
const selectedBizName = document.querySelector(".biz-name");
const selectedBizLocation = document.querySelector(".biz-location");


/* ====================== SECTION 4: Load Businesses ====================== */

export async function loadBusinesses() {

  const res = await fetch("/api/businesses");
  businesses = await res.json();

  if (businesses.length)
    currentBusiness = parseInt(localStorage.getItem("lastBusiness")) || businesses[0].id;

  renderBusinessList();

}


/* ====================== SECTION 6: Render Business List ====================== */

export function renderBusinessList(list = businesses) {

  businessList.innerHTML = "";

  list.forEach(b => {

    let distanceText = "";

    if (userLat && userLng && b.lat && b.lng) {

      const meters = getDistance(userLat, userLng, b.lat, b.lng);

      distanceText =
        meters < 1000
        ? Math.round(meters) + " m"
        : (meters/1000).toFixed(2) + " km";
    }

    const row = document.createElement("div");

    row.className = "business-row";

    row.innerHTML =
      `<div class="name">☕ ${b.name}</div>
       <div class="location">${b.location}${distanceText ? " • "+distanceText : ""}</div>`;

    row.addEventListener("click", ()=>selectBusiness(b.id));

    businessList.appendChild(row);

  });

}


/* ====================== SECTION 8: Select Business ====================== */

export function selectBusiness(id) {

  const biz = businesses.find(b => b.id === id);

  if (!biz) return;

  currentBusiness = biz.id;

  localStorage.setItem("lastBusiness", currentBusiness);

  selectedBizName.textContent = "☕ " + biz.name;
  selectedBizLocation.textContent = biz.location;

}