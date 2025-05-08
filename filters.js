import { createCard } from './shared.js';

let randomRecipes = document.getElementById('random-recipes');
let filtersButton = document.getElementById('filters-button');
let filtersPopup = document.getElementById('filters-popup');
let clearFiltersButton = document.getElementById('clear-filters');

// GROUPEVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  // Toggle filter popup
  filtersButton?.addEventListener('click', () => {
    filtersPopup?.classList.toggle('hidden');
    filtersPopup?.classList.toggle('visible');
  });

  // Button filters (category)
  document.getElementById('chicken-button')?.addEventListener('click', () => fetchAndRenderCategory('Chicken'));
  document.getElementById('vegan-button')?.addEventListener('click', () => fetchAndRenderCategory('Vegetarian'));
  document.getElementById('dessert-button')?.addEventListener('click', () => fetchAndRenderCategory('Dessert'));

  // Button filters (region)
  document.getElementById('chinese-button')?.addEventListener('click', () => fetchAndRenderRegion('Chinese'));
  document.getElementById('mexican-button')?.addEventListener('click', () => fetchAndRenderRegion('Mexican'));
  document.getElementById('italian-button')?.addEventListener('click', () => fetchAndRenderRegion('Italian'));

  // ✅ Live filtering on checkbox change
  document.querySelectorAll('.filters_popup input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', applyLiveFilters);
  });

  // Clear filters
  clearFiltersButton?.addEventListener('click', () => {
    document.querySelectorAll('.filters_popup input[type="checkbox"]').forEach(cb => cb.checked = false);
    filtersPopup?.classList.add('hidden');
    filtersPopup?.classList.remove('visible');
    location.reload(); // reload to show original state
  });

  // Handle checklist toggles
  document.querySelectorAll('.filter_label').forEach(label => {
    const container = label.nextElementSibling;
    const icon = label.querySelector('i');
    if (container) {
      container.classList.add('hidden');
      label.addEventListener('click', () => {
        container.classList.toggle('hidden');
        icon?.classList.toggle('fa-chevron-right');
        icon?.classList.toggle('fa-chevron-down');
      });
    }
  });
});

async function applyLiveFilters() {
  const checkboxes = document.querySelectorAll('.filters_popup input[type="checkbox"]:checked');
  const selected = Array.from(checkboxes).map(cb => cb.value);

  if (selected.length === 0) {
    randomRecipes.innerHTML = `<p>Please select at least one filter.</p>`;
    return;
  }

  // Get all meals
  const allMeals = [];
  const letters = 'abcdefghijklmnopqrstuvwxyz';

  for (let letter of letters) {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`);
    const data = await res.json();
    if (data.meals) allMeals.push(...data.meals);
  }

  // Match by category OR region
  const filteredMeals = allMeals.filter(meal =>
    selected.includes(meal.strCategory) || selected.includes(meal.strArea)
  );

  // Clear and render results
  randomRecipes.innerHTML = '';
  if (filteredMeals.length > 0) {
    filteredMeals.forEach(meal => {
      const card = createCard(meal);
      randomRecipes.appendChild(card);
    });
  } else {
    randomRecipes.innerHTML = `<p>No recipes found for selected filters.</p>`;
  }
}

// === Fetch by Category
async function fetchAndRenderCategory(category) {
  let res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
  let data = await res.json();
  randomRecipes.innerHTML = '';

  if (data.meals) {
    for (let meal of data.meals) {
      let detail = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
      let detailData = await detail.json();
      randomRecipes.appendChild(createCard(detailData.meals[0]));
    }
  }
}

// === Fetch by Region
// As there is no free API to pull by region, we will loop through all letters to fetch every meal then filter them
async function fetchAndRenderRegion(area) {
  let allMeals = [];
  let letters = 'abcdefghijklmnopqrstuvwxyz';

  for (let letter of letters) {
    let res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`);
    let data = await res.json();
    if (data.meals) {
      allMeals.push(...data.meals);
    }
  }

  const regionMeals = allMeals.filter(meal => meal.strArea === area);

  randomRecipes.innerHTML = '';

  if (regionMeals.length > 0) {
    regionMeals.forEach(meal => {
      randomRecipes.appendChild(createCard(meal));
    });
  } else {
    randomRecipes.innerHTML = `<p>No recipes found for ${area}.</p>`;
  }
}

