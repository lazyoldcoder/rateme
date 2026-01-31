// index.js


const ratingForm = document.getElementById('ratingForm');
const ratingInput = document.getElementById('ratingInput');
const commentInput = document.getElementById('commentInput');
const ratingsList = document.getElementById('ratingsList');

// Fetch ratings from the Worker/Durable Object
async function fetchRatings() {
    const res = await fetch('/api/ratings');
    if (!res.ok) return [];
    return await res.json();
}

async function renderRatings() {
    const ratings = await fetchRatings();
    ratingsList.innerHTML = '';
    if (ratings.length === 0) {
        ratingsList.innerHTML = '<li>No ratings yet</li>';
        return;
    }
    ratings.forEach(r => {
        const li = document.createElement('li');
        li.className = 'rating-item';
        li.innerHTML = `<strong>Rating:</strong> ${r.rating} / 5<br>
                        <strong>Comment:</strong> ${r.comment || 'No comment'}`;
        ratingsList.appendChild(li);
    });
}

// Handle form submission
ratingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const rating = parseInt(ratingInput.value);
    const comment = commentInput.value.trim();

    if (!rating || rating < 1 || rating > 5) {
        alert('Please enter a valid rating between 1 and 5.');
        return;
    }

    // POST to Durable Object
    const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
    });

    if (!res.ok) {
        alert('Failed to submit rating. Try again.');
        return;
    }

    ratingInput.value = '';
    commentInput.value = '';

    await renderRatings();
});

// Initial render
renderRatings();

















// // Grab references to DOM elements
// const ratingForm = document.getElementById('ratingForm');
// const ratingInput = document.getElementById('ratingInput');
// const commentInput = document.getElementById('commentInput');
// const ratingsList = document.getElementById('ratingsList');

// // Function to render a rating in the list
// function renderRating(ratingData) {
//     const li = document.createElement('li');
//     li.className = 'rating-item';
//     li.innerHTML = `
//         <strong>Rating:</strong> ${ratingData.rating} / 5<br>
//         <strong>Comment:</strong> ${ratingData.comment || 'No comment'}
//     `;
//     ratingsList.appendChild(li);
// }

// // Handle form submission
// ratingForm.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const rating = parseInt(ratingInput.value);
//     const comment = commentInput.value.trim();

//     if (!rating || rating < 1 || rating > 5) {
//         alert('Please enter a valid rating between 1 and 5.');
//         return;
//     }

//     const ratingData = { rating, comment };

//     // Ideally, send this to a backend / database here
//     // For now, just render it immediately
//     renderRating(ratingData);

//     // Clear inputs
//     ratingInput.value = '';
//     commentInput.value = '';
// });

// // Optionally, load initial ratings if you have them
// const initialRatings = [
//     { rating: 5, comment: 'Awesome!' },
//     { rating: 3, comment: 'It’s okay.' }
// ];

// initialRatings.forEach(renderRating);
