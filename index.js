
function loadMovies() {
    const storedMovies = localStorage.getItem('movies');
    return storedMovies ? JSON.parse(storedMovies) : [];
  }
  
  function saveMovies(movies) {
    localStorage.setItem('movies', JSON.stringify(movies));
  }
  



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
  
        // Hide or show the parent column based on match
        if (title.includes(query) || genre.includes(query)) {
          item.parentElement.style.display = '';
        } else {
          item.parentElement.style.display = 'none';
        }
      });
    });
  }
  
 


  function createMovieCard(movie, index) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-4 col-sm-6';
  
    const movieItem = document.createElement('div');
    movieItem.className = 'movie-item';
    movieItem.setAttribute('data-status', movie.status);
  
    const imageDiv = document.createElement('div');
    imageDiv.className = 'movie-image';
    imageDiv.style.backgroundImage = `url('${movie.imageUrl || 'images/default-image.jpg'}')`;
    imageDiv.style.backgroundSize = 'cover';
    imageDiv.style.backgroundPosition = 'center';
    imageDiv.style.height = '400px';
  
    const infoDiv = document.createElement('div');
    infoDiv.className = 'movie-info text-center';
  
    const titleEl = document.createElement('h5');
    titleEl.className = 'movie-title';
    titleEl.textContent = movie.title;
  
    const genreEl = document.createElement('p');
    genreEl.className = 'movie-subtitle';
    genreEl.textContent = movie.genre;
  
    // Status dropdown
    const statusSelect = document.createElement('select');
    statusSelect.className = 'form-select status-select';
    statusSelect.setAttribute('aria-label', 'Select movie status');
    statusSelect.innerHTML = `
      <option value="to-watch">To Watch</option>
      <option value="watching">Watching</option>
      <option value="watched">Watched</option>
    `;
    statusSelect.value = movie.status || 'to-watch';
  
    statusSelect.addEventListener('change', (e) => {
      movie.status = e.target.value;
      saveMovies(movies);
      movieItem.setAttribute('data-status', movie.status);
    });
  


    // Adding remove functionality
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn btn-danger btn-sm mt-2';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      movies.splice(index, 1);
      saveMovies(movies);
      renderMovies();
    });
  
    // Append elements
    infoDiv.appendChild(titleEl);
    infoDiv.appendChild(genreEl);
    infoDiv.appendChild(statusSelect);
    infoDiv.appendChild(removeBtn);
  
    movieItem.appendChild(imageDiv);
    movieItem.appendChild(infoDiv);
    colDiv.appendChild(movieItem);
  
    return colDiv;
  }
  
  


  function renderMovies() {
    const moviesContainer = document.getElementById('moviesContainer');
    moviesContainer.innerHTML = ''; // Clear previous movies
    movies.forEach((movie, index) => {
      const card = createMovieCard(movie, index);
      moviesContainer.appendChild(card);
    });
  }
  
  


  let movies = loadMovies();
  
  if (movies.length === 0) {
    const staticMovieElements = document.querySelectorAll('.row.g-5 .movie-item');
    const staticMovies = [];
    staticMovieElements.forEach((item) => {
      const titleEl = item.querySelector('.movie-title');
      const genreEl = item.querySelector('.movie-subtitle');
      let imageUrl = '';
      const imageDiv = item.querySelector('.movie-image');
      if (imageDiv) {
        imageUrl = imageDiv.style.backgroundImage
          .replace(/^url\(["']?/, '')
          .replace(/["']?\)$/, '');
      }
      const statusSelect = item.querySelector('.status-select');
      let status = statusSelect ? statusSelect.value || 'to-watch' : 'to-watch';
      staticMovies.push({
        title: titleEl ? titleEl.textContent.trim() : '',
        genre: genreEl ? genreEl.textContent.trim() : '',
        imageUrl: 'images/default-image.jpg',
        status: status
      });
    });
    saveMovies(staticMovies);
    movies = staticMovies;
  }
  
  // Remove the static container to prevent duplication
  const staticContainer = document.querySelector('.row.g-5');
  if (staticContainer) {
    staticContainer.parentElement.removeChild(staticContainer);
  }
  

  renderMovies();
  
  

  
  const addMovieForm = document.getElementById('addMovieForm');
  if (addMovieForm) {
    addMovieForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const title = document.getElementById('movieTitle').value.trim();
      const genre = document.getElementById('movieGenre').value.trim();
      const imageUrl = document.getElementById('movieImage').value.trim() || 'images/default-image.jpg';
      const newMovie = {
        title: title,
        genre: genre,
        imageUrl: imageUrl,
        status: 'to-watch'
      };
      movies.push(newMovie);
      saveMovies(movies);
      renderMovies();
      addMovieForm.reset();
    });
  }
  