//load the uh uh uh the uh um uh the uh news from the uh uh uh the uh um uh the uh JSON file
const grid = document.getElementById('grid');

let yearToGetJson;
let chunkToGetJson;
let indexes;

const communityContainer = document.getElementById("grid");
const scrollWatcher = document.createElement("div");
scrollWatcher.id = "scrollWatcher";

let itemsCreated = 0;

function loadFile(year, chunk) {
    const path = `./data/community/${year}-${chunk}.json`;
    return caches.open("communityJsonCache").then(cache => {
        return fetch(path, { cache: "no-store" })
            .then(response => {
                return cache.put(path, response.clone()).then(() => response.json());
            });
    });
}
function getCachedOrFetch(year, chunk) {
    const path = `./data/community/${year}-${chunk}.json`;

    return caches.open("communityJsonCache").then(async cache => {
        let response = await cache.match(path);

        if (!response) {
            response = await fetch(path, { cache: "no-store" });
            await cache.put(path, response.clone());
        }

        return response.json();
    });
}

function createCommunityElements(filters, minDate, maxDate){
    getCachedOrFetch(yearToGetJson, chunkToGetJson)
        .then(data => {
            let skippedItems = 0;
            for(var i = itemsCreated; i < itemsCreated + 10; i++){
                if (i >= data.length) {
                    throw new Error("NEXT_YEAR");
                }
                console.log(i);
                console.log(data[i]);
                let item = data[i];
                    if(filterItems(item, filters, minDate, maxDate)){
                        console.log("passed filter");
                        const container = document.getElementById("grid");
                        const communityItem = document.createElement('div');
                        const mainText = document.createElement('p');
                        const summary = document.createElement('h2');
                        const image = document.createElement('img');
                        const imageDiv = document.createElement("div");
                        const link = document.createElement("a");
                        link.href = item.link;
                        link.target = "_blank";
                        link.classList.add("invisible-link");

                        var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
                        var dateArray = item.date.split(" ");

                        image.className = "community-image";
                        image.src = item.image;
                        image.style.borderRadius = "10px"
                        image.style.width = "100%"

                        imageDiv.style.width = "100%";
                        imageDiv.style.height = "70%";
                        imageDiv.style.overflow = "hidden";
                        imageDiv.style.borderRadius = "10px"
                        imageDiv.style.display = "flex";
                        imageDiv.style.alignItems = "center";
                        imageDiv.style.justifyContent = "center";
                        
                        imageDiv.appendChild(image);
                        
                        communityItem.appendChild(imageDiv);

                        summary.textContent = item.summary;
                        summary.className = "summary";
                        communityItem.appendChild(summary);

                        mainText.textContent = item.mainText;
                        mainText.className = "main-text";
                        communityItem.appendChild(mainText);

                        item.tags.forEach(tagText => {
                            const tag = document.createElement('span');
                            tag.className = "tag";
                            tag.textContent = tagText;
                            try{
                                fetch("./data/tags.json")
                                .then(response => response.json())
                                .then(tagData => {
                                    tag.style.backgroundColor = tagData[2].colors[0][tagText] || "#1d293d";
                                })
                            }catch(error){
                                console.error("error loading tag color from json", error);
                                tag.style.backgroundColor = "#1d293d";
                            }
                            communityItem.appendChild(tag);
                        });

                        communityItem.className = "community-item";
                        communityItem.id = `${i}-${yearToGetJson}-${chunkToGetJson}`;
                        
                        link.appendChild(communityItem);
                        container.appendChild(link);

                    }else{
                        skippedItems += 1;
                    }
                };
                itemsCreated += 10;
                console.log(itemsCreated);
                document.getElementById("community").appendChild(scrollWatcher);

                scrollObvserver.unobserve(scrollWatcher);
                scrollObvserver.observe(scrollWatcher);
                
            })
            .catch(error => {
                if (error.message === "NEXT_YEAR") {
                    chunkToGetJson -= 1;

                    loadFile(yearToGetJson, chunkToGetJson)
                        .then(() => {
                            itemsCreated = 0;
                            createCommunityElements(filters, minDate, maxDate);
                        })
                        .catch(err => {
                            if (err.message === "NO_FILE") {
                                yearToGetJson -= 1;
                                chunkToGetJson = Number(indexes[String(yearToGetJson)]) + 1 || 0;

                                if (yearToGetJson < 2015) {
                                    console.log("no more data to load");
                                    return;
                                }

                                itemsCreated = 0;
                                createCommunityElements(filters, minDate, maxDate);
                            } else {
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
                    createCommunityElements(filters, minDate, maxDate);
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

        let setDate = new Date(minDate);
        setDate.setTime(setDate.getTime())

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

        let setDate = new Date(maxDate);
        setDate.setTime(setDate.getTime() + 86400000)

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
    const indexesResponse = await fetch("./data/communityindexes.json");
    indexes = await indexesResponse.json();


    const currentDate = new Date();
    yearToGetJson = currentDate.getFullYear();
    chunkToGetJson = Number(indexes[String(yearToGetJson)]) + 1 || 0;

    await caches.delete('communityJsonCache');

    const cache = await caches.open("communityJsonCache");

    const response = await fetch(`./data/community/${yearToGetJson}-${chunkToGetJson}.json`, { cache: "no-store" });
    await cache.put(`./data/community/${yearToGetJson}-${chunkToGetJson}.json`, response.clone());

    createCommunityElements("null", "null", "null");
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
                createCommunityElements(selectedTags, minDate, maxDate);
            }
        });
    }, {
        rootMargin: '200px'
})

scrollObvserver.observe(scrollWatcher);

//filtering
const filterSubmitButton = document.getElementById("filter-submit-button");
filterSubmitButton.addEventListener("click", () => {
    yearToGetJson = currentDate.getFullYear();
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
    const communityItemsToRemove = document.getElementsByClassName("community-item");
    const dividersToRemove = document.getElementsByClassName("divider");
    const datesToRemove = document.getElementsByClassName("date");
    const minDate = document.getElementById("min-date-input").value;
    const maxDate = document.getElementById("max-date-input").value;
    while(communityItemsToRemove[0]){
        communityItemsToRemove[0].remove();
    }
    while(dividersToRemove[0]){
        dividersToRemove[0].remove();
    }
    while(datesToRemove[0]){
        datesToRemove[0].remove();
    }
    itemsCreated = 0;
    if(selectedTags.length == 0){
        createCommunityElements("null", minDate, maxDate);
    }
    else{
        console.log("creating news elements with filter");
        createCommunityElements(selectedTags, minDate, maxDate);
    }
})
