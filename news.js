//load the uh uh uh the uh um uh the uh news from the uh uh uh the uh um uh the uh JSON file
let yearToGetJson;
let chunkToGetJson;
let indexes;
var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

const currentDate = new Date();

const newsContainer = document.getElementById("items");
const scrollWatcher = document.createElement("div");
scrollWatcher.id = "scrollWatcher";

let itemsCreated = 0;
let lastDay = null;
let searchQuery = null;

function loadFile(year, chunk) {
    const path = `./data/news/${year}-${chunk}.json`;
    return caches.open("jsonCache").then(cache => {
        return fetch(path, { cache: "no-store" })
            .then(response => {
                return cache.put(path, response.clone()).then(() => response.json());
            });
    });
}
function getCachedOrFetch(year, chunk) {
    const path = `./data/news/${year}-${chunk}.json`;

    return caches.open("jsonCache").then(async cache => {
        let response = await cache.match(path);

        if (!response) {
            response = await fetch(path, { cache: "no-store" });
            await cache.put(path, response.clone());
        }

        return response.json();
    });
}

function createNewsElements(filters, minDate, maxDate, searchQuery){
    getCachedOrFetch(yearToGetJson, chunkToGetJson)
        .then(data => {
            let skippedItems = 0;
            for(let i = itemsCreated; i < itemsCreated + 5; i++){
                if (i >= data.length) {
                    throw new Error("NEXT_YEAR");
                }
                console.log(i);
                console.log(data[i]);
                let item = data[i];
                    if(filterItems(item, filters, minDate, maxDate, searchQuery)){
                        console.log("passed filter");
                        const container = document.getElementById("items");
                        const newsItem = document.createElement('div');
                        const mainText = document.createElement('p');
                        const summary = document.createElement('h2');
                        const logo = document.createElement('img');

                        var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
                        var dateArray = item.date.split(" ");

                        if(item.date != lastDay){
                            const hr = document.createElement('hr');
                            const date = document.createElement("h3");
                            date.className = "date";
                            date.textContent = `${months[dateArray[0] - 1]} ${dateArray[1]} ${dateArray[2]}`;
                            container.appendChild(date);
                            hr.className = "divider";
                            container.appendChild(hr);
                            lastDay = item.date;
                        }

                        if(item.mainPlatform == "tweet"){
                            logo.src = "./assets/twitter.png";
                        }
                        else if(item.mainPlatform == "blog" || item.mainPlatform == "update"){
                            logo.src = "./assets/Hytale.jpg";
                            logo.style.borderRadius = "5px";
                        }
                        else if(item.mainPlatform == "Reddit"){
                            logo.src = "./assets/RedditLogo.png";
                        }
                        else if(item.mainPlatform == "Discord"){
                            logo.src = "./assets/DiscordLogo.png";
                        }
                        else if(item.mainPlatform == "Youtube"){
                            logo.src = "./assets/YoutubeLogo.png";
                        }

                        const logospan = document.createElement('span');
                        logospan.className = "logospan";
                        logo.className = "logo";
                        logospan.appendChild(logo);
                        newsItem.appendChild(logospan);

                        summary.textContent = item.summary;
                        summary.className = "summary";
                        logospan.appendChild(summary);

                        mainText.innerHTML = item.mainText;
                        mainText.className = "main-text";
                        newsItem.appendChild(mainText);

                        item.tags.forEach(tagText => {
                            const tag = document.createElement('span');
                            tag.className = "tag";
                            tag.textContent = tagText;
                            try{
                                tag.style.backgroundColor = tagsJson[2].colors[0][tagText][0] || "#1d293d";
                                tag.style.color = tagsJson[2].colors[0][tagText][1] || "#b5bac5";
                            }catch(error){
                                console.error("error loading tag color from json", error);
                                tag.style.backgroundColor = "#1d293d";
                            }
                            newsItem.appendChild(tag);
                        });

                        newsItem.className = "news-item";
                        newsItem.id = `${i}-${yearToGetJson}-${chunkToGetJson}`;
                        container.appendChild(newsItem);

                        newsItem.addEventListener("mouseenter", () => {
                            createSources();
                        });
                        newsItem.addEventListener("click", () => {
                            createSources();
                        });
                    }else{
                        skippedItems += 1;
                    }
                };

                itemsCreated += 5;
                if(goToState != true){
                    if(readQueryString("goTo")){
                        goTo(readQueryString("goTo").replaceAll("-", " "));
                    }
                }

                console.log(itemsCreated);
                newsContainer.appendChild(scrollWatcher);

                scrollObvserver.unobserve(scrollWatcher);
                scrollObvserver.observe(scrollWatcher);
                
            })
            
             .catch(error => {
                if (error.message === "NEXT_YEAR") {
                    chunkToGetJson -= 1;

                    loadFile(yearToGetJson, chunkToGetJson)
                        .then(() => {
                            itemsCreated = 0;
                            createNewsElements(filters, minDate, maxDate, searchQuery);
                        })
                        .catch(err => {
                            if (err.message === "NO_FILE") {
                                yearToGetJson -= 1;
                                chunkToGetJson = Number(indexes[String(yearToGetJson)]) || 0;

                                if (yearToGetJson < 2015) {
                                    console.log("no more data to load");
                                    return;
                                }

                                itemsCreated = 0;
                                createNewsElements(filters, minDate, maxDate, searchQuery);
                            } else {
                                yearToGetJson -= 1;
                                chunkToGetJson = Number(indexes[String(yearToGetJson)]) + 1 || 0;
                                createNewsElements(filters, minDate, maxDate, searchQuery);
                                console.error(err);
                            }
                        });

                }
                else {
                    console.error(error, yearToGetJson, chunkToGetJson);

                    chunkToGetJson -= 1;

                    if(chunkToGetJson < 0){
                        yearToGetJson -= 1;
                        chunkToGetJson = Number(indexes[String(yearToGetJson)]) + 1 || 0;
                    }

                    if (yearToGetJson < 2015) {
                        console.log("no more data to load");
                        return;
                    }

                    itemsCreated = 0;
                    createNewsElements(filters, minDate, maxDate, searchQuery);
                }
                
            });
             
}
function filterItems(item, filters, minDate, maxDate, searchQuery){
    let createDiv = true;
    const [m, d, y] = item.date.split(" ").map(Number);
    const itemDate = new Date(y, m - 1, d, 0, 0, 0, 0);

    if (minDate && minDate !== "null" && minDate !== "") {
        const [Y, M, D] = minDate.split("-").map(Number);
        const minLocal = new Date(Y, M - 1, D, 0, 0, 0, 0);

        if (itemDate < minLocal){
            return false;
        }
    }

    if (maxDate && maxDate !== "null" && maxDate !== "") {
        const [Y, M, D] = maxDate.split("-").map(Number);
        const maxLocal = new Date(Y, M - 1, D, 23, 59, 59, 999);

        if (itemDate > maxLocal){
            return false;
        }
    }

    if(filters != "null"){
        filters.forEach(filter => {
            console.log(filter);
            if(!item.tags.includes(filter)){
                createDiv = false;
                console.log(filter);
            }
        })
    }

    if(searchQuery != null){
        if(!item.mainText.toLowerCase().includes(searchQuery.toLowerCase()) && !item.summary.toLowerCase().includes(searchQuery.toLowerCase())){
            createDiv = false;
        }
    }
    return createDiv;
}

window.addEventListener("load", async function() {
    const indexesResponse = await fetch("./data/indexes.json", { cache : "no-store" });
    indexes = await indexesResponse.json();


    yearToGetJson = currentDate.getFullYear();
    chunkToGetJson = Number(indexes[String(yearToGetJson)]) + 1 || 0;

    await caches.delete('jsonCache');

    const cache = await caches.open("jsonCache");

    const response = await fetch(`./data/news/${yearToGetJson}-${chunkToGetJson}.json`, { cache: "no-store" });
    await cache.put(`./data/news/${yearToGetJson}-${chunkToGetJson}.json`, response.clone());

    const tagsJsonResponse = await this.fetch("./data/tags.json");
    tagsJson = await tagsJsonResponse.json();

    createNewsElements("null", "null", "null", searchQuery);
});


//load more when scrollWatcher is in view
const scrollObvserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
            if (entry.isIntersecting) {
                const form = document.getElementById("filterForm");
                const children = form.children;
                let selectedTags = [];
                console.log(children);
                for(let child of children){
                    if(child.nodeName == "INPUT"){
                        console.log(child.id);
                        if(child.checked){
                            selectedTags.push(child.id);
                        }
                    }
                }
                const minDate = document.getElementById("min-date-input").value;
                const maxDate = document.getElementById("max-date-input").value;
                createNewsElements(selectedTags, minDate, maxDate, searchQuery);
            }
        });
    }, {
        rootMargin: '200px'
})

scrollObvserver.observe(scrollWatcher);

//sources

let lastClickedDiv;
function createSources(){
    
    const clickedDiv = event.target.closest(".news-item");
    
    if (!clickedDiv){
        lastClickedDiv = "";
        return;
    }

    if(lastClickedDiv != clickedDiv){
    lastClickedDiv = clickedDiv;

    const sourcesDiv = document.getElementById("sources-div");
    sourcesDiv.style.display = "inherit";
    sourcesDiv.style.opacity = "0";
    sourcesDiv.classList.remove("SourceAnimate");
    sourcesDiv.innerHTML = "<span id='xButton' class='xButton'>X</span><h3 id='sources-header' class='sourcesHeader'>Sources: </h3>";
    

    const xButton = document.getElementById("xButton");

    xButton.addEventListener("click", () => {
        sourcesDiv.style.display = "none";
        lastClickedDiv = "";
    })


    //desktop
    if(innerHeight < innerWidth){
        const rect = clickedDiv.getBoundingClientRect();
        sourcesDiv.style.position = "absolute";
        sourcesDiv.style.top = `${rect.top + window.scrollY}px`;
        sourcesDiv.style.left = `${rect.right + 10 + window.scrollX}px`;
    }else{
        const rect = clickedDiv.getBoundingClientRect();
        sourcesDiv.style.position = "absolute";
        sourcesDiv.style.top = `${rect.top + window.scrollY + clickedDiv.offsetHeight}px`;
        sourcesDiv.style.left = `${(innerWidth - clickedDiv.offsetWidth) / 2}px`
    }


    const jsonInfo = clickedDiv.id;
    const jsonIndex = jsonInfo.split("-")[0];
    const jsonYear= jsonInfo.split("-")[1];
    const jsonCunck = jsonInfo.split("-")[2];
    
    getCachedOrFetch(jsonYear, jsonCunck)
    .then(data => {
        try {
        let source = 1;
        data[jsonIndex].sources.forEach(sourceObj => {
            Object.values(sourceObj).forEach(url => {
                const indexIndicator = document.createElement("i");
                indexIndicator.textContent = `[${source}] `;
                const a = document.createElement('a');
                a.href = url[1];
                a.textContent = url[0];
                a.target = '_blank';
                a.classList.add("sourceLink");
                indexIndicator.classList.add("sourceIndex");
                sourcesDiv.appendChild(indexIndicator);
                sourcesDiv.appendChild(a);
                const br = document.createElement('br');
                br.classList.add("sourceBr");
                sourcesDiv.appendChild(br);
                source += 1;
            });
        });
        } catch (error){
            console.log("error loading sources", error);
        }
    })
    }
    document.getElementById("sources-div").classList.add("SourceAnimate");

}


//filtering

const filterSubmitButton = document.getElementById("filter-submit-button");
filterSubmitButton.addEventListener("click", () => {
    filter();
})
const dateSubmitButton = document.getElementById("date-submit-button");
dateSubmitButton.addEventListener("click", () => {
    filter();
})
function filter(){
    yearToGetJson = currentDate.getFullYear();
    chunkToGetJson = Number(indexes[String(yearToGetJson)]) + 1 || 0;
    lastDay = '';
    scrollObvserver.unobserve(scrollWatcher);
    const form = document.getElementById("filterForm");
    const children = form.children;
    let selectedTags = [];
    console.log(children);
    for(let child of children){
        if(child.nodeName == "INPUT"){
            console.log(child.id);
            if(child.checked){
                selectedTags.push(child.id);
            }
        }
    }
    console.log(selectedTags);
    newsContainer.innerHTML = "";
    const minDate = document.getElementById("min-date-input").value;
    const maxDate = document.getElementById("max-date-input").value;
    itemsCreated = 0;
    if(selectedTags.length == 0){
        createNewsElements("null", minDate, maxDate, searchQuery);
    }
    else{
        console.log("creating news elements with filter");
        createNewsElements(selectedTags, minDate, maxDate, searchQuery);
    }
    document.getElementById("sources-div").style.display = "none";
    lastClickedDiv = "";
}

document.getElementById("clear-filters").addEventListener("click", () => {
    yearToGetJson = currentDate.getFullYear();
    chunkToGetJson = Number(indexes[String(yearToGetJson)]) + 1 || 0;
    lastDay = '';
    scrollObvserver.unobserve(scrollWatcher);
    const form = document.getElementById("filterForm");
    const children = form.children;
    let selectedTags = [];
    console.log(children);
    for(let child of children){
        if(child.nodeName == "INPUT"){
            console.log(child.id);
            if(child.checked){
                selectedTags.push(child.id);
            }
        }
    }
    console.log(selectedTags);
    newsContainer.innerHTML = "";
    const minDate = document.getElementById("min-date-input").value;
    const maxDate = document.getElementById("max-date-input").value;
    itemsCreated = 0;
    createNewsElements("null", minDate, maxDate, searchQuery)
    document.getElementById("sources-div").style.display = "none";
    lastClickedDiv = "";
})
document.getElementById("clear-dates").addEventListener("click", () => {
    yearToGetJson = currentDate.getFullYear();
    chunkToGetJson = Number(indexes[String(yearToGetJson)]) + 1 || 0;
    lastDay = '';
    scrollObvserver.unobserve(scrollWatcher);
    yearToGetJson = currentDate.getFullYear();
    chunkToGetJson = Number(indexes[String(yearToGetJson)]) + 1 || 0;
    lastDay = '';
    const form = document.getElementById("filterForm");
    const children = form.children;
    let selectedTags = [];
    console.log(children);
    for(let child of children){
        if(child.nodeName == "INPUT"){
            console.log(child.id);
            if(child.checked){
                selectedTags.push(child.id);
            }
        }
    }
    console.log(selectedTags);
    newsContainer.innerHTML = "";
    itemsCreated = 0;
    if(selectedTags.length == 0){
        createNewsElements("null", "null", "null", searchQuery);
    }
    else{
        console.log("creating news elements with filter");
        createNewsElements(selectedTags, "null", "null", searchQuery);
    }
    document.getElementById("sources-div").style.display = "none";
    lastClickedDiv = "";
})

function readQueryString(param){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

let goToState = false;
function goTo(day){
    const dateToSearchFor = `${months[Number(day.split(" ")[0]) - 1]} ${day.split(" ")[1]} ${day.split(" ")[2]}`
    const maxYear = day.split(" ")[2];
    console.log("date to search for", dateToSearchFor);
    const elements = document.querySelectorAll("h3");
    const filteredElements = Array.from(elements).filter(el => el.textContent.trim() == dateToSearchFor);
    console.log(Array.from(elements).map(el => el.textContent));
    if(filteredElements[0]){
        filteredElements[0].scrollIntoView(true);
        goToState = true;
    }
    else{
        if(yearToGetJson >= maxYear && yearToGetJson > 2024){
            console.log("looking for item to go to in", yearToGetJson);
            createNewsElements("null", "null", "null", searchQuery);
        }
    }
}

const searchInput = document.getElementById("search");
searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    if(searchQuery == ""){
        searchQuery = null;
    }
    console.log(searchQuery);
    filter();

})

let easterEggKeysPressed = [];
document.addEventListener('keydown', function(event) {
    easterEggKeysPressed.push(event.key);
    const l = easterEggKeysPressed.length;
    console.log(easterEggKeysPressed);

    if(easterEggKeysPressed[l - 1] == "8" && easterEggKeysPressed[l - 2] == "2" && easterEggKeysPressed[l - 3] == "/" && easterEggKeysPressed[l - 4] == "8"){
        window.alert("8/28 forever!")
    }
    if(l > 4){
        easterEggKeysPressed = [easterEggKeysPressed[l - 4], easterEggKeysPressed[l - 3], easterEggKeysPressed[l - 2], easterEggKeysPressed[l - 1]];
    }
});
