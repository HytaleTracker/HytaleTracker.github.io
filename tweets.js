let chunkToGetJson = 0;
let tagsJson;
let indexData;
scrollWatcher = document.getElementById("scroll-watcher");
let globalTagFilters = "null";
let globalMaxDate = "null";
let globalMinDate = "null";
let searchQuery = null;

function loadFile() {
    const path = `./data/tweets/data/devs-post-revival${chunkToGetJson}.json`;
    return caches.open("tweetsCache").then(cache => {
        return fetch(path, { cache: "no-store" })
            .then(response => {
                return cache.put(path, response.clone()).then(() => response.json());
            });
    });
}
function getCachedOrFetch() {
    const path = `./data/tweets/data/devs-post-revival${chunkToGetJson}.json`;

    return caches.open("tweetsCache").then(async cache => {
        let response = await cache.match(path);

        if (!response) {
            response = await fetch(path, { cache: "no-store" });
            await cache.put(path, response.clone());
        }

        return response.json();
    });
}



window.addEventListener("load", async function() {
    
    const indexRes = await fetch("./data/tweets/data/tweetIndexes.json", { cache: "no-store" });
    indexData = await indexRes.json();
    chunkToGetJson = Number(indexData) - 1;

    await caches.delete("tweetsCache");

    const tagsJsonResponse = await fetch("./data/tags.json");
    tagsJson = await tagsJsonResponse.json();

    const tweetCountRes = await fetch("./data/tweets/data/tweetCount.json", { cache: "no-store" });
    const tweetCount = await tweetCountRes.json();
    document.getElementById("tweetCount").textContent = `Post Revival Tweet Count: ${tweetCount}`;

    const updatedRes = await fetch("./data/tweets/data/lastUpdated.json", { cache: "no-store" });
    const LastUpdated = await updatedRes.json();
    document.getElementById("updated").textContent = `Last Updated: ${Math.floor((Date.now() - new Date(LastUpdated)) / 3600000)} Hours Ago`;


    createTweetElements("null", "null", "null", searchQuery);
})

function createTweetElements(filters, minDate, maxDate, searchQuery){
    getCachedOrFetch()
    .then(data => {
        console.log(data);
        data.forEach(element => {
            if(filterItems(element, filters, minDate, maxDate, searchQuery)){
                const tweetsContainer = document.getElementById("tweets");
                const tweetItem = document.createElement("div");
                const link = document.createElement("a");
                const summary = document.createElement("h3");
                const mainText = document.createElement("p");
                const date = document.createElement("h6");

                mainText.textContent = element.mainText;
                summary.textContent = element.summary;
                date.textContent = element.date.replaceAll(" ", "/");
                date.classList.add("tweetDate");

                link.classList.add("invisible-link");
                link.href = element.sources[0][1][1];
                link.target = "_blank"

                

                tweetItem.appendChild(summary);
                tweetItem.appendChild(mainText);
                tweetItem.appendChild(date);
                
                element.tags.forEach(tagName => {
                    const tag = document.createElement("span");
                    tag.textContent = tagName;
                    tag.classList.add("tag");
                    tweetItem.appendChild(tag);
                    try{
                        tag.style.backgroundColor = tagsJson[2].colors[0][tagName][0] || "#1d293d";
                        tag.style.color = tagsJson[2].colors[0][tagName][1] || "#b5bac5";
                    }catch(error){
                        console.error("error loading tag color from json", error);
                        tag.style.backgroundColor = "#1d293d";
                    }
                })

                tweetItem.classList.add("tweetItem");
                link.appendChild(tweetItem)
                tweetsContainer.appendChild(link);
            }
        });
        scrollObvserver.unobserve(scrollWatcher);
        scrollObvserver.observe(scrollWatcher);
    })
}

const scrollObvserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
            if (entry.isIntersecting) {
                
                chunkToGetJson -= 1;
                createTweetElements(globalTagFilters, globalMinDate, globalMaxDate, searchQuery);
            }
        });
    }, {
        rootMargin: '200px'
})

scrollObvserver.observe(scrollWatcher);


//filtering


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


//why do this no work?
const filterSubmitButton = document.getElementById("filter-submit-button");
filterSubmitButton.addEventListener("click", () => {
    filter();
})
const dateSubmitButton = document.getElementById("date-submit-button");
dateSubmitButton.addEventListener("click", () => {
    filter();
})
function filter(){
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA PLEASE WORK AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"); //the best console.log call ever 
    chunkToGetJson = Number(indexData) - 1;
    scrollObvserver.unobserve(scrollWatcher); //this line
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
    document.getElementById("tweets").innerHTML = "";
    const minDate = document.getElementById("min-date-input").value;
    const maxDate = document.getElementById("max-date-input").value;
    globalTagFilters = selectedTags;
    globalMaxDate = maxDate;
    globalMinDate = minDate;
    if(selectedTags.length == 0){
        createTweetElements("null", minDate, maxDate, searchQuery);
    }
    else{
        console.log("creating tweet elements with filter");
        createTweetElements(selectedTags, minDate, maxDate, searchQuery);
    }
}

document.getElementById("clear-filters").addEventListener("click", () => {
    chunkToGetJson = Number(indexData) - 1;
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
    document.getElementById("tweets").innerHTML = "";
    const minDate = document.getElementById("min-date-input").value;
    const maxDate = document.getElementById("max-date-input").value;
    globalTagFilters = selectedTags;
    globalMaxDate = maxDate;
    globalMinDate = minDate;
    createTweetElements("null", minDate, maxDate, searchQuery)
})
document.getElementById("clear-dates").addEventListener("click", () => {
    chunkToGetJson = Number(indexData) - 1;
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
    document.getElementById("tweets").innerHTML = "";
    globalTagFilters = selectedTags;
    globalMaxDate = "null";
    globalMinDate = "null";
    if(selectedTags.length == 0){
        createTweetElements("null", "null", "null", searchQuery);
    }
    else{
        console.log("creating news elements with filter");
        createTweetElements(selectedTags, "null", "null", searchQuery);
    }
})

const searchInput = document.getElementById("search");
searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    if(searchQuery == ""){
        searchQuery = null;
    }
    console.log(searchQuery);
    filter();

})