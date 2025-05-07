// shared.js

// Safe UI setup
function setupSidebarToggle() {
    const sidebarButton = document.getElementById("side-button");
    const sidebar = document.getElementById("sidebar");
    if (sidebarButton && sidebar) {
      sidebarButton.addEventListener("click", () => {
        sidebar.classList.toggle("active");
      });
    }
}

function setupLogoLink() {
  document.addEventListener('DOMContentLoaded', () => {
    let logo = document.getElementById('logo_container');
    if (logo) {
      logo.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }
  });
}
 
function setupFavouritesNavigation() {
  let favouritesListButton = document.getElementById("favourites-button");
  if (favouritesListButton) {
    favouritesListButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // prevent rapid-fire multiple tab opens
      if (favouritesListButton.disabled) return;
      favouritesListButton.disabled = true;
      setTimeout(() => {
        favouritesListButton.disabled = false;
      }, 1000);

      window.open('favourites.html', '_blank');
    });
  }
}
  
// Utility: Estimated Prep Time
function estimatePrepTime() {
    const mins = 25 + Math.floor(Math.random() * 20);
    return `${mins} mins`;
}
  
// Utility: Fetch Categories
function getCategories() {
    return fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
      .then(res => res.json())
      .then(data => data.categories.map(cat =>
        cat.strCategory === "Miscellaneous" ? "Other" : cat.strCategory
      ));
}
  
// Utility: Create Recipe Card
function createCard(meal) {
  let categoryName = meal.strCategory === "Miscellaneous" ? "Other" : meal.strCategory;
  
  let anchorLink = document.createElement('a');
  anchorLink.href = `recipe.html?id=${meal.idMeal}`;
  anchorLink.classList.add('recipe_card');
  anchorLink.target = "_blank";
  anchorLink.rel = "noopener noreferrer";
  
  let thumbnailDiv = document.createElement('div');
  thumbnailDiv.classList.add('thumbnail');
  thumbnailDiv.style.backgroundImage = `url(${meal.strMealThumb})`;
  thumbnailDiv.style.backgroundSize = 'cover';
  thumbnailDiv.style.backgroundPosition = 'center';
  thumbnailDiv.style.backgroundRepeat = 'no-repeat';
  thumbnailDiv.style.borderRadius = '.75rem';
  thumbnailDiv.style.aspectRatio = '16 / 10';

  let heartContainer = document.createElement('div');
  heartContainer.classList.add('heart_icon_container');

  let heartIcon = document.createElement('i');
  heartIcon.classList.add('fa-regular', 'fa-heart', 'heart_icon');

  let favourites = JSON.parse(localStorage.getItem('favourites')) || [];
  if (favourites.includes(meal.idMeal)) {
    heartIcon.classList.remove('fa-regular');
    heartIcon.classList.add('fa-solid');
  }
  
  heartContainer.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    let faves = JSON.parse(localStorage.getItem('favourites')) || [];
    const index = faves.indexOf(meal.idMeal);

    if (index > -1) {
      faves.splice(index, 1);
      heartIcon.classList.remove('fa-solid');
      heartIcon.classList.add('fa-regular');
    } else {
      faves.push(meal.idMeal);
      heartIcon.classList.remove('fa-regular');
      heartIcon.classList.add('fa-solid');
    }

    localStorage.setItem('favourites', JSON.stringify(faves));
  });
  
  heartContainer.appendChild(heartIcon);
  thumbnailDiv.appendChild(heartContainer);

  let detailsDiv = document.createElement('div');
  detailsDiv.classList.add('recipe_details');

  let titleDiv = document.createElement('div');
  titleDiv.classList.add('title');

  let name = document.createElement('h4');
  name.classList.add('name');
  name.textContent = meal.strMeal;

  let descriptionDiv = document.createElement('div');
  descriptionDiv.classList.add('description');

  let category = document.createElement('p');
  category.classList.add('area');
  category.textContent = `🍽️ ${categoryName}`;

  let time = document.createElement('p');
  time.classList.add('area');
  time.textContent = `⏳ ${estimatePrepTime()}`;

  let area = document.createElement('p');
  area.classList.add('area');
  area.textContent = `🌍 ${meal.strArea}`;

  descriptionDiv.append(category, time, area);
  titleDiv.appendChild(name);
  detailsDiv.append(titleDiv, descriptionDiv);
  anchorLink.append(thumbnailDiv, detailsDiv);

  return anchorLink;
}
  
export {
  setupSidebarToggle,
  setupLogoLink,
  setupFavouritesNavigation,
  estimatePrepTime,
  getCategories,
  createCard
};
  