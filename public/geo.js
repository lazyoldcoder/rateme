
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
