//load the uh uh uh the uh um uh the uh news from the uh uh uh the uh um uh the uh JSON file
let yearToGetJson;
let chunkToGetJson;
let indexes;
var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

const currentDate = new Date();

const newsContainer = document.getElementById("news");
const scrollWatcher = document.createElement("div");
scrollWatcher.id = "scrollWatcher";

let itemsCreated = 0;
let lastDay = null;

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

function createNewsElements(filters, minDate, maxDate){
    
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
                    if(filterItems(item, filters, minDate, maxDate)){
                        console.log("passed filter");
                        const container = document.getElementById("news");
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
                            logo.src = "./assets/hytale.jpg";
                            logo.style.borderRadius = "5px";
                        }

                        const logospan = document.createElement('span');
                        logospan.className = "logospan";
                        logo.className = "logo";
                        logospan.appendChild(logo);
                        newsItem.appendChild(logospan);

                        summary.textContent = item.summary;
                        summary.className = "summary";
                        logospan.appendChild(summary);

                        mainText.textContent = item.mainText;
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
                if(readQueryString("goTo")){
                    goTo(readQueryString("goTo").replaceAll("-", " "));
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
                            createNewsElements(filters, minDate, maxDate);
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
                                createNewsElements(filters, minDate, maxDate);
                            } else {
                                yearToGetJson -= 1;
                                chunkToGetJson = Number(indexes[String(yearToGetJson)]) + 1 || 0;
                                createNewsElements(filters, minDate, maxDate);
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
                    createNewsElements(filters, minDate, maxDate);
                }
                
            });
             
}
function filterItems(item, filters, minDate, maxDate){
    let createDiv = true;
    if (minDate != "null") {
        const [m, d, y] = item.date.split(" ");

        let itemDate = new Date();
        itemDate.setMonth(parseInt(m) - 1);
        itemDate.setDate(parseInt(d));
        itemDate.setFullYear(parseInt(y));
        itemDate.setHours(0,0,0,0);



        let setDate = new Date(minDate);
        setDate.setTime(setDate.getTime());
        setDate.setHours(0,0,0,0);

        console.log("item date", itemDate, "set date", setDate);

        if (itemDate.getTime() < setDate.getTime()) {
            return false;
        }
    }
    if (maxDate != "null") {
        const [m, d, y] = item.date.split(" ");

        let itemDate = new Date();
        itemDate.setMonth(parseInt(m) - 1);
        itemDate.setDate(parseInt(d));
        itemDate.setFullYear(parseInt(y));
        itemDate.setHours(0,0,0,0);



        let setDate = new Date(maxDate);
        setDate.setTime(setDate.getTime() + 86400000);
        setDate.setHours(0,0,0,0);

        console.log("item date", itemDate, "set date", setDate);

        if (itemDate.getTime() > setDate.getTime()) {
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

    createNewsElements("null", "null", "null");
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
                createNewsElements(selectedTags, minDate, maxDate);
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
    const linksToRemove = document.getElementsByClassName("sourceLink");
    const indicatorsToRemove = document.getElementsByClassName("sourceIndex");
    const brToRemove = document.getElementsByClassName("sourceBr");

    while(linksToRemove[0]){
        linksToRemove[0].remove();
    }
    while(indicatorsToRemove[0]){
        indicatorsToRemove[0].remove();
    }
    while(brToRemove[0]){
        brToRemove[0].remove();
    }

    

    const sourcesDiv = document.getElementById("sources-div");
    sourcesDiv.style.display = "inherit";

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
    const newsItemsToRemove = document.getElementsByClassName("news-item");
    const dividersToRemove = document.getElementsByClassName("divider");
    const datesToRemove = document.getElementsByClassName("date");
    const minDate = document.getElementById("min-date-input").value;
    const maxDate = document.getElementById("max-date-input").value;
    while(newsItemsToRemove[0]){
        newsItemsToRemove[0].remove();
    }
    while(dividersToRemove[0]){
        dividersToRemove[0].remove();
    }
    while(datesToRemove[0]){
        datesToRemove[0].remove();
    }
    itemsCreated = 0;
    if(selectedTags.length == 0){
        createNewsElements("null", minDate, maxDate);
    }
    else{
        console.log("creating news elements with filter");
        createNewsElements(selectedTags, minDate, maxDate);
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
    const newsItemsToRemove = document.getElementsByClassName("news-item");
    const dividersToRemove = document.getElementsByClassName("divider");
    const datesToRemove = document.getElementsByClassName("date");
    const minDate = document.getElementById("min-date-input").value;
    const maxDate = document.getElementById("max-date-input").value;
    while(newsItemsToRemove[0]){
        newsItemsToRemove[0].remove();
    }
    while(dividersToRemove[0]){
        dividersToRemove[0].remove();
    }
    while(datesToRemove[0]){
        datesToRemove[0].remove();
    }
    itemsCreated = 0;
    createNewsElements("null", minDate, maxDate)
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
    const newsItemsToRemove = document.getElementsByClassName("news-item");
    const dividersToRemove = document.getElementsByClassName("divider");
    const datesToRemove = document.getElementsByClassName("date");
    while(newsItemsToRemove[0]){
        newsItemsToRemove[0].remove();
    }
    while(dividersToRemove[0]){
        dividersToRemove[0].remove();
    }
    while(datesToRemove[0]){
        datesToRemove[0].remove();
    }
    itemsCreated = 0;
    if(selectedTags.length == 0){
        createNewsElements("null", "null", "null");
    }
    else{
        console.log("creating news elements with filter");
        createNewsElements(selectedTags, "null", "null");
    }
    document.getElementById("sources-div").style.display = "none";
    lastClickedDiv = "";
})

function readQueryString(param){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

let goToRecursion = 0;
function goTo(day){
    const dateToSearchFor = `${months[Number(day.split(" ")[0]) - 1]} ${day.split(" ")[1]} ${day.split(" ")[2]}`
    console.log("date to search for", dateToSearchFor);
    const elements = document.querySelectorAll("h3");
    const filteredElements = Array.from(elements).filter(el => el.textContent.trim() == dateToSearchFor);
    console.log(Array.from(elements).map(el => el.textContent));
    if(filteredElements[0]) filteredElements[0].scrollIntoView(true);
    else{
        if(goToRecursion < 100){
            goToRecursion ++;
            createNewsElements("null", "null", "null");
        }
    }
}



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
