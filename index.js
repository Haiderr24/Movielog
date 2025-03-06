let movies = [];
let tmdbConfig = null;


// TMDB Configuration Functions
function fetchTmdbConfig() {
  return fetch(`https://api.themoviedb.org/3/configuration?api_key=63e03b0266ef0f0f265675a6efbaf77b`)
    .then(response => response.json())
    .then(data => {
      tmdbConfig = data.images;
      return tmdbConfig;
    })
    .catch(error => {
      console.error('Error fetching TMDB configuration:', error);
      tmdbConfig = {
        secure_base_url: 'https://image.tmdb.org/t/p/',
        poster_sizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'original']
      };
      return tmdbConfig;
    });
}

function getPosterUrl(posterPath, size = 'w500') {
  if (!tmdbConfig) {
    return 'images/default-image.jpg';
  }
  return `${tmdbConfig.secure_base_url}${size}${posterPath}`;
}

function searchTmdbMovie(movieTitle) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=63e03b0266ef0f0f265675a6efbaf77b&query=${encodeURIComponent(movieTitle)}`;
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        const firstResult = data.results[0];
        const posterPath = firstResult.poster_path || null;
        const releaseDate = firstResult.release_date || '';
        const releaseYear = releaseDate ? releaseDate.substring(0, 4) : 'Unknown';
        return { posterPath, releaseYear };
      } else {
        return { posterPath: null, releaseYear: 'Unknown' };
      }
    });
}

// Local Storage Functions
function loadMovies() {
  const storedMovies = localStorage.getItem('movies');
  return storedMovies ? JSON.parse(storedMovies) : [];
}

function saveMovies(movies) {
  localStorage.setItem('movies', JSON.stringify(movies));
}

// Movie Card Creation
function createMovieCard(movie, index) {
  const colDiv = document.createElement('div');
  colDiv.className = 'col-md-4 col-sm-6 mb-4';

  const movieItem = document.createElement('div');
  movieItem.className = 'movie-item';
  movieItem.setAttribute('data-status', movie.status);

  // Movie image
  const imageDiv = document.createElement('div');
  imageDiv.className = 'movie-image';
  let posterUrl = '';
  if (movie.poster_path) {
    posterUrl = getPosterUrl(movie.poster_path, 'w500');
  } else {
    posterUrl = movie.imageUrl || 'images/default-image.jpg';
  }
  imageDiv.style.backgroundImage = `url('${posterUrl}')`;
  imageDiv.style.backgroundSize = 'cover';
  imageDiv.style.backgroundPosition = 'center';
  imageDiv.style.height = '400px';

  // Info container (title, genre, status, rating, remove button)
  const infoDiv = document.createElement('div');
  infoDiv.className = 'movie-info text-center';

  const titleEl = document.createElement('h5');
  titleEl.className = 'movie-title';
  titleEl.textContent = movie.title;

  const genreEl = document.createElement('p');
  genreEl.className = 'movie-subtitle';
  genreEl.textContent = movie.genre;

  if (movie.releaseYear) {
    const yearEl = document.createElement('p');
    yearEl.className = 'movie-year';
    yearEl.textContent = `Year: ${movie.releaseYear}`;
    infoDiv.appendChild(yearEl);
  }

  const statusSelect = document.createElement('select');
  statusSelect.className = 'form-select status-select';
  statusSelect.setAttribute('aria-label', 'Select movie status');
  statusSelect.innerHTML = `
    <option value="to-watch">To Watch</option>
    <option value="watching">Watching</option>
    <option value="watched">Watched</option>
  `;
  statusSelect.value = movie.status || 'to-watch';

  const ratingContainer = document.createElement('div');
  ratingContainer.className = 'rating-container mt-2';
  const ratingLabel = document.createElement('span');
  ratingLabel.textContent = 'Rating: ';
  const ratingSelect = document.createElement('select');
  ratingSelect.className = 'form-select rating-select';
  ratingSelect.style.display = 'inline-block';
  ratingSelect.style.width = 'auto';
  ratingSelect.innerHTML = `
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
  `;
  if (movie.rating) {
    ratingSelect.value = movie.rating;
  }
  ratingSelect.addEventListener('change', (e) => {
    movie.rating = e.target.value;
    saveMovies(movies);
  });
  ratingContainer.appendChild(ratingLabel);
  ratingContainer.appendChild(ratingSelect);
  ratingContainer.style.display = (movie.status === 'watched') ? 'block' : 'none';

  statusSelect.addEventListener('change', (e) => {
    movie.status = e.target.value;
    if (movie.status === 'watched') {
      ratingContainer.style.display = 'block';
      confetti({
        particleCount: 1000,
        spread: 1000,
        origin: { y: 0.4 }
      });
    } else {
      ratingContainer.style.display = 'none';
      movie.rating = null;
    }
    saveMovies(movies);
    movieItem.setAttribute('data-status', movie.status);
  });

  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn btn-danger btn-sm mt-2';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', () => {
    movies.splice(index, 1);
    saveMovies(movies);
    renderMovies();
  });

  infoDiv.appendChild(titleEl);
  infoDiv.appendChild(genreEl);
  infoDiv.appendChild(statusSelect);
  infoDiv.appendChild(ratingContainer);
  infoDiv.appendChild(removeBtn);

  movieItem.appendChild(imageDiv);
  movieItem.appendChild(infoDiv);
  colDiv.appendChild(movieItem);

  return colDiv;
}



function renderMovies() {
  const moviesContainer = document.getElementById('moviesContainer');
  moviesContainer.innerHTML = '';
  movies.forEach((movie, index) => {
    const card = createMovieCard(movie, index);
    moviesContainer.appendChild(card);
  });
}


function incorporateStaticMovies() {
  const staticMovieElements = document.querySelectorAll('.row.g-5 .movie-item');
  const staticMovies = [];
  staticMovieElements.forEach((item) => {
    const titleEl = item.querySelector('.movie-title');
    const genreEl = item.querySelector('.movie-subtitle');
    let imageUrl = '';
    const imageDiv = item.querySelector('.movie-image');
    if (imageDiv) {
      const computedBg = getComputedStyle(imageDiv).backgroundImage;
      if (computedBg && computedBg !== 'none') {
        imageUrl = computedBg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
      } else if (titleEl) {
        const safeTitle = titleEl.textContent.trim().replace(/[^a-zA-Z0-9]/g, '');
        imageUrl = `images/${safeTitle}.jpg`;
      }
    }
    const statusSelect = item.querySelector('.status-select');
    let status = statusSelect ? statusSelect.value || 'to-watch' : 'to-watch';
    let releaseYear = item.getAttribute('data-release-year') || 'Unknown';
    staticMovies.push({
      title: titleEl ? titleEl.textContent.trim() : '',
      genre: genreEl ? genreEl.textContent.trim() : '',
      imageUrl: imageUrl || 'images/default-image.jpg',
      status: status,
      releaseYear: releaseYear
    });
  });
  saveMovies(staticMovies);
  return staticMovies;
}

function removeStaticContainer() {
  const staticContainer = document.querySelector('.row.g-5');
  if (staticContainer) {
    staticContainer.parentElement.removeChild(staticContainer);
  }
}


// Event Listener Setup
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');

if (searchForm) {
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
  });
}

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const renderedMovieItems = document.querySelectorAll('.movie-item');
    renderedMovieItems.forEach((item) => {
      const titleElement = item.querySelector('.movie-title');
      const genreElement = item.querySelector('.movie-subtitle');
      const title = titleElement ? titleElement.textContent.toLowerCase() : "";
      const genre = genreElement ? genreElement.textContent.toLowerCase() : "";
      if (title.includes(query) || genre.includes(query)) {
        item.parentElement.style.display = '';
      } else {
        item.parentElement.style.display = 'none';
      }
    });
  });
}

const addMovieForm = document.getElementById('addMovieForm');
if (addMovieForm) {
  addMovieForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = document.getElementById('movieTitle').value.trim();
    const genre = document.getElementById('movieGenre').value.trim();
    searchTmdbMovie(title)
      .then(({ posterPath, releaseYear }) => {
        const newMovie = {
          title: title,
          genre: genre,
          poster_path: posterPath,
          releaseYear: releaseYear,
          status: 'to-watch'
        };
        movies.push(newMovie);
        saveMovies(movies);
        renderMovies();
        addMovieForm.reset();
      })
      .catch((error) => {
        console.error("Error searching TMDB:", error);
        const newMovie = {
          title: title,
          genre: genre,
          poster_path: null,
          releaseYear: 'Unknown',
          status: 'to-watch'
        };
        movies.push(newMovie);
        saveMovies(movies);
        renderMovies();
        addMovieForm.reset();
      });
  });
}


// Initialization
fetchTmdbConfig().then(() => {
  movies = loadMovies();
  if (movies.length === 0) {
    movies = incorporateStaticMovies();
  }
  removeStaticContainer();
  renderMovies();
  console.log('TMDB configuration loaded and movies rendered.');
});
