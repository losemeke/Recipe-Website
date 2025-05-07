import {
  setupSidebarToggle,
  setupLogoLink,
  setupFavouritesNavigation,
  estimatePrepTime,
  getCategories,
  createCard,
} from './shared.js';

setupSidebarToggle();
setupLogoLink();
setupFavouritesNavigation();

let savedRecipes = document.getElementById(`saved-recipes`);
document.addEventListener("DOMContentLoaded", loadFavourites);

async function loadFavourites() {
  let rawFaves = JSON.parse(localStorage.getItem("favourites")) || [];
  let faveIds = rawFaves.filter(id => typeof id === "string" && id.trim() && !isNaN(id));

  if (faveIds.length === 0) {
    savedRecipes.innerHTML = "<p>You have no saved recipes 😢</p>";
    return;
  }

  for (let id of faveIds) {
    let meal = await fetchMealById(id);
    let card = createCard(meal);
    savedRecipes.appendChild(card);
  }
}

async function fetchMealById(id) {
  let res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
  let data = await res.json();
  return data.meals[0];
}

// function estimatePrepTime() {
//   const mins = 25 + Math.floor(Math.random() * 20);
//   return `${mins} mins`;
// }

// function createCard(meal) {
//   const categoryName = meal.strCategory === "Miscellaneous" ? "Other" : meal.strCategory;

//   let anchorLink = document.createElement('a');
//   anchorLink.href = `recipe.html?id=${meal.idMeal}`;
//   anchorLink.classList.add('recipe_card');
//   anchorLink.target = "_blank";
//   anchorLink.rel = "noopener noreferrer";

//   // === Thumbnail ===
//   let thumbnailDiv = document.createElement('div');
//   thumbnailDiv.classList.add('thumbnail');

//   let thumbnail = document.createElement('img');
//   thumbnail.src = meal.strMealThumb;
//   thumbnail.alt = meal.strMeal;

//   // === Heart overlay ===
//   let heartContainer = document.createElement('div');
//   heartContainer.classList.add('heart_icon_container');

//   let heartIcon = document.createElement('i');
//   heartIcon.classList.add('fa-regular', 'fa-heart', 'heart_icon');

//   let favourites = JSON.parse(localStorage.getItem('favourites')) || [];
//   if (favourites.includes(meal.idMeal)) {
//     heartIcon.classList.remove('fa-regular');
//     heartIcon.classList.add('fa-solid');
//   }

//   heartContainer.addEventListener('click', (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     let faves = JSON.parse(localStorage.getItem('favourites')) || [];
//     const index = faves.indexOf(meal.idMeal);

//     if (index > -1) {
//       faves.splice(index, 1);
//       heartIcon.classList.remove('fa-solid');
//       heartIcon.classList.add('fa-regular');
//     } else {
//       faves.push(meal.idMeal);
//       heartIcon.classList.remove('fa-regular');
//       heartIcon.classList.add('fa-solid');
//     }

//     localStorage.setItem('favourites', JSON.stringify(faves));
//   });

//   heartContainer.appendChild(heartIcon);
//   thumbnailDiv.append(thumbnail, heartContainer);

//   // === Details ===
//   let detailsDiv = document.createElement('div');
//   detailsDiv.classList.add('recipe_details');

//   let titleDiv = document.createElement('div');
//   titleDiv.classList.add('title');

//   let name = document.createElement('h4');
//   name.classList.add('name');
//   name.textContent = meal.strMeal;

//   let descriptionDiv = document.createElement('div');
//   descriptionDiv.classList.add('description');

//   let category = document.createElement('p');
//   category.classList.add('area');
//   category.textContent = `🍽️ ${categoryName}`;

//   let time = document.createElement('p');
//   time.classList.add('area');
//   time.textContent = `⏳ ${estimatePrepTime()}`;

//   let area = document.createElement('p');
//   area.classList.add('area');
//   area.textContent = `🌍 ${meal.strArea}`;

//   descriptionDiv.append(category, time, area);
//   titleDiv.appendChild(name);
//   detailsDiv.append(titleDiv, descriptionDiv);
//   anchorLink.append(thumbnailDiv, detailsDiv);

//   return anchorLink;
// }
