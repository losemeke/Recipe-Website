import { createCard, randomRecipes, loadRandomRecipes } from './index.js';

let chickenButton = document.getElementById(`chicken-button`)
let veganButton = document.getElementById(`vegan-button`)
let dessertButton = document.getElementById(`dessert-button`)
let chineseButton = document.getElementById(`chinese-button`)
let mexicanButton = document.getElementById(`mexican-button`)
let italianButton = document.getElementById(`italian-button`)
let filtersButton = document.getElementById(`filters-button`)
let filtersPopup = document.getElementById(`filters-popup`)
let dietCheckboxes = document.querySelectorAll('.diet_checklist input[type="checkbox"]')
let regionCheckboxes = document.querySelectorAll('.region_checklist input[type="checkbox"]')
let clearFiltersButton = document.getElementById('clear-filters')


// Quick Filter Button Events
chickenButton.addEventListener('click', () => handleQuickCategoryFilter('Chicken'));
veganButton.addEventListener('click', () => handleQuickCategoryFilter('Vegetarian'));
dessertButton.addEventListener('click', () => handleQuickCategoryFilter('Dessert'));
chineseButton.addEventListener('click', () => handleQuickRegionFilter('Chinese'));
mexicanButton.addEventListener('click', () => handleQuickRegionFilter('Mexican'));
italianButton.addEventListener('click', () => handleQuickRegionFilter('Italian'));

// Filter by the 3 categories above
async function handleQuickCategoryFilter(category) {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
  const data = await res.json();

  randomRecipes.innerHTML = '';

  if (data.meals) {
    for (let meal of data.meals.slice(0, 12)) {
      const details = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
      const detailsData = await details.json();
      const fullMeal = detailsData.meals[0];
      const card = createCard(fullMeal);
      randomRecipes.appendChild(card);
    }
  } else {
    randomRecipes.innerHTML = `<p>No ${category} recipes found.</p>`;
  }
}

// Filter by the 3 regions above
async function handleQuickRegionFilter(area) {
  randomRecipes.innerHTML = '';

  const meals = [];
  let attempts = 0;

  while (meals.length < 12 && attempts < 50) {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const data = await res.json();
    const meal = data.meals[0];

    if (meal.strArea === area && !meals.some(m => m.idMeal === meal.idMeal)) {
      meals.push(meal);
    }

    attempts++;
  }

  if (meals.length > 0) {
    meals.forEach(meal => {
      const card = createCard(meal);
      randomRecipes.appendChild(card);
    });
  } else {
    randomRecipes.innerHTML = `<p>No ${area} recipes found.</p>`;
  }
}

// Encode filtersButton popup
filtersButton.addEventListener('click', () => {
  filtersPopup.classList.toggle('hidden');
  filtersPopup.classList.toggle('visible');
});


// Filters pop-up checkboxes
async function getAllMeals() {
  let allMeals = [];

  for (let letter of "abcdefghijklmnopqrstuvwxyz") {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`);
    const data = await res.json();
    if (data.meals) {
      allMeals = allMeals.concat(data.meals);
    }
  }

  return allMeals;
}

async function applyFilters() {
  let selectedDiets = [...dietCheckboxes].filter(cb => cb.checked).map(cb => cb.value);
  let selectedRegions = [...regionCheckboxes].filter(cb => cb.checked).map(cb => cb.value);

  randomRecipes.innerHTML = ''; // Clear old cards

  // Case 0: nothing selected
  if (selectedDiets.length === 0 && selectedRegions.length === 0) {
    loadRandomRecipes();
    return;
  }

  let dietMeals = [];
  let regionMeals = [];

  // Diet-based results
  if (selectedDiets.length > 0) {
    let tempMap = new Map();

    for (let diet of selectedDiets) {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${diet}`);
      const data = await res.json();
      if (data.meals) {
        data.meals.forEach(meal => tempMap.set(meal.idMeal, meal));
      }
    }

    // Now fetch full details
    for (let meal of tempMap.values()) {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
      const data = await res.json();
      dietMeals.push(data.meals[0]);
    }
  }

  // Region-based results
  if (selectedRegions.length > 0) {
    const allMeals = await getAllMeals();
    regionMeals = allMeals.filter(meal => selectedRegions.includes(meal.strArea));
  }

  // Final intersection logic
  let finalMeals = [];

  if (selectedDiets.length > 0 && selectedRegions.length > 0) {
    const dietMap = new Map(dietMeals.map(meal => [meal.idMeal, meal]));
    regionMeals.forEach(meal => {
      if (dietMap.has(meal.idMeal)) {
        finalMeals.push(meal);
      }
    });
  } else if (selectedDiets.length > 0) {
    finalMeals = dietMeals;
  } else if (selectedRegions.length > 0) {
    finalMeals = regionMeals;
  }

  if (finalMeals.length > 0) {
    finalMeals.slice(0, 12).forEach(meal => {
      const card = createCard(meal);
      randomRecipes.appendChild(card);
    });
  } else {
    randomRecipes.innerHTML = `<p>No recipes found for the selected filters.</p>`;
  }
}

// === Hook up filter checkboxes to run applyFilters()
document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', applyFilters);
});
 

// DROPDOWN TOGGLE (no IDs, fully automatic)
const allLabels = document.querySelectorAll('.filter_label');

allLabels.forEach(label => {
  const container = label.nextElementSibling;
  const icon = label.querySelector('i');

  if (!container) return;
  container.classList.add('hidden');

  label.addEventListener('click', () => {
    container.classList.toggle('hidden');

    if (icon) {
      icon.classList.toggle('fa-chevron-right');
      icon.classList.toggle('fa-chevron-down');
    }
  });
});

// Clear Filters Button
clearFiltersButton.addEventListener('click', () => {
  // Uncheck all checkboxes
  document.querySelectorAll('.filters_popup input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });

  // Optionally hide popup
  filtersPopup.classList.add('hidden');
  filtersPopup.classList.remove('visible');

  // Reload default recipes
  loadRandomRecipes();
});



  
  