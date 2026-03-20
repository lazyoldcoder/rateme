/* ======== 1 Variables ======== */
let businesses = [];
let currentBusiness = null;
let selectedRating = 0;
let currentUser = null;
let userLat = null;
let userLng = null;
let currentList = []; // to preserve sorting

/* ======== 2 DOM References ======== */
const businessContainer = document.getElementById('businessContainer');
const ratingsList = document.getElementById('ratingsList');
const form = document.getElementById('ratingForm');
const commentInput = document.getElementById('comment');
const emojiBtns = document.querySelectorAll('.emoji-btn');
const stars = document.querySelectorAll('.star');
const sheet = document.getElementById('businessSheet');
const selector = document.getElementById('businessSelector');
const businessList = document.getElementById('businessList');
const selectedBizName = document.querySelector('.biz-name');
const selectedBizLocation = document.querySelector('.biz-location');
const gpsDisplay = document.getElementById("gpsDisplay");
const usernameInput = document.getElementById('usernameInput');

/* ======== 3 Load Businesses ======== */
async function loadBusinesses() {
  try {
    const res = await fetch('/api/businesses');
    businesses = await res.json();
    currentList = [...businesses];

    if (businesses.length) {
      currentBusiness = localStorage.getItem('lastBusiness') || String(businesses[0].id);
    }

    renderBusinessCards();
    renderBusinessList(currentList);
    if (currentBusiness) selectBusiness(currentBusiness, false);
  } catch (err) {
    console.error("Failed to load businesses:", err);
  }
}

/* ======== 4 Render Business Cards ======== */
const cardsWrapper = document.createElement('div');
cardsWrapper.className = 'cards-wrapper';
businessContainer.appendChild(cardsWrapper);

function renderBusinessCards() {
  cardsWrapper.innerHTML = '';
  businesses.forEach(b => {
    const card = document.createElement('div');
    card.className = 'business-card';
    card.dataset.id = String(b.id);
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = b.name;
    card.appendChild(name);
    card.addEventListener('click', () => selectBusiness(String(b.id)));
    cardsWrapper.appendChild(card);
  });
}

/* ======== 5 Render Business List ======== */
function renderBusinessList(list = currentList) {
  businessList.innerHTML = "";
  if (!list.length) {
    businessList.innerHTML = '<div class="business-row"><em>No businesses found</em></div>';
    return;
  }
  list.forEach(b => {
    const row = document.createElement('div');
    row.className = 'business-row';
    row.innerHTML = `<div class="name">☕ ${b.name}</div><div class="location">${b.location}</div>`;
    row.addEventListener('click', () => selectBusiness(String(b.id)));
    businessList.appendChild(row);
  });
}

/* ======== 6 Open / Close Sheet ======== */
function openSheet() {
  renderBusinessList(currentList); // preserve current sorting
  document.body.classList.add('sheet-open');
}

function closeSheet() {
  document.body.classList.remove('sheet-open');
}

selector.addEventListener('click', openSheet);
sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });

/* ======== 7 Select Business ======== */
function selectBusiness(id, close = true) {
  const biz = businesses.find(b => String(b.id) === String(id));
  if (!biz) return;

  currentBusiness = String(biz.id);
  localStorage.setItem('lastBusiness', currentBusiness);

  selectedBizName.textContent = `☕ ${biz.name}`;
  selectedBizLocation.textContent = biz.location;

  document.querySelectorAll('.business-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.id === currentBusiness);
  });

  fetchRatings();

  if (close) closeSheet();
}

/* ======== 8 Emoji / Star Rating ======== */
emojiBtns.forEach(btn => btn.addEventListener('click', e => {
  e.preventDefault();
  selectedRating = parseInt(btn.dataset.value);
  emojiBtns.forEach(b => b.classList.toggle('selected', b.dataset.value == selectedRating));
  stars.forEach(s => s.classList.toggle('selected', s.dataset.value <= selectedRating));
}));

/* ======== 9 Fetch Ratings ======== */
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
      ratingsList.insertBefore(div, ratingsList.firstChild);
    });
  } catch (err) {
    console.error(err);
    ratingsList.innerHTML = "<p>Error loading ratings.</p>";
  }
}

/* ======== 10 Submit Rating ======== */
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
        rating: selectedRating,
        comment,
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

/* ======== 11 Near Me Location ======== */
function getCurrentLocationAndSort() {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(pos => {
    userLat = pos.coords.latitude;
    userLng = pos.coords.longitude;
    gpsDisplay.textContent = `Current location: ${userLat.toFixed(6)}, ${userLng.toFixed(6)}`;

    currentList = [...businesses].sort((a,b) => getDistance(userLat,userLng,a.lat,a.lng)-getDistance(userLat,userLng,b.lat,b.lng));
    renderBusinessList(currentList);
  }, err => alert("Failed to get location: " + err.message), { enableHighAccuracy:true });
}

document.getElementById("nearMeBtn").addEventListener("click", getCurrentLocationAndSort);

/* ======== 12 Haversine Distance ======== */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const φ1 = lat1 * Math.PI/180, φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1)*Math.PI/180, Δλ = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/* ======== 13 User Fetch & Init ======== */
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
    if (usernameInput) usernameInput.value = currentUser.username;
    console.log("Logged in as:", currentUser.username);

    await loadBusinesses();
  } catch(err){
    console.error("Login/init error:",err);
  }
}

init();

/* ======== 14 Re-register ======== */
document.getElementById('reRegisterBtn').addEventListener('click', async () => {
  currentUser = null;
  document.cookie = "rateme_user=; Path=/; Max-Age=0";
  const username = prompt("Enter username:");
  const email = prompt("Enter email:");
  const phone = prompt("Enter phone:");
  currentUser = await fetchUserCreation({username,email,phone});
  if (usernameInput) usernameInput.value = currentUser.username;
  console.log("Re-registered as:", currentUser);

  await loadBusinesses(); // refresh cards & list
  fetchRatings();
});