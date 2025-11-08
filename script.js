//load the uh uh uh the uh um uh the uh news from the uh uh uh the uh um uh the uh JSON file
const newsContainer = document.getElementById("news");
function createNewsElements(filters){
    fetch('./data/news.json')
        .then(response => response.json())
        .then(data => {
            let index = 0;
            data.forEach(item => {
                let createDiv = true;
                if(filters != "null"){
                    filters.forEach(filter => {
                        console.log(filter);
                        if(!item.tags.includes(filter)){
                            createDiv = false;
                            console.log(filter);
                        }
                    })
                } else{
                    createDiv = true;
                }
                    if(createDiv == true){
                        const container = document.getElementById("news");
                        const newsItem = document.createElement('div');
                        const mainText = document.createElement('p');
                        const summary = document.createElement('h2');
                        const logo = document.createElement('img');

                        const hr = document.createElement('hr');
                        const date = document.createElement("h3");
                        date.className = "date";
                        date.textContent = item.date;
                        container.appendChild(date);
                        hr.className = "divider";
                        container.appendChild(hr);

                        if(item.mainPlatform == "tweet"){
                            logo.src = "./assets/twitter.png";
                        }
                        else if(item.mainPlatform == "blog" | item.mainPlatform == "update"){
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
                        newsItem.id = index;
                        container.appendChild(newsItem);
                        index += 1;
                    }
                });
            })
}

document.addEventListener("DOMContentLoaded", function() {
    createNewsElements("null");
});
//desktop sources
if(innerWidth > innerHeight){
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

        const rect = clickedDiv.getBoundingClientRect();
        sourcesDiv.style.position = "absolute";
        sourcesDiv.style.top = `${rect.top + window.scrollY}px`;
        sourcesDiv.style.left = `${rect.right + 10 + window.scrollX}px`;


        jsonIndex = clickedDiv.id;
        fetch("data/news.json")
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
}
//filtering
const filterSubmitButton = document.getElementById("filter-submit-button");
filterSubmitButton.addEventListener("click", () => {
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
    if(selectedTags.length == 0){
        createNewsElements("null");
    }
    else{
        console.log("creating news elements with filter");
        createNewsElements(selectedTags);
    }
})