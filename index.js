document.addEventListener('DOMContentLoaded', function() {
    const movieList = document.getElementById('movieList');
    const movies = [
        { title: "Inception", genre: "Sci-fi" },
        { title: "Titanic", genre: "Romance" },
        { title: "The Matrix", genre: "Action" }
    ];

    movies.forEach(movie => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.textContent = `${movie.title} (${movie.genre})`;
        movieList.appendChild(li);
    });
});