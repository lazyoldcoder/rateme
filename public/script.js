
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

const searchBox = document.getElementById('businessSearch');
const nearMeBtn = document.getElementById('nearMeBtn');


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


/* ======== 5 Render Business List (with distance) ======== */
function renderBusinessList(list = currentList) {
  businessList.innerHTML = "";
  if (!list.length) {
    businessList.innerHTML = '<div class="business-row"><em>No businesses found</em></div>';
    return;
  }

  list.forEach(b => {
    const row = document.createElement('div');
    row.className = 'business-row';

    // Distance display
    let distanceText = '';
    if (userLat != null && userLng != null && b.lat != null && b.lng != null) {
      const meters = getDistance(userLat, userLng, b.lat, b.lng);
      distanceText = ` • ${(meters/1000).toFixed(2)} km`;
    }

    row.innerHTML = `
      <div class="name">☕ ${b.name}</div>
      <div class="location">${b.location}${distanceText}</div>
    `;
    row.addEventListener('click', () => selectBusiness(String(b.id)));
    businessList.appendChild(row);
  });
}




/* ======== 6 Open / Close Sheet (with 22mm offset) ======== */

function openSheet() {
  renderBusinessList(currentList); // keep your current sorting
  document.body.classList.add('sheet-open');
}

function closeSheet() {
  document.body.classList.remove('sheet-open');
}

selector.addEventListener('click', openSheet);
sheet.addEventListener('click', e => {
  if (e.target === sheet) closeSheet();
});




sheet.addEventListener('click', (e) => {
  // Get the Y position of the search box
  const searchTop = searchBox.getBoundingClientRect().top;

  // Only close if click is **above the search box** and NOT the Near Me button
  if (e.target !== searchBox && e.target !== nearMeBtn && e.target !== addnewBtn && e.clientY < searchTop) {
    closeSheet();
  }
});



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






/* ======== 11 Near Me Location & Auto-Sort ======== */
function getCurrentLocationAndSort() {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  
  navigator.geolocation.getCurrentPosition(pos => {
    userLat = pos.coords.latitude;
    userLng = pos.coords.longitude;
    gpsDisplay.textContent = `Current location: ${userLat.toFixed(6)}, ${userLng.toFixed(6)}`;

    // Sort businesses by distance (closest first)
    currentList = [...businesses].sort((a, b) => {
      if (a.lat == null || a.lng == null) return 1;  // put unknown coords at end
      if (b.lat == null || b.lng == null) return -1;
      return getDistance(userLat, userLng, a.lat, a.lng) - getDistance(userLat, userLng, b.lat, b.lng);
    });

    renderBusinessList(currentList);
  }, err => alert("Failed to get location: " + err.message), { enableHighAccuracy: true });
}

/* ======== 12 Haversine Distance ======== */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const φ1 = lat1 * Math.PI/180, φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1)*Math.PI/180, Δλ = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

nearMeBtn.addEventListener("click", getCurrentLocationAndSort);






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




/* ======== 15 Open / Close Add New Business Sheet ======== */

// 1. References
const addnewBtn = document.getElementById('addnewBtn');
const addnewSheet = document.getElementById('addnewBusinessSheet');
const cancelAddnewBtn = document.getElementById('canceladdnewBtn');
const newBusinessNameInput = document.getElementById('newBusinessName'); // first input

// 2. Open Add New sheet
addnewBtn.addEventListener('click', () => {
  document.body.classList.add('sheet-open-addnew');   // triggers transform: translateY(0)
  
  // Focus first input for convenience
  newBusinessNameInput.focus();
  
  console.log("Add New sheet opened");
});

// 3. Close Add New sheet on Cancel button click
cancelAddnewBtn.addEventListener('click', () => {
  document.body.classList.remove('sheet-open-addnew');
  console.log("Add New sheet closed");
});

// 4. Close Add New sheet when clicking outside first input
addnewSheet.addEventListener('click', (e) => {
  const inputTop = newBusinessNameInput.getBoundingClientRect().top;

  // Only close if click is above first input and NOT the Cancel button or Add New button itself
  if (
    e.target !== newBusinessNameInput &&
    e.target !== cancelAddnewBtn &&
    e.target !== addnewBtn &&
    e.clientY < inputTop
  ) {
    document.body.classList.remove('sheet-open-addnew');
    console.log("Add New sheet closed via click outside");
  }
});




/* ===== 16 Add New Business Save ===== */
const saveNewBtn = document.getElementById('savenewbusinessBtn');

saveNewBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  const name = document.getElementById('newBusinessName').value.trim();
  const lat = parseFloat(document.getElementById('newBusinessLat')?.value) || null;
  const lng = parseFloat(document.getElementById('newBusinessLng')?.value) || null;
  const email = document.getElementById('newBusinessEmail')?.value.trim() || "";
  const location = document.getElementById('newBusinessLocation')?.value.trim() || "";
  const img = document.getElementById('newBusinessImg')?.value.trim() || ""
  
  if (!name) return alert("Please enter a business name");

  // DUPLICATE CHECKS
// check duplicate name
if (businesses.some(b => b.name?.toLowerCase() === name.toLowerCase())) {
  return alert("A business with this name already exists");
}

// check duplicate email
if (email && businesses.some(b => b.email?.toLowerCase() === email.toLowerCase())) {
  return alert("A business with this email already exists");
}



  // Build payload
  const payload = {
    name,
    email,
    location,
    lat,
    lng,
    img
  };

  try {
    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Worker error: ${res.statusText}`);

    // const newBiz = await res.json(); // <- This should include the assigned id
    
    
    const resText = await res.text();       // 1️⃣ Read the raw response as text
    console.log("POST /api/businesses response:", resText);  // 2️⃣ Print exactly what was returned
    const newBiz = JSON.parse(resText);     // 3️⃣ Convert to JSON AFTER logging




    console.log("New business added:", newBiz);

    // Optional: Positive feedback on sheet
    // alert(`Business added: ${newBiz.name} (ID: ${newBiz.id})`);
    // Append styled new business card inside the Add New sheet
    appendNewBusinessCard(newBiz, currentUser.username);

    // 1. Update cards & list
    businesses.push(newBiz);
    currentList.push(newBiz);
    renderBusinessCards();
    renderBusinessList(currentList);

    // 2. Optionally, select the new business automatically
    selectBusiness(newBiz.id);

    // 3. Close Add New sheet
    // document.body.classList.remove('sheet-open-addnew');

    // Scroll new card into view
    // card.scrollIntoView({ behavior: "smooth", block: "end" });


    // 4. Clear inputs for next entry
    document.getElementById('newBusinessName').value = '';
    if(document.getElementById('newBusinessLat')) document.getElementById('newBusinessLat').value = '';
    if(document.getElementById('newBusinessLng')) document.getElementById('newBusinessLng').value = '';

  } catch (err) {
    console.error("Failed to add new business:", err);
    alert("Failed to add new business. See console for details.");
  }
});

// function appendNewBusinessCard(newBiz, username) {
//   const container = document.getElementById('addnewBusinessSheet');

//   const card = document.createElement('div');
//   card.className = 'new-business-card';

//   card.innerHTML = `
//     <div class="nbc-header"><strong>${username}</strong> added a new business:</div>
//     <div class="nbc-name">ID: ${newBiz.id}, ${newBiz.name}</div>
//     <div class="nbc-location">Location: ${newBiz.location || '-'}</div>
//     <div class="nbc-email">Email: ${newBiz.email || '-'}</div>
//     <div class="nbc-latlng">Lat / Lng: ${newBiz.lat ?? '-'}, ${newBiz.lng ?? '-'}</div>
//     ${newBiz.img ? `<div class="nbc-img"><img src="${newBiz.img}" alt="${newBiz.name}" style="max-width:100px"></div>` : ''}
//     <div class="nbc-timestamp">${new Date().toLocaleString()}</div>
//   `;

//   container.appendChild(card);
//   // container.prepend(card);
  
  
//   // Optional: scroll to bottom so user sees the new card
//   // container.scrollTop = container.scrollHeight;
 
//   // ✅ Scroll new card into view while sheet stays open
//   card.scrollIntoView({ behavior: "smooth", block: "end" });

// }



// function appendNewBusinessCard(newBiz, username) {
//   const container = document.getElementById('addnewBusinessSheet');

//   const card = document.createElement('div');
//   card.className = 'new-business-card';

//   card.innerHTML = `
//     <!-- Line 1: username + "added a new business" + timestamp -->
//     <div class="nbc-header text-small" style="display:flex; justify-content:space-between; align-items:center; margin: 0 0 2px 0;">
//       <span><strong>${username}</strong> added a new business:</span>
//       <span class="nbc-timestamp" style="font-size:0.65rem; color:#999;">${new Date().toLocaleString()}</span>
//     </div>

//     <!-- Line 2: ID + name -->
//     <div class="nbc-name text-small" style="margin:0 0 2px 0;">ID: ${newBiz.id}, ${newBiz.name}</div>

//     <!-- Line 3: Location -->
//     <div class="nbc-location">Location: ${newBiz.location || '-'}</div>

//     <!-- Line 4: Email -->
//     <div class="nbc-email">Email: ${newBiz.email || '-'}</div>

//     <!-- Line 5: Lat / Lng -->
//     <div class="nbc-latlng">Lat / Lng: ${newBiz.lat ?? '-'}, ${newBiz.lng ?? '-'}</div>

//     <!-- Optional image -->
//     ${newBiz.img ? `<div class="nbc-img"><img src="${newBiz.img}" alt="${newBiz.name}" style="max-width:100px"></div>` : ''}
//   `;

//   container.appendChild(card);

//   // Scroll new card into view
//   card.scrollIntoView({ behavior: "smooth", block: "end" });
// }


// function appendNewBusinessCard(newBiz, username) {
//   const container = document.getElementById('addnewBusinessSheet');

//   const card = document.createElement('div');
//   card.className = 'new-business-card';

//   card.innerHTML = `
//     <!-- Line 1: username + "added a new business" + timestamp -->
//     <div class="nbc-header text-small" style="display:flex; justify-content:space-between; align-items:center; margin:0 0 2px 0;">
//       <span><strong>${username}</strong> added a new business:</span>
//       <span class="nbc-timestamp text-small" style="color:#999;">${new Date().toLocaleString()}</span>
//     </div>

//     <!-- Line 2: ID + name -->
//     <div class="nbc-name text-small" style="margin:0 0 2px 0;">ID: ${newBiz.id}, ${newBiz.name}</div>

//     <!-- Line 3: Location -->
//     <div class="nbc-location">Location: ${newBiz.location || '-'}</div>

//     <!-- Line 4: Email -->
//     <div class="nbc-email">Email: ${newBiz.email || '-'}</div>

//     <!-- Line 5: Lat / Lng -->
//     <div class="nbc-latlng">Lat / Lng: ${newBiz.lat ?? '-'}, ${newBiz.lng ?? '-'}</div>

//     <!-- Optional image -->
//     ${newBiz.img ? `<div class="nbc-img"><img src="${newBiz.img}" alt="${newBiz.name}" style="max-width:100px"></div>` : ''}
//   `;

//   container.appendChild(card);

//   // Scroll new card into view
//   card.scrollIntoView({ behavior: "smooth", block: "end" });
// }



// function appendNewBusinessCard(newBiz, username) {
//   const container = document.getElementById('addnewBusinessSheet');

//   const card = document.createElement('div');
//   card.className = 'new-business-card';
//   card.style.padding = "0.4rem 1rem"; // smaller vertical padding

//   card.innerHTML = `
//     <!-- Line 1: username + added + timestamp -->
//     <div class="nbc-header text-small" style="
//       display:flex; 
//       justify-content:space-between; 
//       align-items:center; 
//       margin:0; 
//       padding:0;
//       font-size:0.8rem;">
//       <span><strong>${username}</strong> added a new business:</span>
//       <span class="nbc-timestamp" style="font-size:0.7rem; color:#999;">${new Date().toLocaleString()}</span>
//     </div>

//     <!-- Line 2: ID + name -->
//     <div class="nbc-name text-small" style="margin:0; padding:0; font-size:0.8rem;">
//       ID: ${newBiz.id}, ${newBiz.name}
//     </div>

//     <!-- Line 3: Location -->
//     <div class="nbc-location" style="margin:2px 0;">Location: ${newBiz.location || '-'}</div>

//     <!-- Line 4: Email -->
//     <div class="nbc-email" style="margin:2px 0;">Email: ${newBiz.email || '-'}</div>

//     <!-- Line 5: Lat / Lng -->
//     <div class="nbc-latlng" style="margin:2px 0;">Lat / Lng: ${newBiz.lat ?? '-'}, ${newBiz.lng ?? '-'}</div>

//     <!-- Optional image -->
//     ${newBiz.img ? `<div class="nbc-img" style="margin-top:2px;"><img src="${newBiz.img}" alt="${newBiz.name}" style="max-width:100px"></div>` : ''}
//   `;

//   container.appendChild(card);
//   card.scrollIntoView({ behavior: "smooth", block: "end" });
// }





function appendNewBusinessCard(newBiz, username) {
  const container = document.getElementById('addnewBusinessSheet');

  const card = document.createElement('div');
  card.className = 'new-business-card';
  card.style.padding = "0.3rem 1rem"; // slightly tighter vertical padding

  card.innerHTML = `
    <!-- Line 1: username + added + timestamp -->
    <div class="nbc-header text-small" style="
      display:flex; 
      justify-content:space-between; 
      align-items:center; 
      margin:0; 
      padding:0;
      font-size:0.8rem;">
      <span><strong>${username}</strong> added a new business:</span>
      <span class="nbc-timestamp" style="font-size:0.7rem; color:#999;">${new Date().toLocaleString()}</span>
    </div>

    <!-- Line 2: ID + name -->
    <div class="nbc-name text-small" style="margin:1px 0; padding:0; font-size:0.8rem;">
      ID: ${newBiz.id}, ${newBiz.name}
    </div>

    <!-- Line 3: Location -->
    <div class="nbc-location" style="margin:1px 0;">Location: ${newBiz.location || '-'}</div>

    <!-- Line 4: Email -->
    <div class="nbc-email" style="margin:1px 0;">Email: ${newBiz.email || '-'}</div>

    <!-- Line 5: Lat / Lng -->
    <div class="nbc-latlng" style="margin:1px 0;">Lat / Lng: ${newBiz.lat ?? '-'}, ${newBiz.lng ?? '-'}</div>

    <!-- Optional image -->
    ${newBiz.img ? `<div class="nbc-img" style="margin-top:2px;"><img src="${newBiz.img}" alt="${newBiz.name}" style="max-width:100px"></div>` : ''}
  `;

  container.appendChild(card);
  card.scrollIntoView({ behavior: "smooth", block: "end" });
}