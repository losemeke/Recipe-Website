import { setupLogoLink } from './shared.js';
setupLogoLink();

let heroSection = document.getElementById('hero-section');
let randomRecipesSection = document.getElementById('random-recipes');
let searchResults = document.getElementById('search-results');
let searchBar = document.getElementById('search-input');
let favouritesListButton = document.getElementById('favourites-button');
let sidebarButton = document.getElementById('side-button');
let sidebar = document.getElementById('sidebar');

// rotating images for hero section
let images = [
  'https://images.unsplash.com/photo-1639896773569-ba2bde2f9164?q=80&w=3871&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1637370988123-41bd9a6bcd48?q=80&w=3200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1608835291093-394b0c943a75?q=80&w=3872&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=3870&auto=format&fit=crop'
];

let currentImage = 0;
heroSection.style.backgroundImage = `url('${images[currentImage]}')`;
function rotateBackground() {
  currentImage = (currentImage + 1) % images.length;
  heroSection.style.backgroundImage = `url('${images[currentImage]}')`;
}
setInterval(rotateBackground, 3000);

// === Create styled card ===
function estimatePrepTime() {
  const mins = 25 + Math.floor(Math.random() * 20);
  return `${mins} mins`;
}

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

  let categoryDescriptionIcon = document.createElement('p')
  categoryDescriptionIcon.classList.add('catDescriptionIcons')
  categoryDescriptionIcon.textContent = '🍽️'

  let category = document.createElement('p');
  category.classList.add('area');
  category.textContent = `${categoryName}`;

  let CATdescriptionSubDiv = document.createElement('div');
  CATdescriptionSubDiv.classList.add('sub-descriptions')
  CATdescriptionSubDiv.append(categoryDescriptionIcon, category)

  let timeDescriptionIcon = document.createElement('p')
  timeDescriptionIcon.classList.add('descriptionIcons')
  timeDescriptionIcon.textContent = '⏳'

  let time = document.createElement('p');
  time.classList.add('area');
  time.textContent = `${estimatePrepTime()}`;

  let TIMEdescriptionSubDiv = document.createElement('div');
  TIMEdescriptionSubDiv.classList.add('sub-descriptions')
  TIMEdescriptionSubDiv.append(timeDescriptionIcon, time)

  let areaDescriptionIcon = document.createElement('p')
  areaDescriptionIcon.classList.add('descriptionIcons')
  areaDescriptionIcon.textContent = '🌍'

  let area = document.createElement('p');
  area.classList.add('area');
  area.textContent = `${meal.strArea}`;

  let AREAdescriptionSubDiv = document.createElement('div');
  AREAdescriptionSubDiv.classList.add('sub-descriptions')
  AREAdescriptionSubDiv.append(areaDescriptionIcon, area)

  descriptionDiv.append(CATdescriptionSubDiv, TIMEdescriptionSubDiv, AREAdescriptionSubDiv);
  titleDiv.appendChild(name);
  detailsDiv.append(titleDiv, descriptionDiv);
  anchorLink.append(thumbnailDiv, detailsDiv);

  return anchorLink;
}

// === Load random recipes ===
const randomFoodAPI = 'https://www.themealdb.com/api/json/v1/1/random.php';

async function fetchRandomMeal() {
  const result = await fetch(randomFoodAPI);
  const data = await result.json();
  return data.meals[0];
}

async function getCategories() {
  const res = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
  const data = await res.json();
  return data.categories.map(c =>
    c.strCategory === "Miscellaneous" ? "Other" : c.strCategory
  );
}

async function loadRandomRecipes() {
  randomRecipesSection.innerHTML = '';
  const uniqueMeals = new Map();

  while (uniqueMeals.size < 12) {
    const meal = await fetchRandomMeal();
    const isUnique = !uniqueMeals.has(meal.idMeal);
    const hasYoutube = meal.strYoutube && meal.strYoutube.trim() !== '';

    if (isUnique && hasYoutube) {
      uniqueMeals.set(meal.idMeal, meal);
    }
  }

  for (let meal of uniqueMeals.values()) {
    let card = createCard(meal);
    randomRecipesSection.append(card);
  }
}

loadRandomRecipes();
getCategories();

// === Search functionality ===
searchBar.addEventListener('input', async function () {
  const query = searchBar.value.trim();

  if (query.length > 0) {
    randomRecipesSection.classList.add('hidden');
    searchResults.classList.remove('hidden');

    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    const data = await res.json();

    searchResults.innerHTML = '';

    if (data.meals) {
      data.meals.forEach(meal => {
        const card = createCard(meal);
        searchResults.appendChild(card);
      });
    } else {
      searchResults.innerHTML = `<p>No recipes found for "${query}".</p>`;
    }
  } else {
    searchResults.innerHTML = '';
    searchResults.classList.add('hidden');
    randomRecipesSection.classList.remove('hidden');
  }
});

// === Sidebar toggle ===
sidebarButton.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});


