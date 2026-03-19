export let currentUser = null;


/* ====================== SECTION 14: Fetch User ====================== */

export async function fetchUser() {

  const res = await fetch("/api/users");

  const user = await res.json();

  currentUser = user;

  return user;
}


/* ====================== SECTION 15: Register User ====================== */

export async function registerUser(username,email,phone) {

  const res = await fetch("/api/users",{

    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({username,email,phone})

  });

  currentUser = await res.json();

  return currentUser;

}