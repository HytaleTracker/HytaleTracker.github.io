//loading elements
//load the uh uh uh the uh um uh the uh news from the uh uh uh the uh um uh the uh JSON file
const currentDate = new Date();
let yearToGetJson = currentDate.getFullYear();

const communityContainer = document.getElementById("grid");
const scrollWatcher = document.createElement("div");

let itemsCreated = 0;
function createCommunityElements(filters, minDate, maxDate){
    caches.open("communityJsonCache").then((cache) => {
        return cache.match(`./data/community/${yearToGetJson}.json`);
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
                        const container = document.getElementById("grid");
                        const communityItem = document.createElement('div');
                        const mainText = document.createElement('p');
                        const summary = document.createElement('h2');
                        const image = document.createElement('img');

                        var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
                        var dateArray = item.date.split(" ");

                        image.className = "community-image";
                        communityItem.appendChild(image);

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
                            communityItem.appendChild(tag);
                        });

                        communityItem.className = "community-item";
                        communityItem.id = `${i}-${yearToGetJson}`;
                        container.appendChild(communityItem);
                    }
                };
                itemsCreated += 5;
                console.log(itemsCreated);
                container.appendChild(scrollWatcher);

                scrollObvserver.unobserve(scrollWatcher);
                scrollObvserver.observe(scrollWatcher);
            })
            .catch(error => {
                if(error.message == "NEXT_YEAR"){
                    console.error(error);
                    console.log(`ran out of items in ${yearToGetJson}.json`);
                    yearToGetJson -= 1;
                    
                    if(yearToGetJson > 2015){
                        caches.open("communityJsonCache").then((cache) => {
                            cache.add(`./data/community/${yearToGetJson}.json`);
                        })
                        itemsCreated = 0;
                        createCommunityElements(filters, minDate, maxDate);
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
    caches.open("communityJsonCache")
    .then(cache => cache.add(`./data/community/${yearToGetJson}.json`))
    .then(() => {
        createCommunityElements("null", "null", "null");
    });
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

//sources
communityContainer.addEventListener("click", function(event) {
    try {
        const sourcesDiv = document.getElementById("sources-div");
        sourcesDiv.remove();
        console.log("Sources div removed");
    } catch (error) {
        console.log("No sources div to remove");
    }
    console.log("News container clicked");

    const clickedDiv = event.target.closest(".community-item");
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
    
    caches.open("communityJsonCache").then((cache) => {
        return cache.match(`./data/community/${jsonYear}.json`);
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
            const errorMessage = document.createElement("p");
            errorMessage.textContent = "hmmm, we had issues loading that. . . Either we forgot to put sources (sorry about that) or the was a bug in the code (sorry from the dev), if the problem persists, please let us know";
            sourcesDiv.appendChild(errorMessage);
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

//delete cache before page unload

window.addEventListener("beforeunload", () => {
caches.delete('communityJsonCache').then((deleted) => {
    if (deleted) {
        console.log('Cache deleted successfully.');
    } else {
        console.log('Cache not found or could not be deleted.');
    }
}).catch((error) => {
    console.error('Error deleting cache:', error);
});
})