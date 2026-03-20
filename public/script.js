
/* ======== 1 Variables ======== */
let businesses = [];
let currentBusiness = null;   // declare first, undefined until load
let selectedRating = 0;
let lastSubmittedRating = null;
let currentUser = null;
let userLat = null;
let userLng = null;

/* ======== 2 DOM References ======== */
const businessContainer = document.getElementById('businessContainer');
const ratingsList = document.getElementById('ratingsList');
const form = document.getElementById('ratingForm');
const commentInput = document.getElementById('comment');
const emojiBtns = document.querySelectorAll('.emoji-btn');
const stars = document.querySelectorAll('.star');
const sheet = document.getElementById('businessSheet');
const handle = document.querySelector('.sheet-handle');
const selector = document.getElementById('businessSelector');
const businessList = document.getElementById('businessList');
const selectedBizName = document.querySelector('.biz-name');
const selectedBizLocation = document.querySelector('.biz-location');
const gpsDisplay = document.getElementById("gpsDisplay");

// mar19 ← ADD THIS LINE:
const usernameInput = document.getElementById('usernameInput');


// /* ======== 3 Sheet Positions ======== */
// const CLOSED = -window.innerHeight;
// const HALF_OPEN = -window.innerHeight / 2;
// const FULL_OPEN = 0;
// let startY = 0, sheetStartBottom = CLOSED, isDragging = false;
// sheet.style.bottom = `${CLOSED}px`;


/* ======== 3 Sheet Positions ======== */
// Convert mm to px (approx. 1mm ≈ 3.78px)
// const VISIBLE_MM = 95;
// const VISIBLE_PX = VISIBLE_MM * 3.78;  // ≈ 359px

// Get sheet height dynamically
// const SHEET_HEIGHT_PX = sheet.offsetHeight || window.innerHeight;

// const CLOSED = -SHEET_HEIGHT_PX;                   // fully hidden
// const HALF_OPEN = -(SHEET_HEIGHT_PX - VISIBLE_PX); // pops up 95mm
// const FULL_OPEN = 0;

// let startY = 0, sheetStartBottom = CLOSED, isDragging = false;
// sheet.style.bottom = `${CLOSED}px`;




/* ======== Sheet Positions ======== */
// const CLOSED = -window.innerHeight;   // fully hidden
// const HALF_OPEN = 95;                 // 95px above bottom
// const FULL_OPEN = 0;                   // fully open

// let startY = 0, sheetStartBottom = CLOSED, isDragging = false;
// sheet.style.bottom = `${CLOSED}px`;













// /* ======== 3Sheet Positions ======== */
// const FULL_OPEN = 0; // fully open
// const SHEET_HEIGHT = sheet.offsetHeight || window.innerHeight; 
// const HALF_OPEN = -(SHEET_HEIGHT - 95); // 95px visible
// const CLOSED = -SHEET_HEIGHT;           // fully hidden

// let startY = 0, sheetStartBottom = CLOSED, isDragging = false;
// sheet.style.bottom = `${CLOSED}px`;

// /* ======== 4 Sheet Drag Functions ======== */
// function startDrag(e) {
//   isDragging = true;
//   startY = e.touches ? e.touches[0].clientY : e.clientY;
//   sheetStartBottom = parseFloat(window.getComputedStyle(sheet).bottom);
//   sheet.style.transition = 'none';
// }

// function dragMove(e) {
//   if (!isDragging) return;
//   const currentY = e.touches ? e.touches[0].clientY : e.clientY;
//   let diff = startY - currentY;
//   let newBottom = sheetStartBottom + diff;
//   newBottom = Math.min(FULL_OPEN, Math.max(CLOSED, newBottom));
//   sheet.style.bottom = `${newBottom}px`;
//   if (Math.abs(diff) > 5) e.preventDefault();
// }

// // function endDrag() {
// //   if (!isDragging) return;
// //   isDragging = false;
// //   sheet.style.transition = 'bottom 0.3s ease';
// //   const current = parseFloat(sheet.style.bottom);
// //   const snapThreshold = window.innerHeight / 4;
// //   if (current > HALF_OPEN + snapThreshold) openSheet(FULL_OPEN);
// //   else if (current > CLOSED + snapThreshold) openSheet(HALF_OPEN);
// //   else closeSheet();
// // }

// function endDrag() {
//   if (!isDragging) return;
//   isDragging = false;
//   sheet.style.transition = 'bottom 0.3s ease';
//   const current = parseFloat(sheet.style.bottom);

//   // Find the closest snap point
//   const positions = [FULL_OPEN, HALF_OPEN, CLOSED];
//   let closest = positions[0];
//   let minDist = Math.abs(current - positions[0]);
//   for (let i = 1; i < positions.length; i++) {
//     const dist = Math.abs(current - positions[i]);
//     if (dist < minDist) {
//       closest = positions[i];
//       minDist = dist;
//     }
//   }

//   // Snap to the closest
//   openSheet(closest);
// }

// function openSheet(position) {
//   sheet.style.bottom = `${position}px`;
//   document.body.classList.add('sheet-open');
// }

// function closeSheet() {
//   sheet.style.bottom = `${CLOSED}px`;
//   document.body.classList.remove('sheet-open');
// }


// /* ======== 5 Event Listeners for Sheet ======== */
// handle.addEventListener('mousedown', startDrag);
// handle.addEventListener('touchstart', startDrag, { passive: false });
// document.addEventListener('mousemove', dragMove);
// document.addEventListener('touchmove', dragMove, { passive: false });
// document.addEventListener('mouseup', endDrag);
// document.addEventListener('touchend', endDrag);
// selector.addEventListener('click', () => openSheet(HALF_OPEN));
// sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });
// sheet.addEventListener('touchmove', e => { if (!isDragging) return; e.stopPropagation(); }, { passive: false });











/* ======== 3 Sheet Positions ======== */
// Convert mm to px (approx 1mm ≈ 3.78px)
// const VISIBLE_MM = 95;
// const VISIBLE_PX = VISIBLE_MM * 3.78; // ≈ 359px

// // Get sheet height dynamically
// const SHEET_HEIGHT_PX = sheet.offsetHeight || window.innerHeight;

// // Positions
// const CLOSED = -SHEET_HEIGHT_PX;                   // fully hidden off-screen
// const HALF_OPEN = -SHEET_HEIGHT_PX + VISIBLE_PX;  // pops 95mm above bottom
// const FULL_OPEN = 0;                               // fully open

// let startY = 0,
//     sheetStartBottom = CLOSED,
//     isDragging = false;

// // Start fully closed
// sheet.style.bottom = `${CLOSED}px`;





/* ======== 3 Sheet Positions ======== */
const VISIBLE_MM = 95;
const VISIBLE_PX = VISIBLE_MM * 3.78; // ~359px

const FULL_OPEN = 0;           // fully open at top
const HALF_OPEN = VISIBLE_PX;  // 95mm visible
const SHEET_HEIGHT = sheet.offsetHeight || window.innerHeight;
const CLOSED = -SHEET_HEIGHT;  // fully hidden off-screen

let startY = 0, sheetStartBottom = CLOSED, isDragging = false;
sheet.style.bottom = `${CLOSED}px`; // start hidden

















/* ======== 4 Drag Functions ======== */
function startDrag(e) {
  isDragging = true;
  startY = e.touches ? e.touches[0].clientY : e.clientY;
  sheetStartBottom = parseFloat(window.getComputedStyle(sheet).bottom);
  sheet.style.transition = 'none';
}

function dragMove(e) {
  if (!isDragging) return;
  const currentY = e.touches ? e.touches[0].clientY : e.clientY;
  let diff = startY - currentY;
  let newBottom = sheetStartBottom + diff;

  // Constrain within CLOSED to FULL_OPEN
  newBottom = Math.min(FULL_OPEN, Math.max(CLOSED, newBottom));

  sheet.style.bottom = `${newBottom}px`;
  if (Math.abs(diff) > 5) e.preventDefault();
}

function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  sheet.style.transition = 'bottom 0.3s ease';

  const current = parseFloat(sheet.style.bottom);
  const snapPoints = [CLOSED, HALF_OPEN, FULL_OPEN];

  // Find closest snap point
  let closest = snapPoints.reduce((prev, curr) => {
    return Math.abs(curr - current) < Math.abs(prev - current) ? curr : prev;
  });

  sheet.style.bottom = `${closest}px`;
}

/* ======== 5 Open & Close Functions ======== */
function openSheet(position = HALF_OPEN) {
  sheet.style.transition = 'bottom 0.3s ease';
  sheet.style.bottom = `${position}px`;
  document.body.classList.add('sheet-open');
}

function closeSheet() {
  sheet.style.transition = 'bottom 0.3s ease';
  sheet.style.bottom = `${CLOSED}px`;
  document.body.classList.remove('sheet-open');
}

/* ======== 6 Event Listeners ======== */
handle.addEventListener('mousedown', startDrag);
handle.addEventListener('touchstart', startDrag, { passive: false });

document.addEventListener('mousemove', dragMove);
document.addEventListener('touchmove', dragMove, { passive: false });

document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

selector.addEventListener('click', () => openSheet(HALF_OPEN));

// Close sheet if background clicked
sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });
sheet.addEventListener('touchmove', e => { if (!isDragging) return; e.stopPropagation(); }, { passive: false });












/* ======== 6 Load Businesses ======== */
async function loadBusinesses() {
  try {
    const res = await fetch('/api/businesses');
    businesses = await res.json();

    // Ensure we always have a current business
    if (businesses.length) {
      currentBusiness = parseInt(localStorage.getItem('lastBusiness')) || businesses[0].id;
    }

    renderBusinessList();
    renderBusinessCards();
    if (currentBusiness) selectBusiness(currentBusiness);
  } catch (err) {
    console.error("Failed to load businesses:", err);
  }
}

loadBusinesses();














/* ======== 7 Render Business Cards ======== */
const cardsWrapper = document.createElement('div');
cardsWrapper.className = 'cards-wrapper';
businessContainer.appendChild(cardsWrapper);

function renderBusinessCards() {
  cardsWrapper.innerHTML = '';
  businesses.forEach(b => {
    const card = document.createElement('div');
    card.className = 'business-card';
    card.dataset.id = b.id;
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = b.name;
    card.appendChild(name);
    card.addEventListener('click', () => selectBusiness(b.id));
    cardsWrapper.appendChild(card);
  });
}

/* ======== 8 Render Business List (Search & Distance) ======== */
function renderBusinessList(list = businesses) {
  businessList.innerHTML = "";
  list.forEach(b => {
    let distanceText = "";
    if (userLat !== null && userLng !== null && b.lat && b.lng) {
      const meters = getDistance(userLat, userLng, b.lat, b.lng);
      distanceText = meters < 1000 ? Math.round(meters) + " m" : (meters / 1000).toFixed(2) + " km";
    }
    const row = document.createElement("div");
    row.className = "business-row";
    row.innerHTML = `
      <div class="name">☕ ${b.name}</div>
      <div class="location">${b.location}${distanceText ? " • " + distanceText : ""}</div>
    `;
    row.addEventListener("click", () => selectBusiness(b.id));
    businessList.appendChild(row);
  });
  if (!list.length) businessList.innerHTML = `<div class="business-row"><em>No businesses found</em></div>`;
}

/* ======== 9 Search Input ======== */
document.getElementById("businessSearch").addEventListener("input", () => {
  const query = document.getElementById("businessSearch").value.toLowerCase().trim();
  const filtered = businesses.filter(b => b.name.toLowerCase().includes(query));
  renderBusinessList(filtered);
});

// /* ======== 10 Select Business ======== */
// function selectBusiness(id) {
//   const biz = businesses.find(b => b.id === id);
//   if (!biz) return;
//   currentBusiness = biz.id;
//   localStorage.setItem('lastBusiness', currentBusiness);
//   selectedBizName.textContent = `☕ ${biz.name}`;
//   selectedBizLocation.textContent = biz.location;
//   document.querySelectorAll('.business-card').forEach(card => {
//     card.classList.toggle('selected', card.dataset.id == id);
//   });
//   fetchRatings();
//   closeSheet();
// }





/* ======== 10 Close on business selection ======== */
function selectBusiness(id) {
  const biz = businesses.find(b => b.id === id);
  if (!biz) return;

  currentBusiness = biz.id;
  localStorage.setItem('lastBusiness', currentBusiness);
  selectedBizName.textContent = `☕ ${biz.name}`;
  selectedBizLocation.textContent = biz.location;

  document.querySelectorAll('.business-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.id == id);
  });

  fetchRatings();
  closeSheet(); // closes immediately on selection
}









/* ======== 11 Emoji Rating ======== */
emojiBtns.forEach(btn => btn.addEventListener('click', e => {
  e.preventDefault();
  selectedRating = parseInt(btn.dataset.value);
  emojiBtns.forEach(b => b.classList.toggle('selected', b.dataset.value == selectedRating));
  stars.forEach(s => s.classList.toggle('selected', s.dataset.value <= selectedRating));
}));

/* ======== 12 Fetch Ratings ======== */
async function fetchRatings() {
  if (!currentBusiness) return;
  try {
    const res = await fetch(`/api/ratings?businessId=${encodeURIComponent(currentBusiness)}`);
    const ratings = await res.json();
    if (!Array.isArray(ratings)) throw new Error("Ratings fetch failed");
    ratingsList.innerHTML = ratings.length ? "" : "<p>No ratings yet for this business.</p>";
    ratings.forEach(r => {
      const div = document.createElement('div');
      div.className = 'rating-card';
      div.innerHTML = `
        <div class="stars-display">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        
        <div><strong>${r.username} @ ${r.businessName || selectedBizName.textContent}</strong></div>
        <div>${r.comment || '<em>No comment</em>'}</div>
        <div class="timestamp">${new Date(r.timestamp).toLocaleString()}</div>
      `;
      // ratingsList.appendChild(div);
      ratingsList.insertBefore(div, ratingsList.firstChild);
    });
  } catch (err) {
    console.error(err);
    ratingsList.innerHTML = "<p>Error loading ratings.</p>";
  }
}

/* ======== 13 Submit Rating ======== */
form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentUser) return alert('Please log in first');
  if (!currentUser.email || !currentUser.phone) return alert("Profile incomplete. Re-register.");
  if (!currentBusiness) return alert('Please select a business');
  if (!selectedRating) return alert('Please select a rating');

  const comment = commentInput.value.trim();
  const timestamp = new Date().toISOString();
  try {
    await fetch(`/api/ratings?businessId=${encodeURIComponent(currentBusiness)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: selectedRating, comment,
        username: currentUser.username,
        email: currentUser.email,
        phone: currentUser.phone,
        timestamp
      })
    });
    commentInput.value = '';
    selectedRating = 0;
    emojiBtns.forEach(b => b.classList.remove('selected'));
    stars.forEach(s => s.classList.remove('selected'));
    fetchRatings();
  } catch (err) {
    console.error(err);
    alert('Failed to submit rating.');
  }
});

/* ======== 14 Location & Near Me ======== */
function getCurrentLocationAndSort() {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(pos => {
    userLat = pos.coords.latitude;
    userLng = pos.coords.longitude;
    gpsDisplay.textContent = `Current location: ${userLat.toFixed(6)}, ${userLng.toFixed(6)}`;
    const sorted = [...businesses].sort((a,b) => getDistance(userLat, userLng,a.lat,a.lng)-getDistance(userLat,userLng,b.lat,b.lng));
    renderBusinessList(sorted);
  }, err => alert("Failed to get location: " + err.message), { enableHighAccuracy:true });
}
document.getElementById("nearMeBtn").addEventListener("click", getCurrentLocationAndSort);

/* Haversine Formula */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180, φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1)*Math.PI/180, Δλ = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/* ======== 15 User Fetch & Init ======== */
async function fetchUser(firstTimeName=null) {
  let url = "/api/users";
  if (!currentUser && firstTimeName) url += `?username=${encodeURIComponent(firstTimeName)}`;
  const res = await fetch(url);
  const user = await res.json();
  if (!currentUser || !currentUser.email) currentUser = user;
  return user;
}

async function fetchUserCreation({username,email,phone}) {
  const res = await fetch(`/api/users?username=${encodeURIComponent(username)}`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username,email,phone})
  });
  return await res.json();
}

async function init() {
  try {
    let user = await fetchUser();
    if (!user.username) {
      const username = prompt("Enter your username:");
      const email = prompt("Enter your email:");
      const phone = prompt("Enter your phone number:");
      user = await fetchUserCreation({username,email,phone});
    }
    currentUser = user;


    // Mar 19 ← THIS LINE ADDED:
    if (usernameInput) usernameInput.value = currentUser.username;


    console.log("Logged in as:", currentUser.username);
  } catch(err){console.error("Login/init error:",err);}
}

init();

/* ======== 16 Re-register button ======== */
document.getElementById('reRegisterBtn').addEventListener('click', async () => {
  currentUser = null;
  document.cookie = "rateme_user=; Path=/; Max-Age=0";
  const username = prompt("Enter username:");
  const email = prompt("Enter email:");
  const phone = prompt("Enter phone:");
  const res = await fetch('/api/users', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username,email,phone})});
  currentUser = await res.json();

  // Mar 19 ← UPDATE THE DISPLAY
  if (usernameInput) usernameInput.value = currentUser.username;

  console.log("Re-registered as:", currentUser);
  fetchRatings();
});
















