let backIcon = document.getElementById(`back-arrow`)
let videoFrame = document.getElementById(`video-frame`)
let nameOfRecipe = document.getElementById('name')
let region = document.getElementById('area')
let recipePicDiv = document.getElementById(`recipe-pic`)
let recipePic = document.querySelector('#recipe-pic img')
let ingredientsButton = document.getElementById(`ingredients-button`)
let instructionsButton = document.getElementById(`instructions-button`)
let infoContainer = document.getElementById(`info_container`)
let ingredientOverlay 
let instructionOverlay 
let likeButton = document.getElementById(`like-button`)
let heartIcon = document.getElementById(`like-icon`)

// Navigate back to the home page which is in index.html, when the back icon is clicked
backIcon.addEventListener(`click`, backToHomePage)
function backToHomePage(){
    window.location.href = 'index.html';
}

// Get the meal ID from the URL
let urlParams = new URLSearchParams(window.location.search)
let mealId = urlParams.get('id');

// Fetch meal by ID
async function fetchMealDetails(id) {
    IDendpoint = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    const res = await fetch(IDendpoint);
    const data = await res.json();
    return data.meals[0];
}

// Attach YouTube video
// This function takes the meal object, checks for a YouTube video link, extracts the video ID then embeds it inside the video frame <iframe> on the page.
function attachYoutubeVideo(meal) {
    if (meal.strYoutube && meal.strYoutube.includes('v=')) {
      const videoId = meal.strYoutube.split('v=')[1];
      videoEndpoint = `https://www.youtube.com/embed/${videoId}`
      videoFrame.src = videoEndpoint;
    } else {
      videoFrame.style.display = 'none';
    }
}

// Load and display meal details
async function loadRecipe() {
    const meal = await fetchMealDetails(mealId)

    nameOfRecipe.textContent = meal.strMeal
    region.textContent = meal.strArea
    recipePic.src = meal.strMealThumb

    attachYoutubeVideo(meal)

    // Ingredients Overlay
    ingredientOverlay = document.createElement('div');
    ingredientOverlay.id = 'ingredients-overlay-container';
    ingredientOverlay.classList.add('overlay_container');

    // Fill ingredients list
    let ingredientList = document.createElement('ul');
    ingredientList.innerHTML = ' ';
    for (let i = 1; i <= 20; i++) {
        let ingredient = meal[`strIngredient${i}`];
        let measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            let li = document.createElement('li');
            li.textContent = `${measure} ${ingredient}`;
            ingredientList.appendChild(li);
        }
    }
    ingredientOverlay.appendChild(ingredientList);

    // Instructions Overlay
    instructionOverlay = document.createElement('div');
    instructionOverlay.id = 'instructions-overlay-container';
    instructionOverlay.classList.add('overlay_container');
    instructionOverlay.style.display = 'none';

    // Fill instructions list
    let instructionList = document.createElement('ol');
    instructionList.innerHTML = ' ';
    // Split by new lines instead of periods and filter out blank lines and standalone numbers
    let steps = meal.strInstructions.split(/\r?\n/).filter(line => {
        return line.trim() !== '' && !/^\d+$/.test(line.trim());
    });

    steps.forEach(step => {
        let cleanedStep = step.trim().replace(/^\d+[\.\)]?\s*/, '');
        let li = document.createElement('li');
        li.textContent = cleanedStep;
        instructionList.appendChild(li);
    });

    instructionOverlay.appendChild(instructionList);

    // Append both overlays ONCE
    infoContainer.appendChild(ingredientOverlay);
    infoContainer.appendChild(instructionOverlay);
     
    // Show ingredients by default
    showIngredientsOverlay();
    ingredientsButton.classList.add('active');

}

// Show ingredients overlay when clicked
ingredientsButton.addEventListener(`click`, showIngredientsOverlay)
function showIngredientsOverlay(){
    // infoContainer.append(ingredientOverlay)
    instructionOverlay.style.display = 'none';
    ingredientOverlay.style.display = 'block';

    ingredientsButton.classList.add('active');
    instructionsButton.classList.remove('active');
}

// Show instructions overlay when clicked
instructionsButton.addEventListener(`click`, showInstructionsOverlay)
function showInstructionsOverlay(){
    // infoContainer.append(instructionOverlay)
    ingredientOverlay.style.display = 'none';
    instructionOverlay.style.display = 'block';

    instructionsButton.classList.add('active');
    ingredientsButton.classList.remove('active');
}

// Load everything on page load
loadRecipe();

// Like Recipes, change heart icon to red and add to local storage
likeButton.addEventListener(`click`, () => toggleFavourites(mealId))
function toggleFavourites(id){
    if (!id) return; // skip invalid IDs

    let faves = JSON.parse(localStorage.getItem(`favourites`)) || []

    if (faves.includes(id)) {
        // If already a favorite: remove it
        faves = faves.filter(favId => favId !== id);
        heartIcon.classList.remove('fa-solid');
        heartIcon.classList.add('fa-regular');
        heartIcon.style.color = '';
    } else {
        faves.push(id);
        // If not, favorite it
        heartIcon.classList.remove('fa-regular');
        heartIcon.classList.add('fa-solid');
        heartIcon.style.color = '#D94A38';
    }

    // Save updated favorites list back to localStorage
    localStorage.setItem('favourites', JSON.stringify(faves));
}