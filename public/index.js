<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rate Me</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 2rem auto; }
    h1 { text-align: center; }
    form { margin-bottom: 2rem; }
    label { display: block; margin: 0.5rem 0 0.2rem; }
    input, textarea { width: 100%; padding: 0.5rem; }
    button { padding: 0.5rem 1rem; margin-top: 0.5rem; }
    .rating { border-bottom: 1px solid #ddd; padding: 0.5rem 0; }
    .timestamp { font-size: 0.8rem; color: #666; }
  </style>
</head>
<body>
  <h1>Rate Me</h1>

  <form id="ratingForm">
    <label for="score">Rating (1-5)</label>
    <input type="number" id="score" name="score" min="1" max="5" required>
    
    <label for="comment">Comment</label>
    <textarea id="comment" name="comment" rows="3" required></textarea>
    
    <button type="submit">Submit Rating</button>
  </form>

  <div id="ratingsContainer">
    <h2>All Ratings</h2>
    <div id="ratingsList"></div>
  </div>

  <script>
    const form = document.getElementById('ratingForm');
    const ratingsList = document.getElementById('ratingsList');

    // Fetch and display all ratings
    async function fetchRatings() {
      try {
        const res = await fetch('/api/ratings');
        const ratings = await res.json();
        ratingsList.innerHTML = ratings.length
          ? ratings.map(r => `
            <div class="rating">
              <strong>Rating:</strong> ${r.rating} <br>
              <strong>Comment:</strong> ${r.comment} <br>
              <span class="timestamp">${new Date(r.timestamp).toLocaleString()}</span>
            </div>
          `).join('')
          : '<p>No ratings yet.</p>';
      } catch (err) {
        ratingsList.innerHTML = '<p>Error loading ratings.</p>';
        console.error(err);
      }
    }

    // Submit new rating
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const score = parseInt(document.getElementById('score').value);
      const comment = document.getElementById('comment').value.trim();

      if (!score || !comment) return;

      try {
        const res = await fetch('/api/ratings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: score, comment })
        });
        const newRating = await res.json();
        console.log('Added rating:', newRating);
        form.reset();
        fetchRatings();
      } catch (err) {
        console.error('Error submitting rating:', err);
      }
    });

    // Initial load
    fetchRatings();
  </script>
</body>
</html>
