/* -------------------------------------------------
   🌍 API USED IN THIS PROJECT
   -------------------------------------------------
   API: REST Countries API
   URL: https://restcountries.com/
   
   PURPOSE:
   • Fetch list of all countries
   • Fetch country details by name
   • Fetch data like capital, population, region, borders
   • Used for autocomplete, cards, modal, search filters

   NOTE:
   This project relies heavily on the API to render
   country cards, details, and search suggestions.
------------------------------------------------- */

/* -------------------------
    PAGINATION GLOBALS 
   - Tracks current page, items per page, and paginated list
   - Used by: renderPage(), updatePaginationControls(), prevPage(), nextPage()
------------------------- */
let currentPage = 1;
let itemsPerPage = 9;
let paginatedCountries = [];

/* -------------------------
    GLOBAL VARIABLES 
   - allCountries holds the full set from API (used for autocomplete + reset)
   - Used by: loadAllCountries(), showSuggestions(), resetFilters()
------------------------- */
let allCountries = []; // store all countries for autocomplete

/* -------------------------
   LOADER FUNCTIONS
   - showLoader() and hideLoader() toggle the loader element visibility
   - Loader element: <div id="loader"> in index.html
   - Used by: most fetch calls (to indicate network activity)
------------------------- */
function showLoader() {
    document.getElementById("loader").classList.remove("d-none");
}

function hideLoader() {
    document.getElementById("loader").classList.add("d-none");
}

/* -------------------------
   ON DOM CONTENT LOADED
   - Loads all countries on page load
   - Sets blur handler to hide suggestions (autocomplete)
   - Elements: #searchName, #suggestions
------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    loadAllCountries();

    // Hide suggestions on blur
    document.getElementById("searchName").addEventListener("blur", () => {
        setTimeout(() => {
            document.getElementById("suggestions").style.display = "none";
        }, 200);
    });
});

/* -------------------------
   FUNCTION 1: Load all countries
   - Fetches `https://restcountries.com/v3.1/all`
   - Sorts alphabetically and stores in allCountries
   - Calls applyPagination() to show first page
   - Uses loader to indicate fetch progress
   - Used by: initial load, reset fallback
   - Affected elements: #country-list, #countryCount (via pagination/display)
------------------------- */
function loadAllCountries() {
    showLoader();
    fetch("https://restcountries.com/v3.1/all?fields=name,cca2,capital,region,flags")
        .then(res => res.json())
        .then(data => {
            hideLoader();
            // Sort alphabetically
            allCountries = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
            //applyPagination(allCountries);
        })
        .catch(err => {
            hideLoader();
            console.error(err);
        });
}

/* -------------------------
    APPLY PAGINATION 
   - Prepares paginatedCountries and resets to page 1
   - Ensures alphabetical sort before slicing
   - Used by: loadAllCountries(), search functions, resetFilters()
------------------------- */
function applyPagination(countries) {
    // Sort alphabetically before pagination
    paginatedCountries = countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
    currentPage = 1;
    renderPage();
}

/* -------------------------
    RENDER PAGE 
   - Slices paginatedCountries to current page slice
   - Calls displayCountries() to render cards
   - Calls updatePaginationControls() to refresh controls
   - Elements: #country-list (populated), #pagination (updated)
------------------------- */
function renderPage() {
    if (paginatedCountries.length === 0) {
        showNoCountriesFound();
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const sliced = paginatedCountries.slice(start, end);

    displayCountries(sliced);
    updatePaginationControls();
}


/* -------------------------
    PAGINATION BUTTONS 
   - Renders Prev / Next buttons and page info
   - Buttons call prevPage() and nextPage()
   - Element: #pagination
------------------------- */
function updatePaginationControls() {
    const container = document.getElementById("pagination");

    if (!container || paginatedCountries.length === 0) {
        container.innerHTML = ""; // hide pagination
        return;
    }

    const totalPages = Math.ceil(paginatedCountries.length / itemsPerPage);

    container.innerHTML = `
        <button class="btn btn-sm btn-primary"
            onclick="prevPage()" ${currentPage === 1 ? "disabled" : ""}>
            Prev
        </button>

        <span class="mx-2">Page ${currentPage} of ${totalPages}</span>

        <button class="btn btn-sm btn-primary"
            onclick="nextPage()" ${currentPage === totalPages ? "disabled" : ""}>
            Next
        </button>
    `;
}


function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderPage();
    }
}

function nextPage() {
    const totalPages = Math.ceil(paginatedCountries.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderPage();
    }
}

/* -------------------------
   FUNCTION 2: Display countries
   - Renders country cards into #country-list
   - Each card's onclick calls showCountryDetails(country.cca2)
   - Also updates the country count display (#countryCount)
   - Uses: country.flags.png, country.name.common, country.capital, country.region, country.cca2
------------------------- */
function displayCountries(countries) {

    // Hide search placeholder once results are displayed
const placeholder = document.getElementById("searchPlaceholder");
if (placeholder) placeholder.style.display = "none";

    const container = document.getElementById("country-list");
    container.innerHTML = "";

    // Update count
    updateCountryCount(paginatedCountries.length);

    countries.forEach(country => {
        container.innerHTML += `
            <div class="col-md-4 mt-4">
                <div class="card country-card shadow-sm" onclick="showCountryDetails('${country.cca2}')">
                    <img src="${country.flags.png}" class="flag-img">
                    <div class="p-3">
                        <h5>${country.name.common}</h5>
                        <p><b>Capital:</b> ${country.capital ? country.capital[0] : "N/A"}</p>
                        <p><b>Region:</b> ${country.region}</p>
                        <p><b>Country Code:</b> ${country.cca2}</p>
                    </div>
                </div>
            </div>
        `;
    });
}

/* -------------------------
    GLOBAL FUNCTION: Show country details modal 
   - Fetches by alpha code: /v3.1/alpha/{code}
   - Fills #modalBody with details and shows Bootstrap modal #countryModal
   - Uses loader during network call
   - Elements: #modalBody, #countryModal
------------------------- */
function showCountryDetails(code) {
    showLoader();
    fetch(`https://restcountries.com/v3.1/alpha/${code}`)
        .then(res => res.json())
        .then(data => {
            hideLoader();
            let country = data[0];

            // 📞 Dialing Code (FIX)
            let dialCode = "N/A";
           if (country.idd && country.idd.root) {
           dialCode = country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : "");
           }


            let html = `
                <div class="row">
                    <div class="col-md-6 text-center">
                        <img src="${country.flags.png}" class="img-fluid mb-3" style="max-height:150px;">
                        <h4>${country.name.common}</h4>
                        <p><i>${country.name.official}</i></p>
                    </div>
                    <div class="col-md-6">
                        <p><b>Capital:</b> ${country.capital ? country.capital[0] : "N/A"}</p>
                        <p><b>Region:</b> ${country.region}</p>
                        <p><b>Subregion:</b> ${country.subregion}</p>
                        <p><b>Population:</b> ${country.population.toLocaleString()}</p>
                        <p><b>Area:</b> ${country.area.toLocaleString()} km²</p>
                        <p><b>Timezones:</b> ${country.timezones.join(", ")}</p>
                        <p><b>Dial Code:</b> ${dialCode}</p>
                        <p><b>Google Maps:</b> 
                           <a href="${country.maps.googleMaps}" target="_blank">View Map</a>
                        </p>
                    </div>
                    <div class="col-md-12 text-center mt-3">
                        <img src="${country.coatOfArms.png || country.flags.png}" 
                             class="img-fluid" style="max-height:150px;">
                        <p class="mt-2"><b>Coat of Arms</b></p>
                    </div>
                </div>
            `;
            document.getElementById("modalBody").innerHTML = html;

            let modal = new bootstrap.Modal(document.getElementById("countryModal"));
            modal.show();
        })
        .catch(err => {
            hideLoader();
            console.error(err);
        });
}

/* -------------------------
   FUNCTION 3: Search countries
   - Reads inputs: #searchName, #searchCode, #searchCapital, #searchRegion
   - Delegates to specific search functions (name / code / capital / region)
   - Each search calls REST endpoints then applyPagination() with results
   - If no input, reloads all countries
   - Input elements usage: searchName -> showSuggestions(), searchCode, searchCapital, searchRegion
------------------------- */
function searchCountries() {

     // Hide search placeholder once results are displayed
     const placeholder = document.getElementById("searchPlaceholder");
     if (placeholder) placeholder.style.display = "none";

    let name = document.getElementById("searchName").value.trim();
    let code = document.getElementById("searchCode").value.trim();
    let capital = document.getElementById("searchCapital").value.trim();
    let region = document.getElementById("searchRegion").value;

    function searchByName(name) {
        showLoader();
        fetch(`https://restcountries.com/v3.1/name/${name}`)
            .then(res => res.json())
            .then(data => { 
                hideLoader(); 
                applyPagination(data); 
            })
           .catch(err => {
             hideLoader();
             applyPagination([]); // IMPORTANT
            });

    }

    function searchByCode(code) {
        showLoader();
        fetch(`https://restcountries.com/v3.1/alpha/${code}`)
            .then(res => res.json())
            .then(data => { 
                hideLoader(); 
                applyPagination([data[0]]); 
            })
            .catch(err => { hideLoader(); alert("Invalid country code!"); });
    }

    function searchByCapital(capital) {
        showLoader();
        fetch(`https://restcountries.com/v3.1/capital/${capital}`)
            .then(res => res.json())
            .then(data => { 
                hideLoader(); 
                applyPagination(data); 
            })
            .catch(err => { hideLoader(); alert("No country with that capital!"); });
    }

    function searchByRegion(region) {
        showLoader();
        fetch(`https://restcountries.com/v3.1/region/${region}`)
            .then(res => res.json())
            .then(data => { 
                hideLoader(); 
                applyPagination(data); 
            })
            .catch(err => { hideLoader(); alert("Region not found!"); });
    }

    if (name !== "") return searchByName(name);
    if (code !== "") return searchByCode(code);
    if (capital !== "") return searchByCapital(capital);
    if (region !== "") return searchByRegion(region);

    loadAllCountries();
}

/* -------------------------
   RESET FILTERS
   - Clears search inputs and hides suggestions
   - Resets list to allCountries via applyPagination()
   - Elements used: #searchName, #searchCode, #searchCapital, #searchRegion, #suggestions
------------------------- */
function resetFilters() {
    // Clear all inputs
    document.getElementById("searchName").value = "";
    document.getElementById("searchCode").value = "";
    document.getElementById("searchCapital").value = "";
    document.getElementById("searchRegion").value = "";

    // Hide autocomplete suggestions
    const container = document.getElementById("suggestions");
    container.innerHTML = "";
    container.style.display = "none";

    // Reset to all countries alphabetically
    //applyPagination(allCountries);
    document.getElementById("country-list").innerHTML = "";
    document.getElementById("pagination").innerHTML = "";

    // Show search placeholder again
const placeholder = document.getElementById("searchPlaceholder");
if (placeholder) placeholder.style.display = "block";

document.getElementById("countryCount").innerText = "";


}

/* -------------------------
    AUTOCOMPLETE 
   - showSuggestions(input) filters top 5 matches from allCountries
   - Renders suggestions into #suggestions as buttons
   - Selecting a suggestion fills #searchName and calls applyPagination([c])
   - Elements used: #searchName input, #suggestions container
------------------------- */
function showSuggestions(input) {
    const container = document.getElementById("suggestions");
    container.innerHTML = "";

    if (!input) {
        container.style.display = "none";
       // applyPagination(allCountries);
        return;
    }

    const matches = allCountries
        .filter(c => c.name.common.toLowerCase().includes(input.toLowerCase()))
        .slice(0, 5);

    if (matches.length === 0) {
        container.style.display = "none";
        return;
    }

    container.style.display = "block";

    matches.forEach(c => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "list-group-item list-group-item-action";

        const index = c.name.common.toLowerCase().indexOf(input.toLowerCase());
        const boldPart = `<strong>${c.name.common.substr(index, input.length)}</strong>`;
        const before = c.name.common.substr(0, index);
        const after = c.name.common.substr(index + input.length);

        item.innerHTML = before + boldPart + after;

        item.addEventListener("mousedown", (e) => {
            e.preventDefault();
            document.getElementById("searchName").value = c.name.common;
            container.innerHTML = "";
            container.style.display = "none";
            applyPagination([c]);
        });

        container.appendChild(item);
    });
}

/* -------------------------
    Update Country Count 
   - Updates #countryCount text with current number of results
   - Element: #countryCount in index.html
------------------------- */
function updateCountryCount(count) {
    const countBox = document.getElementById("countryCount");
    countBox.innerText = `(${count} countries found)`;
}



function showNoCountriesFound() {
    const list = document.getElementById("country-list");
    const pagination = document.getElementById("pagination");

    list.innerHTML = `
        <div class="col-12 text-center mt-4">
            <h5 class="text-danger">No countries found</h5>
        </div>
    `;

    pagination.innerHTML = ""; // hide pagination
    updateCountryCount(0);
}


function enterApp() {
    document.getElementById("introVideo").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
}


/* -------------------------
   THEME TOGGLE
   - Toggles light / dark mode
------------------------- */
function toggleTheme() {
    document.body.classList.toggle("dark-theme");

    const icon = document.getElementById("themeIcon");

    if (document.body.classList.contains("dark-theme")) {
        icon.src = "dark.png";   // 🌙 dark 3D icon
    } else {
        icon.src = "light.png";  // ☀️ light 3D icon
    }
}



/* -------------------------
   FEEDBACK LOGIC
------------------------- */

let selectedRating = 0;

function setRating(rating) {
    selectedRating = rating;

    const stars = document.querySelectorAll(".star-rating span");
    stars.forEach((star, index) => {
        star.classList.toggle("active", index < rating);
    });

    document.getElementById("ratingText").innerText =
        `You rated this ${rating} star${rating > 1 ? "s" : ""}`;
}

function submitFeedback() {
    const feedback = document.getElementById("feedbackText").value.trim();
    const successMsg = document.getElementById("feedbackSuccessMsg");

    // Validation
    if (selectedRating === 0) {
        alert("Please select a star rating.");
        return;
    }

    if (feedback === "") {
        alert("Please enter your feedback or query.");
        return;
    }

    // 🔴 ADDITION: SEND FEEDBACK TO BACKEND (ONLY NEW LOGIC)
    fetch("http://localhost:3000/api/feedback", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            rating: selectedRating,
            comment: feedback
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Saved to DB:", data);
    })
    .catch(err => {
        console.error("Error saving feedback:", err);
    });

    // (Optional) Log
    console.log("Rating:", selectedRating);
    console.log("Feedback:", feedback);

    // ✅ SHOW MESSAGE INSIDE FORM
    successMsg.classList.remove("d-none");

    // ✅ AUTO CLOSE MODAL AFTER 2 SECONDS
    setTimeout(() => {
        // Reset data
        selectedRating = 0;
        document.getElementById("feedbackText").value = "";
        document.getElementById("ratingText").innerText = "";
        document.querySelectorAll(".star-rating span")
            .forEach(s => s.classList.remove("active"));

        successMsg.classList.add("d-none");

        // Close modal
        const modal = bootstrap.Modal.getInstance(
            document.getElementById("feedbackModal")
        );
        modal.hide();
    }, 2000);
}
