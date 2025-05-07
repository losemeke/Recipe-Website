import {
  setupSidebarToggle,
  setupLogoLink,
  setupFavouritesNavigation,
} from './shared.js';

setupSidebarToggle();
setupLogoLink();
setupFavouritesNavigation();
  
// === Element references ===
let backIcon = document.getElementById('back-arrow');
let videoFrame = document.getElementById('video-frame');
let nameOfRecipe = document.getElementById('name');
let region = document.getElementById('area');
let recipePic = document.querySelector('#recipe-pic img');
let ingredientsButton = document.getElementById('ingredients-button');
let instructionsButton = document.getElementById('instructions-button');
let infoContainer = document.getElementById('info_container');
let likeButton = document.getElementById('like-button');
let heartIcon = document.getElementById('like-icon');

let ingredientOverlay, instructionOverlay;
  
// === Back button logic ===
if (backIcon) {
  backIcon.addEventListener("click", () => {
    window.location.href = 'index.html';
  });
}

// === Get ID from URL ===
let urlParams = new URLSearchParams(window.location.search);
let mealId = urlParams.get('id');

// === Fetch data by ID ===
async function fetchMealDetails(id) {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
  const data = await res.json();
  return data.meals[0];
}
  
// === Embed YouTube video ===
function attachYoutubeVideo(meal) {
  if (meal.strYoutube && meal.strYoutube.includes('v=')) {
    const videoId = meal.strYoutube.split('v=')[1];
    videoFrame.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
  } else {
    videoFrame.style.display = 'none';
  }
}
  
// === Load recipe ===
async function loadRecipe() {
  const meal = await fetchMealDetails(mealId);

  nameOfRecipe.textContent = meal.strMeal;
  region.textContent = meal.strArea;
  recipePic.src = meal.strMealThumb;

  attachYoutubeVideo(meal);

  // === INGREDIENTS ===
  ingredientOverlay = document.createElement('div');
  ingredientOverlay.id = 'ingredients-overlay-container';
  ingredientOverlay.classList.add('overlay_container');

  let ingredientList = document.createElement('ul');
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      const li = document.createElement('li');
      li.textContent = `${meas} ${ing}`;
      ingredientList.appendChild(li);
    }
  }
  ingredientOverlay.appendChild(ingredientList);

  // === INSTRUCTIONS ===
  instructionOverlay = document.createElement('div');
  instructionOverlay.id = 'instructions-overlay-container';
  instructionOverlay.classList.add('overlay_container');
  instructionOverlay.style.display = 'none';

  const steps = meal.strInstructions.split(/\r?\n/).filter(line =>
    line.trim() !== '' && !/^\d+$/.test(line.trim())
  );

  let instructionList = document.createElement('ol');
  steps.forEach(step => {
    let li = document.createElement('li');
    li.textContent = step.trim().replace(/^\d+[\.\)]?\s*/, '');
    instructionList.appendChild(li);
  });
  instructionOverlay.appendChild(instructionList);

  // === Add to DOM ===
  infoContainer.innerHTML = '';
  infoContainer.appendChild(ingredientOverlay);
  infoContainer.appendChild(instructionOverlay);

  showIngredientsOverlay();

  // Favorite icon state
  let faves = JSON.parse(localStorage.getItem('favourites')) || [];
  if (faves.includes(mealId)) {
    heartIcon.classList.remove('fa-regular');
    heartIcon.classList.add('fa-solid');
    heartIcon.style.color = '#D94A38';
  }
}
  
// === Button interactions ===
ingredientsButton.addEventListener('click', showIngredientsOverlay);
instructionsButton.addEventListener('click', showInstructionsOverlay);
likeButton.addEventListener('click', toggleFavourites);

function showIngredientsOverlay() {
  instructionOverlay.style.display = 'none';
  ingredientOverlay.style.display = 'block';
  ingredientsButton.classList.add('active');
  instructionsButton.classList.remove('active');
}

function showInstructionsOverlay() {
  ingredientOverlay.style.display = 'none';
  instructionOverlay.style.display = 'block';
  instructionsButton.classList.add('active');
  ingredientsButton.classList.remove('active');
}

function toggleFavourites() {
  let faves = JSON.parse(localStorage.getItem('favourites')) || [];
  const index = faves.indexOf(mealId);

  if (index > -1) {
    faves.splice(index, 1);
    heartIcon.classList.remove('fa-solid');
    heartIcon.classList.add('fa-regular');
    heartIcon.style.color = '';
  } else {
    faves.push(mealId);
    heartIcon.classList.remove('fa-regular');
    heartIcon.classList.add('fa-solid');
    heartIcon.style.color = '#D94A38';
  }

  localStorage.setItem('favourites', JSON.stringify(faves));
}

// === Init ===
loadRecipe();
  