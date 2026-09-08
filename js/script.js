const global = {
  currentPage: window.location.pathname,
  search: {
    term: "",
    type: "",
    page: 1,
    totalPages: 1,
    totalResults: 0,
  },
  api: {
    apiKey: "5cbf68a73caffbad39c42456e4193ced",
    apiUrl: "https://api.themoviedb.org/3/",
  },
};

const WATCHLIST_KEY = "flixx-watchlist";
const COMPARE_KEY = "flixx-compare";
const RECENT_KEY = "flixx-recent";

function getWatchlist() {
  try {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [];
  } catch {
    return [];
  }
}

function isInWatchlist(id, type) {
  return getWatchlist().some((item) => item.id === id && item.type === type);
}

function updateWatchlistCount() {
  document.querySelectorAll(".watchlist-count").forEach((count) => {
    count.textContent = getWatchlist().length;
  });
}

function toggleWatchlist(item) {
  const watchlist = getWatchlist();
  const index = watchlist.findIndex(
    (saved) => saved.id === item.id && saved.type === item.type,
  );
  if (index >= 0) watchlist.splice(index, 1);
  else watchlist.push(item);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  updateWatchlistCount();
  return index < 0;
}

function getCompareList() {
  try {
    return JSON.parse(localStorage.getItem(COMPARE_KEY)) || [];
  } catch {
    return [];
  }
}

function toggleCompare(item) {
  const compare = getCompareList();
  const index = compare.findIndex(
    (saved) => saved.id === item.id && saved.type === item.type,
  );
  if (index >= 0) compare.splice(index, 1);
  else if (compare.length < 3) compare.push(item);
  else return false;
  localStorage.setItem(COMPARE_KEY, JSON.stringify(compare));
  document
    .querySelectorAll(".compare-count")
    .forEach((count) => (count.textContent = compare.length));
  return true;
}

function renderMediaCard(item, type = "movie") {
  const id = item.id;
  const title = type === "movie" ? item.title : item.name;
  const date = type === "movie" ? item.release_date : item.first_air_date;
  const saved = isInWatchlist(id, type);
  const compared = getCompareList().some(
    (item) => item.id === id && item.type === type,
  );
  const detailsPage =
    type === "movie" ? "movie-details.html" : "tv-details.html";
  const div = document.createElement("div");
  div.classList.add("card");
  div.innerHTML = `
    <a href="${detailsPage}?id=${id}">
      <img src="${item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "images/no-image.jpg"}" class="card-img-top" alt="${title}" />
    </a>
    <div class="card-body">
      <div class="card-meta"><span><i class="fas fa-star"></i> ${item.vote_average?.toFixed(1) || "N/A"}</span><span class="card-actions"><button class="compare-button ${compared ? "saved" : ""}" data-id="${id}" data-type="${type}" aria-label="${compared ? "Remove from" : "Add to"} comparison"><i class="fas fa-code-compare"></i></button><button class="watchlist-button ${saved ? "saved" : ""}" data-id="${id}" data-type="${type}" aria-label="${saved ? "Remove from" : "Add to"} watchlist"><i class="fas fa-bookmark"></i></button></span></div>
      <h5 class="card-title">${title}</h5>
      <p class="card-text"><small>${date || "Release date unavailable"}</small></p>
    </div>`;
  return div;
}

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
  showSkeletons("#popular-movies");
  const { results } = await fetchAPIData("movie/popular");
  document.querySelector("#popular-movies").innerHTML = "";
  results.forEach((movie) =>
    document
      .getElementById("popular-movies")
      .appendChild(renderMediaCard(movie)),
  );
}

// Display popular TV shows on the homepage

async function displayPopularTVShows() {
  showSkeletons("#popular-shows");
  const { results } = await fetchAPIData("tv/popular");
  document.querySelector("#popular-shows").innerHTML = "";
  results.forEach((show) =>
    document
      .getElementById("popular-shows")
      .appendChild(renderMediaCard(show, "tv")),
  );
}

function displayValue(value, fallback = "N/A") {
  return value === undefined || value === null || value === ""
    ? fallback
    : value;
}

function formatDate(date) {
  if (!date) return "N/A";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatRuntime(minutes) {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
}

function formatMoney(amount) {
  return amount ? `$${amount.toLocaleString()}` : "N/A";
}

function joinNames(items, property = "name") {
  return items?.length
    ? items
        .map((item) => item[property])
        .filter(Boolean)
        .join(", ")
    : "N/A";
}

function renderTags(items, property = "name") {
  if (!items?.length) return "<li>N/A</li>";
  return items
    .map((item) => `<li>${displayValue(item[property])}</li>`)
    .join("");
}

function renderCast(credits) {
  const cast = credits?.cast?.slice(0, 8) || [];
  return cast.length
    ? cast
        .map(
          (person) =>
            `<li><a href="person-details.html?id=${person.id}">${person.name}</a> <span>as ${displayValue(person.character)}</span></li>`,
        )
        .join("")
    : "<li>N/A</li>";
}

function saveRecent(item) {
  const recent = getRecent();
  const next = recent.filter(
    (saved) => !(saved.id === item.id && saved.type === item.type),
  );
  next.unshift(item);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next.slice(0, 12)));
}

function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
}

function renderCrew(credits, job) {
  const people =
    credits?.crew?.filter((person) => person.job === job).slice(0, 4) || [];
  return people.length ? joinNames(people) : "N/A";
}

function getMovieCertification(movie) {
  const releases = movie.release_dates?.results?.find(
    (release) => release.iso_3166_1 === "US",
  );
  return (
    releases?.release_dates?.find((release) => release.certification)
      ?.certification || "N/A"
  );
}

function getTrailer(movie) {
  return (
    movie.videos?.results?.find(
      (video) =>
        video.site === "YouTube" && video.type === "Trailer" && video.official,
    ) ||
    movie.videos?.results?.find(
      (video) => video.site === "YouTube" && video.type === "Trailer",
    )
  );
}

function renderRecommendations(movie) {
  const recommendations =
    movie.recommendations?.results
      ?.filter((item) => item.poster_path)
      .slice(0, 4) || [];
  if (!recommendations.length) return "";

  return `
    <section class="recommendations">
      <h2>You May Also Like</h2>
      <div class="recommendation-grid">
        ${recommendations
          .map(
            (item) => `
          <a class="recommendation-card" href="movie-details.html?id=${item.id}">
            <img src="https://image.tmdb.org/t/p/w342${item.poster_path}" alt="${item.title}" />
            <span>${item.title}</span>
            <small><i class="fas fa-star text-primary"></i> ${item.vote_average?.toFixed(1) || "N/A"}</small>
          </a>
        `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderTrailer(movie) {
  const trailer = getTrailer(movie);
  return trailer
    ? `<div class="trailer-panel"><h4>Trailer</h4><div class="trailer-frame"><iframe src="https://www.youtube.com/embed/${trailer.key}" title="${movie.title} trailer" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>`
    : "";
}

function showSkeletons(selector, count = 8) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.innerHTML = Array.from(
    { length: count },
    () =>
      `<div class="skeleton-card"><div class="skeleton-poster"></div><div class="skeleton-line short"></div><div class="skeleton-line"></div></div>`,
  ).join("");
}

// Display movie details
async function displayMovieDetails() {
  const movieId = new URLSearchParams(window.location.search).get("id");
  const movie = await fetchAPIData(
    `movie/${movieId}`,
    "append_to_response=credits,external_ids,release_dates,videos,recommendations,keywords",
  );

  displayBackgroundImage("movie", movie.backdrop_path);
  saveRecent({
    id: movie.id,
    type: "movie",
    title: movie.title,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
    release_date: movie.release_date,
  });

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
            <p class="details-rating">
              <i class="fas fa-star text-primary"></i>
              ${movie.vote_average?.toFixed(1) || "N/A"} / 10
              <span>${movie.vote_count?.toLocaleString() || "0"} votes</span>
            </p>
            <p class="details-tagline">${displayValue(movie.tagline, "A story worth watching.")}</p>
            <p class="text-muted">${formatDate(movie.release_date)} &middot; ${formatRuntime(movie.runtime)} &middot; ${displayValue(movie.status)} &middot; ${getMovieCertification(movie)}</p>
            <p>
              ${displayValue(movie.overview, "No overview available.")}
            </p>
            <h5>Genres</h5>
            <ul class="list-group detail-tags">${renderTags(movie.genres)}</ul>
            <div class="detail-actions">
              ${movie.homepage ? `<a href="${movie.homepage}" target="_blank" rel="noreferrer" class="btn">Official Website</a>` : ""}
              ${movie.imdb_id ? `<a href="https://www.imdb.com/title/${movie.imdb_id}/" target="_blank" rel="noreferrer" class="btn btn-outline">IMDb</a>` : ""}
              <button class="btn btn-outline share-button" type="button" data-title="${movie.title}"><i class="fas fa-share-nodes"></i> Share</button>
            </div>
          </div>
        </div>
        <div class="details-bottom">
          <h2>Movie Info</h2>
          <ul class="details-facts">
            <li><span class="text-secondary">Budget</span><strong>${formatMoney(movie.budget)}</strong></li>
            <li><span class="text-secondary">Revenue</span><strong>${formatMoney(movie.revenue)}</strong></li>
            <li><span class="text-secondary">Original Title</span><strong>${displayValue(movie.original_title)}</strong></li>
            <li><span class="text-secondary">Language</span><strong>${displayValue(movie.original_language?.toUpperCase())}</strong></li>
            <li><span class="text-secondary">Popularity</span><strong>${movie.popularity?.toFixed(1) || "N/A"}</strong></li>
            <li><span class="text-secondary">Production Countries</span><strong>${joinNames(movie.production_countries, "name")}</strong></li>
            <li><span class="text-secondary">Spoken Languages</span><strong>${joinNames(movie.spoken_languages, "english_name")}</strong></li>
            <li><span class="text-secondary">Adult Content</span><strong>${movie.adult ? "Yes" : "No"}</strong></li>
          </ul>
          <div class="details-columns">
            <div><h4>Cast</h4><ul class="details-list">${renderCast(movie.credits)}</ul></div>
            <div><h4>Director</h4><p class="list-group">${renderCrew(movie.credits, "Director")}</p></div>
            <div><h4>Writers</h4><p class="list-group">${renderCrew(movie.credits, "Screenplay")}</p></div>
          </div>
          <h4>Production Companies</h4>
          <div class="list-group">${joinNames(movie.production_companies)}</div>
          <h4>Keywords</h4>
          <ul class="list-group detail-tags">${renderTags(movie.keywords?.keywords)}</ul>
          ${movie.belongs_to_collection ? `<div class="collection-box"><strong>Part of the ${movie.belongs_to_collection.name} collection</strong></div>` : ""}
          ${getTrailer(movie) ? `<a class="trailer-link" href="https://www.youtube.com/watch?v=${getTrailer(movie).key}" target="_blank" rel="noreferrer"><i class="fas fa-play"></i> Watch Trailer</a>` : ""}
            ${renderTrailer(movie)}
          </div>
          ${renderRecommendations(movie)}
      `;
  document.querySelector("#movie-details").appendChild(div);
}

// Display show details
async function displayShowDetails() {
  const showId = new URLSearchParams(window.location.search).get("id");
  const show = await fetchAPIData(
    `tv/${showId}`,
    "append_to_response=credits,external_ids,videos",
  );

  displayBackgroundImage("show", show.backdrop_path);
  saveRecent({
    id: show.id,
    type: "tv",
    name: show.name,
    poster_path: show.poster_path,
    vote_average: show.vote_average,
    first_air_date: show.first_air_date,
  });

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
            <p class="details-rating">
              <i class="fas fa-star text-primary"></i>
              ${show.vote_average?.toFixed(1) || "N/A"} / 10
              <span>${show.vote_count?.toLocaleString() || "0"} votes</span>
            </p>
            <p class="details-tagline">${displayValue(show.tagline, "Your next favorite series starts here.")}</p>
            <p class="text-muted">${formatDate(show.first_air_date)} &middot; ${show.number_of_seasons || "N/A"} seasons &middot; ${displayValue(show.status)}</p>
            <p>
              ${displayValue(show.overview, "No overview available.")}
            </p>
            <h5>Genres</h5>
            <ul class="list-group detail-tags">${renderTags(show.genres)}</ul>
            <div class="detail-actions">
              ${show.homepage ? `<a href="${show.homepage}" target="_blank" rel="noreferrer" class="btn">Official Website</a>` : ""}
              ${show.external_ids?.imdb_id ? `<a href="https://www.imdb.com/title/${show.external_ids.imdb_id}/" target="_blank" rel="noreferrer" class="btn btn-outline">IMDb</a>` : ""}
              <button class="btn btn-outline share-button" type="button" data-title="${show.name}"><i class="fas fa-share-nodes"></i> Share</button>
            </div>
          </div>
        </div>
        <div class="details-bottom">
          <h2>Show Info</h2>
          <ul class="details-facts">
            <li><span class="text-secondary">Episodes</span><strong>${show.number_of_episodes || "N/A"}</strong></li>
            <li><span class="text-secondary">Seasons</span><strong>${show.number_of_seasons || "N/A"}</strong></li>
            <li><span class="text-secondary">Episode Runtime</span><strong>${show.episode_run_time?.length ? `${show.episode_run_time.join(" / ")} minutes` : "N/A"}</strong></li>
            <li><span class="text-secondary">Last Air Date</span><strong>${formatDate(show.last_air_date)}</strong></li>
            <li><span class="text-secondary">Original Language</span><strong>${displayValue(show.original_language?.toUpperCase())}</strong></li>
            <li><span class="text-secondary">Popularity</span><strong>${show.popularity?.toFixed(1) || "N/A"}</strong></li>
          </ul>
          <div class="episode-box">
            <h4>Latest Episode</h4>
            <p><strong>${displayValue(show.last_episode_to_air?.name)}</strong> &middot; ${formatDate(show.last_episode_to_air?.air_date)}</p>
            <p class="list-group">Season ${displayValue(show.last_episode_to_air?.season_number)} &middot; Episode ${displayValue(show.last_episode_to_air?.episode_number)}</p>
          </div>
          <div class="details-columns">
            <div><h4>Cast</h4><ul class="details-list">${renderCast(show.credits)}</ul></div>
            <div><h4>Created By</h4><p class="list-group">${joinNames(show.created_by)}</p></div>
            <div><h4>Networks</h4><p class="list-group">${joinNames(show.networks)}</p></div>
          </div>
          <h4>Production Companies</h4>
          <div class="list-group">${joinNames(show.production_companies)}</div>
          ${renderTrailer({ ...show, title: show.name })}
        </div>
    `;
  document.querySelector("#show-details").appendChild(div);
}

async function displayPersonDetails() {
  const personId = new URLSearchParams(window.location.search).get("id");
  const person = await fetchAPIData(
    `person/${personId}`,
    "append_to_response=combined_credits",
  );
  const credits =
    person.combined_credits?.cast
      ?.filter((item) => item.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 12) || [];
  const target = document.querySelector("#person-details");
  target.innerHTML = `
    <div class="person-hero">
      <img src="${person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : "images/no-image.jpg"}" alt="${person.name}" />
      <div><span class="eyebrow">Cast & crew</span><h1>${person.name}</h1><p>${displayValue(person.biography, "Biography unavailable.")}</p><p class="text-muted">Born: ${formatDate(person.birthday)}${person.place_of_birth ? ` · ${person.place_of_birth}` : ""}</p></div>
    </div>
    <section><h2>Known For</h2><div class="grid">${credits.map((item) => renderMediaCard(item, item.media_type === "tv" ? "tv" : "movie").outerHTML).join("")}</div></section>`;
}

// Display Backdrop On Details Page

function displayBackgroundImage(type, backgroundPath) {
  if (!backgroundPath) return;

  const overlayDiv = document.createElement("div");
  overlayDiv.classList.add("overlay-img");
  overlayDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${backgroundPath})`;
  document
    .querySelector(`#${type}-details`)
    ?.closest("section")
    ?.classList.add("details-page");
  document.body.appendChild(overlayDiv);
}

function showAlert(massage, className = "error") {
  const alertEl = document.createElement("div");
  alertEl.classList.add("alert", className);
  alertEl.appendChild(document.createTextNode(massage));
  const target = document.querySelector("#alert") || document.body;
  target.appendChild(alertEl);

  setTimeout(() => {
    alertEl.remove();
  }, 3000);
}

async function renderComparePage() {
  const target = document.querySelector("#compare-results");
  const empty = document.querySelector("#compare-empty");
  if (!target || !empty) return;
  const items = getCompareList();
  empty.hidden = items.length > 0;
  if (!items.length) {
    target.innerHTML = "";
    return;
  }
  target.innerHTML = `<div class="compare-table"><div class="compare-labels"><strong>Title</strong><strong>Type</strong><strong>Rating</strong><strong>Runtime</strong><strong>Budget</strong><strong>Revenue</strong><strong>Actions</strong></div><div class="compare-loading">Loading full comparison data...</div></div>`;
  const details = await Promise.all(
    items.map(async (item) => ({
      ...item,
      ...(await fetchAPIData(`${item.type}/${item.id}`)),
    })),
  );
  target.innerHTML = `<div class="compare-table"><div class="compare-labels"><strong>Title</strong><strong>Type</strong><strong>Rating</strong><strong>Runtime</strong><strong>Budget</strong><strong>Revenue</strong><strong>Actions</strong></div>${details.map((item) => `<div class="compare-row"><strong>${item.title || item.name}</strong><span>${item.type === "movie" ? "Movie" : "TV Show"}</span><span>${item.vote_average?.toFixed?.(1) || "N/A"} / 10</span><span>${item.type === "movie" ? formatRuntime(item.runtime) : item.episode_run_time?.length ? `${item.episode_run_time[0]}m/ep` : "N/A"}</span><span>${formatMoney(item.budget)}</span><span>${formatMoney(item.revenue)}</span><button class="compare-remove" data-id="${item.id}" data-type="${item.type}">Remove</button></div>`).join("")}</div>`;
}

// Search Movies/Shows

async function searchAPIData() {
  const API_KEY = global.api.apiKey;
  const API_URL = global.api.apiUrl;

  showSpinner();
  try {
    const response = await fetch(
      `${API_URL}search/${global.search.type}?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(global.search.term)}&page=${global.search.page}`,
    );
    if (!response.ok) throw new Error("Search request failed");
    return await response.json();
  } catch {
    showAlert("Search is temporarily unavailable. Please try again.");
    return { results: [], total_pages: 1, page: 1, total_results: 0 };
  } finally {
    hideSpinner();
  }
}

function displaySearchResults(results) {
  //clear prev results

  document.querySelector("#search-results").innerHTML = "";
  document.querySelector("#search-results-heading").innerHTML = "";
  document.querySelector("#pagination").innerHTML = "";

  results.forEach((result) => {
    document.querySelector("#search-results-heading").innerHTML = `
        <h2>${results.length} of ${global.search.totalResults} Results for ${global.search.term}</h2>
    `;
    document
      .getElementById("search-results")
      .appendChild(renderMediaCard(result, global.search.type));
  });

  displayPagination();
}

//create and display pagination for search

function displayPagination() {
  const div = document.createElement("div");
  div.classList.add("pagination");

  div.innerHTML = `
    <button class="btn btn-primary" id="prev">Prev</button>
        <button class="btn btn-primary" id="next">Next</button>
    <div class="page-counter">Page ${global.search.page} of ${global.search.totalPages}</div>
  `;

  document.querySelector("#pagination").appendChild(div);

  // disable prev button on first page

  if (global.search.page === 1) {
    document.querySelector("#prev").disabled = true;
  }
  if (global.search.page === global.search.totalPages) {
    document.querySelector("#next").disabled = true;
  }

  function scrollToResultsTop() {
    document.querySelector("#search-results-wrapper")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  //next page
  document.querySelector("#next").addEventListener("click", async () => {
    global.search.page++;
    const { results, total_pages } = await searchAPIData();
    displaySearchResults(results);
    scrollToResultsTop();
  });
  document.querySelector("#prev").addEventListener("click", async () => {
    global.search.page--;
    const { results, total_pages } = await searchAPIData();
    displaySearchResults(results);
    scrollToResultsTop();
  });
}

async function search() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  global.search.type = urlParams.get("type");
  global.search.term = urlParams.get("search-term");

  if (global.search.term !== "" && global.search.term !== null) {
    const { results, total_pages, page, total_results } = await searchAPIData();
    global.search.page = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;

    if (results.length === 0) {
      showAlert("No results found");
      return;
    }

    displaySearchResults(results);

    document.querySelector("#search-term").value = "";
  } else {
    showAlert("Please enter a search term.");
  }
}

// Continuous, draggable movie slider (JS-driven, no Swiper JS instance)
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

  // Render slides TWICE back-to-back so the loop can reset invisibly
  [...results, ...results].forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("swiper-slide");
    div.innerHTML = renderSlide(movie);
    wrapper.appendChild(div);
  });

  initContinuousSlider();
}

// Drives the continuous auto-scroll + manual drag/swipe for the slider
function initContinuousSlider() {
  const swiperEl = document.querySelector(".swiper");
  const wrapper = document.querySelector(".swiper-wrapper");

  let position = 0;
  let speed = 2; // px p er frame — lower = slower
  let isDragging = false;
  let startX = 0;
  let startPosition = 0;
  let isPaused = false;

  function getMaxScroll() {
    // half the wrapper width, since content is duplicated
    return wrapper.scrollWidth / 2;
  }

  function animate() {
    if (!isDragging && !isPaused) {
      position -= speed;
      const maxScroll = getMaxScroll();
      if (Math.abs(position) >= maxScroll) {
        position = 0;
      }
      wrapper.style.transform = `translateX(${position}px)`;
    }
    requestAnimationFrame(animate);
  }

  // Mouse drag
  swiperEl.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.pageX;
    startPosition = position;
    swiperEl.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.pageX - startX;
    position = startPosition + dx;
    wrapper.style.transform = `translateX(${position}px)`;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    swiperEl.style.cursor = "grab";
  });

  // Touch drag (mobile)
  swiperEl.addEventListener("touchstart", (e) => {
    isDragging = true;
    startX = e.touches[0].pageX;
    startPosition = position;
  });

  swiperEl.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].pageX - startX;
    position = startPosition + dx;
    wrapper.style.transform = `translateX(${position}px)`;
  });

  swiperEl.addEventListener("touchend", () => {
    isDragging = false;
  });

  // Pause on hover (desktop)
  swiperEl.addEventListener("mouseenter", () => (isPaused = true));
  swiperEl.addEventListener("mouseleave", () => (isPaused = false));

  swiperEl.style.cursor = "grab";
  animate();
}

async function displayReleaseCalendar() {
  const target = document.querySelector("#release-calendar");
  if (!target) return;
  showSkeletons("#release-calendar", 6);
  const data = await fetchAPIData("movie/upcoming");
  target.innerHTML = "";
  data.results
    ?.filter((item) => item.release_date)
    .slice(0, 20)
    .forEach((item) => {
      const card = renderMediaCard(item);
      card.classList.add("release-card");
      card.insertAdjacentHTML(
        "afterbegin",
        `<time>${formatDate(item.release_date)}</time>`,
      );
      target.appendChild(card);
    });
}

function displayWatchlist() {
  const results = document.querySelector("#watchlist-results");
  const empty = document.querySelector("#watchlist-empty");
  if (!results || !empty) return;
  results.innerHTML = "";
  const saved = getWatchlist();
  empty.hidden = saved.length > 0;
  saved.forEach((item) =>
    results.appendChild(renderMediaCard(item, item.type)),
  );
}

function setupTheme() {
  const savedTheme = localStorage.getItem("flixx-theme");
  if (savedTheme === "light") document.body.classList.add("light-theme");
  document.querySelectorAll(".theme-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      localStorage.setItem(
        "flixx-theme",
        document.body.classList.contains("light-theme") ? "light" : "dark",
      );
    });
  });
}

function setupGlobalInteractions() {
  document.addEventListener("click", (event) => {
    const shareButton = event.target.closest(".share-button");
    if (shareButton) {
      const shareData = {
        title: shareButton.dataset.title,
        url: window.location.href,
      };
      if (navigator.share) navigator.share(shareData).catch(() => {});
      else
        navigator.clipboard
          ?.writeText(window.location.href)
          .then(() => showAlert("Link copied to clipboard.", "success"));
      return;
    }
    const button = event.target.closest(".watchlist-button");
    if (!button) return;
    event.preventDefault();
    const card = button.closest(".card");
    const link = card?.querySelector("a")?.getAttribute("href") || "";
    const type = button.dataset.type;
    const params = new URLSearchParams(link.split("?")[1]);
    const item = {
      id: Number(button.dataset.id),
      type,
      title:
        type === "movie"
          ? card.querySelector(".card-title").textContent
          : undefined,
      name:
        type === "tv"
          ? card.querySelector(".card-title").textContent
          : undefined,
      poster_path: card.querySelector("img")?.src.split("/w500")[1] || "",
      vote_average:
        Number(
          card.querySelector(".card-meta span")?.textContent.replace("★", ""),
        ) || 0,
      release_date:
        type === "movie"
          ? card.querySelector(".card-text").textContent
          : undefined,
      first_air_date:
        type === "tv"
          ? card.querySelector(".card-text").textContent
          : undefined,
    };
    toggleWatchlist(item);
    button.classList.toggle("saved");
    button.setAttribute(
      "aria-label",
      button.classList.contains("saved")
        ? "Remove from watchlist"
        : "Add to watchlist",
    );
    if (document.querySelector("#watchlist-results")) displayWatchlist();
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".compare-button, .compare-remove");
    if (!button) return;
    event.preventDefault();
    const card = button.closest(".card");
    const item = {
      id: Number(button.dataset.id),
      type: button.dataset.type,
      title: card?.querySelector(".card-title")?.textContent,
      name: card?.querySelector(".card-title")?.textContent,
      vote_average:
        Number(
          card?.querySelector(".card-meta span")?.textContent.replace("★", ""),
        ) || 0,
      release_date: card?.querySelector(".card-text")?.textContent,
      first_air_date: card?.querySelector(".card-text")?.textContent,
      popularity: "N/A",
    };
    if (!toggleCompare(item) && !button.classList.contains("compare-remove")) {
      showAlert("You can compare up to 3 titles.");
      return;
    }
    if (button.classList.contains("compare-remove")) renderComparePage();
    else button.classList.toggle("saved");
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "/" &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
    ) {
      event.preventDefault();
      document.querySelector("#search-term")?.focus();
    }
    if (event.key === "Escape")
      document.querySelector(".main-header")?.classList.remove("menu-open");
    if (
      event.key.toLowerCase() === "t" &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
    )
      document.querySelector(".theme-toggle")?.click();
  });
}

function setupSearchSuggestions() {
  const input = document.querySelector("#search-term");
  const suggestions = document.querySelector("#search-suggestions");
  if (!input || !suggestions) return;
  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    const term = input.value.trim();
    if (term.length < 2) {
      suggestions.innerHTML = "";
      return;
    }
    timer = setTimeout(async () => {
      const type =
        document.querySelector("input[name='type']:checked")?.value || "movie";
      const response = await fetch(
        `${global.api.apiUrl}search/${type}?api_key=${global.api.apiKey}&language=en-US&query=${encodeURIComponent(term)}&page=1`,
      );
      if (!response.ok) return;
      const data = await response.json();
      suggestions.innerHTML = (data.results || [])
        .slice(0, 6)
        .map((item) => `<option value="${item.title || item.name}"></option>`)
        .join("");
    }, 300);
  });
}

function setupMobileNav() {
  const header = document.querySelector(".main-header");
  const nav = header?.querySelector("nav");
  if (!header || !nav || nav.querySelector(".menu-toggle")) return;
  const button = document.createElement("button");
  button.className = "menu-toggle";
  button.type = "button";
  button.setAttribute("aria-label", "Open navigation");
  button.innerHTML = '<i class="fas fa-bars"></i>';
  header.querySelector(".container").insertBefore(button, nav);
  button.addEventListener("click", () => {
    header.classList.toggle("menu-open");
    button.innerHTML = header.classList.contains("menu-open")
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
    button.setAttribute(
      "aria-label",
      header.classList.contains("menu-open")
        ? "Close navigation"
        : "Open navigation",
    );
  });
}

// Fetch data from TMDB API

async function fetchAPIData(endpoint, extraParams = "") {
  const API_KEY = global.api.apiKey;
  const API_URL = global.api.apiUrl;
  const separator = endpoint.includes("?") ? "&" : "?";
  const query = `api_key=${API_KEY}&language=en-US${extraParams ? `&${extraParams}` : ""}`;

  showSpinner();
  try {
    const response = await fetch(`${API_URL}${endpoint}${separator}${query}`);
    if (!response.ok) throw new Error("TMDB request failed");
    return await response.json();
  } catch {
    showAlert(
      navigator.onLine
        ? "Movie data is temporarily unavailable."
        : "You are offline. Check your connection and try again.",
    );
    return { results: [] };
  } finally {
    hideSpinner();
  }
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
  if ("serviceWorker" in navigator)
    navigator.serviceWorker.register("sw.js").catch(() => {});
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
    case "/person-details.html":
      displayPersonDetails();
      break;
    case "/search.html":
      search();
      break;
    case "/watchlist.html":
      displayWatchlist();
      break;
    case "/compare.html":
      renderComparePage();
      break;
    case "/calendar.html":
      displayReleaseCalendar();
      break;
    default:
      console.log("Page not found");
  }
  highLightActiveLink();
  updateWatchlistCount();
  document.querySelectorAll(".compare-count").forEach((count) => {
    count.textContent = getCompareList().length;
  });
  setupTheme();
  setupGlobalInteractions();
  setupSearchSuggestions();
  setupMobileNav();
  setupKeyboardShortcuts();
  window.addEventListener("offline", () =>
    showAlert("You are offline. Existing saved titles are still available."),
  );
}

// Add event listeners
document.addEventListener("DOMContentLoaded", init);
