console.log("index.js loaded"); // checking if script is loading

// Prevent form submission for the search bar
const searchForm = document.getElementById('searchForm');
if (searchForm) {
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
  });
}

// Search filtering by title and genre
const searchInput = document.getElementById('searchInput');
const movieItems = document.querySelectorAll('.movie-item');

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    movieItems.forEach((item) => {
      const titleElement = item.querySelector('.movie-title');
      const genreElement = item.querySelector('.movie-subtitle');
      const title = titleElement ? titleElement.textContent.toLowerCase() : "";
      const genre = genreElement ? genreElement.textContent.toLowerCase() : "";
      
      // Hide the entire column (parent element) if neither matches the query
      if (title.includes(query) || genre.includes(query)) {
        item.parentElement.style.display = '';
      } else {
        item.parentElement.style.display = 'none';
      }
    });
  });
}

// Save status changes to localStorage when the dropdown changes
const statusSelects = document.querySelectorAll('.status-select');

statusSelects.forEach((select) => {
  select.addEventListener('change', (e) => {
    const status = e.target.value;
    const movieItem = e.target.closest('.movie-item');
    const movieTitle = movieItem.querySelector('.movie-title').textContent;
    
    localStorage.setItem(movieTitle + "-status", status);
    movieItem.setAttribute('data-status', status);
  });
});

// On page load, retrieve and apply saved statuses
window.addEventListener('DOMContentLoaded', () => {
  movieItems.forEach((item) => {
    const titleElement = item.querySelector('.movie-title');
    if (titleElement) {
      const movieTitle = titleElement.textContent;
      const savedStatus = localStorage.getItem(movieTitle + "-status");
      if (savedStatus) {
        item.setAttribute('data-status', savedStatus);
        const select = item.querySelector('.status-select');
        if (select) {
          select.value = savedStatus;
        }
      }
    }
  });
});
