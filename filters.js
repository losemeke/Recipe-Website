import { createCard } from './shared.js';

const randomRecipes = document.getElementById('random-recipes');
const filtersButton = document.getElementById('filters-button');
const filtersPopup = document.getElementById('filters-popup');
const clearFiltersButton = document.getElementById('clear-filters');

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

// === Fetch by Category
async function fetchAndRenderCategory(category) {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
  const data = await res.json();
  randomRecipes.innerHTML = '';

  if (data.meals) {
    for (let meal of data.meals.slice(0, 12)) {
      const detail = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
      const detailData = await detail.json();
      randomRecipes.appendChild(createCard(detailData.meals[0]));
    }
  }
}

// === Fetch by Region
async function fetchAndRenderRegion(area) {
  const allMeals = [];
  const letters = 'abcdefghijklmnopqrstuvwxyz';

  for (let letter of letters) {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`);
    const data = await res.json();
    if (data.meals) {
      allMeals.push(...data.meals);
    }
  }

  const regionMeals = allMeals.filter(meal => meal.strArea === area);

  randomRecipes.innerHTML = '';

  if (regionMeals.length > 0) {
    regionMeals.slice(0, 12).forEach(meal => {
      randomRecipes.appendChild(createCard(meal));
    });
  } else {
    randomRecipes.innerHTML = `<p>No recipes found for ${area}.</p>`;
  }
}

