const global = {
  currentPage: window.location.pathname,
};

function highLightActiveLink() {
  const links = document.querySelectorAll(".nav-link");

  links.forEach((link) => {
    if (link.getAttribute("href") === global.currentPage) {
      link.classList.add("active");
    }
  });
}

// Display popular movies on the homepage

async function displayPopularMovies() {
  const { results } = await fetchAPIData("movie/popular");
  results.forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
      <a href="movie-details.html?id=${movie.id}">
        <img
          src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
          class="card-img-top"
          alt="${movie.title}" />
      </a>
      <div class="card-body">
        <h5 class="card-title">${movie.title}</h5>
        <p class="card-text">
          <small class="text-muted">Release: ${movie.release_date}</small>
        </p>
      </div>
    `;
    document.getElementById("popular-movies").appendChild(div);
  });
}

// Display popular TV shows on the homepage

async function displayPopularTVShows() {
  const { results } = await fetchAPIData("tv/popular");
  results.forEach((show) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
      <a href="tv-details.html?id=${show.id}">
        <img
          src="https://image.tmdb.org/t/p/w500${show.poster_path}"
          class="card-img-top"
          alt="${show.name}" />
      </a>
      <div class="card-body">
        <h5 class="card-title">${show.name}</h5>
        <p class="card-text">
          <small class="text-muted">Air Date: ${show.first_air_date}</small>
        </p>
      </div>
    `;
    document.getElementById("popular-shows").appendChild(div);
  });
}

// Display movie details
async function displayMovieDetails() {
  const movieId = new URLSearchParams(window.location.search).get("id");
  const movie = await fetchAPIData(`movie/${movieId}`);

  // Overlay for background image
  displayBackgroundImage("movie", movie.backdrop_path);

  const div = document.createElement("div");
  div.innerHTML = `
        <div class="details-top">
          <div>
          ${
            movie.poster_path
              ? `<img
              src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
              class="card-img-top"
              alt="${movie.title}"
            />`
              : `<img
              src="../images/no-image.jpg"
              class="card-img-top"
              alt="${movie.title}"
            />`
          }
          </div>
          <div>
            <h2>${movie.title}</h2>
            <p>
              <i class="fas fa-star text-primary"></i>
              ${movie.vote_average?.toFixed(1) || "N/A"} / 10
            </p>
            <p class="text-muted">Release Date: ${movie.release_date}</p>
            <p>
              ${movie.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
              <li>${movie.genres[0]?.name || "N/A"}</li>
              <li>${movie.genres[1]?.name || "N/A"}</li>
              <li>${movie.genres[2]?.name || "N/A"}</li>
            </ul>
            <a href="${movie.homepage || "#"}" target="_blank" class="btn">Visit Movie Homepage</a>
          </div>
        </div>
        <div class="details-bottom">
          <h2>Movie Info</h2>
          <ul>
            <li><span class="text-secondary">Budget:</span> $${movie.budget?.toLocaleString() || "N/A"}</li>
            <li><span class="text-secondary">Revenue:</span> $${movie.revenue?.toLocaleString() || "N/A"}</li>
            <li><span class="text-secondary">Runtime:</span> ${movie.runtime || "N/A"} minutes</li>
            <li><span class="text-secondary">Status:</span> ${movie.status || "N/A"}  </li>
          </ul>
          <h4>Production Companies</h4>
          <div class="list-group">${movie.production_companies.map((company) => company.name).join(", ")}</div>
        </div>
    `;
  document.querySelector("#movie-details").appendChild(div);
}

// Display show details
async function displayShowDetails() {
  const showId = new URLSearchParams(window.location.search).get("id");
  const show = await fetchAPIData(`tv/${showId}`);

  // Overlay for background image
  displayBackgroundImage("show", show.backdrop_path);

  const div = document.createElement("div");
  div.innerHTML = `
        <div class="details-top">
          <div>
            ${
              show.poster_path
                ? `<img
              src="https://image.tmdb.org/t/p/w500${show.poster_path}"
              class="card-img-top"
              alt="${show.name}"
            />`
                : `<img
              src="../images/no-image.jpg"
              class="card-img-top"
              alt="${show.name}"
            />`
            }
          </div>
          <div>
            <h2>${show.name}</h2>
            <p>
              <i class="fas fa-star text-primary"></i>
              ${show.vote_average?.toFixed(1) || "N/A"} / 10
            </p>
            <p class="text-muted">Release Date: ${show.first_air_date}</p>
            <p>
              ${show.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
              <li>${show.genres[0]?.name || "N/A"}</li>
              <li>${show.genres[1]?.name || "N/A"}</li>
              <li>${show.genres[2]?.name || "N/A"}</li>
            </ul>
            <a href="${show.homepage || "#"}" target="_blank" class="btn">Visit Show Homepage</a>
          </div>
        </div>
        <div class="details-bottom">
          <h2>Show Info</h2>
          <ul>
            <li><span class="text-secondary">Number Of Episodes:</span> ${show.number_of_episodes || "N/A"}</li>
            <li>
              <span class="text-secondary">Last Episode To Air:</span> ${show.last_episode_to_air?.name || "N/A"}
            </li>
            <li><span class="text-secondary">Status:</span> ${show.status || "N/A"}</li>
          </ul>
          <h4>Production Companies</h4>
          <div class="list-group">${show.production_companies.map((company) => company.name).join(", ")}</div>
        </div>
    `;
  document.querySelector("#show-details").appendChild(div);
}

// Display Backdrop On Details Page

function displayBackgroundImage(type, backgroundPath) {
  const overlayDiv = document.createElement("div");
  overlayDiv.classList.add("overlay-img");
  overlayDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${backgroundPath})`;
  overlayDiv.style.backgroundSize = "cover";
  overlayDiv.style.backgroundPosition = "center";
  overlayDiv.style.backgroundRepeat = "no-repeat";
  overlayDiv.style.height = "100vh";
  overlayDiv.style.width = "100vw";
  overlayDiv.style.position = "absolute";
  overlayDiv.style.top = "0";
  overlayDiv.style.left = "0";
  overlayDiv.style.zIndex = "-1";
  overlayDiv.style.opacity = "0.3";
  document.querySelector(`#${type}-details`).appendChild(overlayDiv);
}

// Search Movies/Shows

// Continuous marquee-style movie slider (pure CSS animation, no Swiper JS instance)
async function displaySlider() {
  const { results } = await fetchAPIData("movie/now_playing");
  const wrapper = document.querySelector(".swiper-wrapper");

  const renderSlide = (movie) => `
    <a href="movie-details.html?id=${movie.id}">
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
    </a>
    <h4 class="swiper-rating">
      <i class="fas fa-star text-secondary"></i> ${movie.vote_average?.toFixed(1) || "N/A"} / 10
    </h4>
  `;

  // Render slides TWICE back-to-back so the CSS loop can reset invisibly at -50%
  [...results, ...results].forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("swiper-slide");
    div.innerHTML = renderSlide(movie);
    wrapper.appendChild(div);
  });
}

// Fetch data from TMDB API

async function fetchAPIData(endpoint) {
  const API_KEY = "5cbf68a73caffbad39c42456e4193ced";
  const API_URL = "https://api.themoviedb.org/3/";

  showSpinner();
  const response = await fetch(
    `${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US`,
  );

  hideSpinner();

  const data = await response.json();
  return data;
}

// Spinner

function showSpinner() {
  document.querySelector(".spinner").classList.add("show");
}

function hideSpinner() {
  document.querySelector(".spinner").classList.remove("show");
}

// Init App

function init() {
  switch (global.currentPage) {
    case "/":
    case "/index.html":
      displaySlider();
      displayPopularMovies();
      break;
    case "/shows.html":
      displayPopularTVShows();
      break;
    case "/movie-details.html":
      displayMovieDetails();
      break;
    case "/tv-details.html":
      displayShowDetails();
      break;
    case "/search.html":
      console.log("Search");
      break;
    default:
      console.log("Page not found");
  }
  highLightActiveLink();
}

// Add event listeners
document.addEventListener("DOMContentLoaded", init);
