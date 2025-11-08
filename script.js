//load the uh uh uh the uh um uh the uh news from the uh uh uh the uh um uh the uh JSON file
const currentDate = new Date();
let yearToGetJson = currentDate.getFullYear();
//setting up cache (only for visit so fetching multiple times doesn't actually fetch the file like 100 times but like if the json is updated the user sees it next time because it's not cached between visits :))
caches.open("jsonCache").then((cache) => {
    cache.add(`./data/news/${yearToGetJson}.json`);
})

const newsContainer = document.getElementById("news");
const scrollWatcher = document.createElement("div");

let itemsCreated = 0;
function createNewsElements(filters, minDate, maxDate){
    caches.open("jsonCache").then((cache) => {
        return cache.match(`./data/news/${yearToGetJson}.json`);
    })
        .then(response => response.json())
        .then(data => {
            for(var i = itemsCreated; i < itemsCreated + 5; i++){
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

                        const hr = document.createElement('hr');
                        const date = document.createElement("h3");
                        date.className = "date";
                        date.textContent = `${months[dateArray[0] - 1]} ${dateArray[1]} ${dateArray[2]}`;
                        container.appendChild(date);
                        hr.className = "divider";
                        container.appendChild(hr);

                        if(item.mainPlatform == "tweet"){
                            logo.src = "./assets/twitter.png";
                        }
                        else if(item.mainPlatform == "blog" || item.mainPlatform == "update"){
                            logo.src = "./assets/hytale.jpeg";
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
                            newsItem.appendChild(tag);
                        });

                        newsItem.className = "news-item";
                        newsItem.id = `${i + itemsCreated}-${yearToGetJson}`;
                        container.appendChild(newsItem);
                    }
                };
                itemsCreated += 5;
                console.log(itemsCreated);
                newsContainer.appendChild(scrollWatcher);

                scrollObvserver.unobserve(scrollWatcher);
                scrollObvserver.observe(scrollWatcher);
            })
            .catch(error => {
                if(error.message == "NEXT_YEAR"){
                    console.error(error);
                    console.log(`ran out of items in ${yearToGetJson}.json`);
                    yearToGetJson -= 1;
                    
                    if(yearToGetJson > 2015){
                        caches.open("jsonCache").then((cache) => {
                            cache.add(`./data/news/${yearToGetJson}.json`);
                        })
                        itemsCreated = 0;
                        createNewsElements(filters, minDate, maxDate);
                    }else{
                        console.log("ran out of items to load", yearToGetJson);
                    }
                }
                else{
                    console.error(error);
                }
            })    
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

document.addEventListener("DOMContentLoaded", function() {
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
newsContainer.addEventListener("click", function(event) {
    try {
        const sourcesDiv = document.getElementById("sources-div");
        sourcesDiv.remove();
        console.log("Sources div removed");
    } catch (error) {
        console.log("No sources div to remove");
    }
    console.log("News container clicked");

    const clickedDiv = event.target.closest(".news-item");
    if (!clickedDiv) return;

    const sourcesDiv = document.createElement("div");
    sourcesDiv.id = "sources-div";

    const xButton = document.createElement("span");
    xButton.textContent = "X";
    xButton.className = "xButton";
    sourcesDiv.appendChild(xButton);

    xButton.addEventListener("click", () => {
        sourcesDiv.remove();
        console.log("div removed");
    })

    const sourcesHeader = document.createElement("h3");
    sourcesHeader.className = "sourcesHeader";
    sourcesHeader.textContent = "Sources:";
    sourcesDiv.appendChild(sourcesHeader);

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
    
    caches.open("jsonCache").then((cache) => {
        return cache.match(`./data/news/${yearToGetJson}.json`);
    })
    .then(response => response.json())
    .then(data => {
        try {
        let source = 1;
        data[jsonIndex].sources.forEach(sourceObj => {
            Object.values(sourceObj).forEach(url => {
                const indexIndicator = document.createElement("i");
                indexIndicator.textContent = `[${source}] `;
                const a = document.createElement('a');
                a.href = url;
                a.textContent = url;
                a.target = '_blank';
                sourcesDiv.appendChild(indexIndicator);
                sourcesDiv.appendChild(a);
                sourcesDiv.appendChild(document.createElement('br'));
                source += 1;
            });
        });
        } catch (error){
            console.log("error loading sources", error);
        }
    })

    document.body.appendChild(sourcesDiv);
});


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
})

//delete cache before page unload

window.addEventListener("beforeunload", () => {
caches.delete('my-cache').then((deleted) => {
    if (deleted) {
        console.log('Cache deleted successfully.');
    } else {
        console.log('Cache not found or could not be deleted.');
    }
}).catch((error) => {
    console.error('Error deleting cache:', error);
});
})