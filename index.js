let heroSection = document.getElementById('hero-section')
let randomRecipes = document.getElementById(`random-recipes`)
let searchResults = document.getElementById(`search-results`)
let randomRecipesSection = document.getElementById('random-recipes');
let favouritesListButton = document.getElementById(`favourites-button`)
let searchBar = document.getElementById(`search-input`)
let sidebarButton = document.getElementById(`side-button`)
let sidebar = document.getElementById(`sidebar`)

// Rotating background images
let images = [
    'https://images.unsplash.com/photo-1639896773569-ba2bde2f9164?q=80&w=3871&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1637370988123-41bd9a6bcd48?q=80&w=3200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1608835291093-394b0c943a75?q=80&w=3872&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
];
let currentImage = 0;
// Initial default
heroSection.style.backgroundImage = `url('${images[currentImage]}')`;
function rotateBackground() {
    currentImage = (currentImage + 1) % images.length;
    heroSection.style.backgroundImage = `url('${images[currentImage]}')`;
}
setInterval(rotateBackground, 3000); // every 3 seconds


// Get 12 random meals using the API
const randomFoodAPI = 'https://www.themealdb.com/api/json/v1/1/random.php'
async function fetchRandomMeal() {
  const result = await fetch(randomFoodAPI);
  const data = await result.json();
  return data.meals[0];
}
fetchRandomMeal();

function createCard(meal) {
  const categoryName = meal.strCategory === "Miscellaneous" ? "Other" : meal.strCategory;

  let anchorLink = document.createElement('a');
  anchorLink.href = `recipe.html?id=${meal.idMeal}`;
  anchorLink.classList.add('recipe_card');
  anchorLink.target = "_blank";
  anchorLink.rel = "noopener noreferrer";

  // === Thumbnail ===
  let thumbnailDiv = document.createElement('div');
  thumbnailDiv.classList.add('thumbnail');

  let thumbnail = document.createElement('img');
  thumbnail.src = meal.strMealThumb;
  thumbnail.alt = meal.strMeal;

  // === Heart overlay ===
  let heartContainer = document.createElement('div');
  heartContainer.classList.add('heart_icon_container');

  let heartIcon = document.createElement('i');
  heartIcon.classList.add('fa-regular', 'fa-heart', 'heart_icon');

  // Pre-fill if already favourited
  let favourites = JSON.parse(localStorage.getItem('favourites')) || [];
  if (favourites.includes(meal.idMeal)) {
    heartIcon.classList.remove('fa-regular');
    heartIcon.classList.add('fa-solid');
  }

  // Handle click without triggering link
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
  thumbnailDiv.append(thumbnail, heartContainer);

  // === Details ===
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


// Print recipes on the UI
async function loadRandomRecipes() {
  randomRecipesSection.innerHTML = ''; // Clear section first
  const uniqueMeals = new Map();

  // Keep fetching until we get 12 unique meals
  while (uniqueMeals.size < 12) {
    const meal = await fetchRandomMeal();

    if (!uniqueMeals.has(meal.idMeal)) {
      uniqueMeals.set(meal.idMeal, meal);
    }

    // Make sure every selection has a youtube tutorial
    const hasYoutube = meal.strYoutube && meal.strYoutube.trim() !== '';
    const isUnique = !uniqueMeals.has(meal.idMeal);

    if (hasYoutube && isUnique) {
      uniqueMeals.set(meal.idMeal, meal);
    }
  }

  const categoryList = await getCategories(); // contains cleaned names

  for (let meal of uniqueMeals.values()) {
    const categoryName = meal.strCategory === "Miscellaneous" ? "Other" : meal.strCategory;

    // // === Anchor link ===
    // let anchorLink = document.createElement('a');
    // anchorLink.href = `recipe.html?id=${meal.idMeal}`;
    // anchorLink.classList.add('recipe_card');

    // // === Image wrapper ===
    // let thumbnailDiv = document.createElement(`div`)
    // thumbnailDiv.classList.add(`thumbnail`)

    // let thumbnail = document.createElement('img')
    // thumbnail.src = meal.strMealThumb
    // thumbnail.alt = meal.strMeal

    // thumbnailDiv.append(thumbnail);

    // // === Recipe details ===
    // let detailsDiv = document.createElement('div');
    // detailsDiv.classList.add('recipe_details');

    // let titleDiv = document.createElement(`div`)
    // titleDiv.classList.add(`title`)

    // // Name of Dish
    // let name = document.createElement('h4');
    // name.classList.add('name');
    // name.textContent = meal.strMeal;

    // // Description block (ingredient category + time + area)
    // let descriptionDiv = document.createElement('div');
    // descriptionDiv.classList.add('description');

    // let category = document.createElement('p');
    // category.classList.add(`area`)
    // category.textContent = `🍽️ ${categoryName}`

    // let time = document.createElement('p');
    // time.classList.add(`area`)
    // time.textContent = `⏳ ${estimatePrepTime()}`;

    // let area = document.createElement(`p`)
    // area.classList.add(`area`)
    // area.textContent = `🌍 ${meal.strArea}`

    // descriptionDiv.append(category, time, area);
    // titleDiv.append(name)
    // // Append Recipe Details
    // detailsDiv.append(titleDiv, descriptionDiv);

    // // Assemble card
    // anchorLink.append(thumbnailDiv, detailsDiv);
    let card = createCard(meal);
    randomRecipesSection.append(card);
  };
}
// Load them on page load
loadRandomRecipes();
getCategories()

// Fallback fake prep time
function estimatePrepTime() {
  const mins = 25 + Math.floor(Math.random() * 20);
  return `${mins} mins`;
}

// Update the categories by changing "Miscellaneous" to "Other" before sending to the UI
async function getCategories() {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
    const data = await res.json();
  
    // .map() is used to extract JUST the name of each category
    const categories = data.categories.map(category => {
      return category.strCategory === "Miscellaneous"
        ? "Other"
        : category.strCategory;
    });
  
    return categories;
}


// Search for recipes and display in the UI
searchBar.addEventListener('input', async function () {
    const query = searchBar.value.trim();
  
    // Hide random section when searching
    if (query.length > 0) {
        randomRecipesSection.classList.add('hidden');
        searchResults.classList.remove('hidden');
  
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      const data = await res.json();
  
      searchResults.innerHTML = ''; // Clear previous results
  
      if (data.meals) {
        data.meals.forEach(meal => {
          const card = createCard(meal);
          searchResults.appendChild(card);
        });
      } else {
        searchResults.innerHTML = `<p>No recipes found for "${query}".</p>`;
      }
    } else {
      // Show random recipes again if search is cleared
      searchResults.innerHTML = '';
      searchResults.classList.add('hidden');
      randomRecipesSection.classList.remove('hidden');
    }
});

// Toggle sidebar
sidebarButton.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

// Pull saved recipes from local storage to favourites page
favouritesListButton.addEventListener(`click`, () => {
  window.location.href = 'favourites.html';
});
  




