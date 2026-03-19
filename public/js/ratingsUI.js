import { currentBusiness } from "./businessUI.js";

const ratingsList = document.getElementById("ratingsList");


/* ====================== SECTION 10: Fetch Ratings ====================== */

export async function fetchRatings() {

  if (!currentBusiness) return;

  const res =
    await fetch(`/api/ratings?businessId=${encodeURIComponent(currentBusiness)}`);

  const ratings = await res.json();

  ratingsList.innerHTML = "";

  ratings.forEach(r => {

    const div = document.createElement("div");

    div.className = "rating-card";

    div.innerHTML =
      `<div>${r.username}</div>
       <div>${r.comment}</div>`;

    ratingsList.appendChild(div);

  });

}


/* ====================== SECTION 11: Submit Rating ====================== */

export async function submitRating(data) {

  if (!currentBusiness) return;

  await fetch(`/api/ratings?businessId=${encodeURIComponent(currentBusiness)}`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  });

  fetchRatings();
}