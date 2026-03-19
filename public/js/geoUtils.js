/* ====================== SECTION 12: Location ====================== */

export let userLat = null;
export let userLng = null;

export function getCurrentLocation(callback) {

  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {

    userLat = pos.coords.latitude;
    userLng = pos.coords.longitude;

    callback(userLat, userLng);

  }, err => {

    alert("Location error: " + err.message);

  }, { enableHighAccuracy:true });
}


/* ====================== SECTION 13: Distance Calculation ====================== */

export function getDistance(lat1, lon1, lat2, lon2) {

  const R = 6371e3;

  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;

  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a =
      Math.sin(Δφ/2)**2 +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ/2)**2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}