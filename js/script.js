// 5cbf68a73caffbad39c42456e4193ced

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

// Init App

function init() {
  switch (global.currentPage) {
    case "/":
    case "/index.html":
      console.log("Home");
      break;
    case "/shows.html":
      console.log("Shows");
      break;
    case "movie-details.html":
      console.log("Movie Details");
      break;
    case "tv-details.html":
      console.log("TV Details");
      break;
    case "search.html":
      console.log("Search");
      break;
    default:
      console.log("Page not found");
  }
  highLightActiveLink();
}

// Add event listeners
document.addEventListener("DOMContentLoaded", init);
