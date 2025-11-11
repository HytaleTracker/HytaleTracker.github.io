const form = document.getElementById("filterForm");
const currentURL = window.location.pathname;
document.addEventListener("DOMContentLoaded", () => {
    const h3 = document.createElement("h3");
    h3.textContent = "Tags: ";
    form.appendChild(h3);
    fetch("/data/tags.json")
    .then(response => response.json())
    .then(data => {
        console.log(currentURL);
        if(currentURL == "/community.html" || currentURL == "/community"){
            data[1].community.forEach(tag => {
                const input = document.createElement("input");
                input.type = "checkbox";
                input.id = tag;
                input.name = tag;
                const label = document.createElement("label");
                label.for = tag;
                label.textContent = tag;
                try{
                    fetch("./data/tags.json")
                    .then(response => response.json())
                    .then(tagData => {
                        label.style.backgroundColor = tagData[2].colors[0][tag];
                    })
                }catch(error){
                    console.error("error loading tag color from json", error);
                }
                form.appendChild(input);
                form.appendChild(label);
                form.appendChild(document.createElement("br"));
                clickingLabelClicksBox(input, label);
            });
        }
        if(currentURL == "/" || currentURL == "/index" || currentURL == "/index.html"){
            data[0].news.forEach(tag => {
                const input = document.createElement("input");
                input.type = "checkbox";
                input.id = tag;
                input.name = tag;
                const label = document.createElement("label");
                label.for = tag;
                label.textContent = tag;
                try{
                    fetch("./data/tags.json")
                    .then(response => response.json())
                    .then(tagData => {
                        label.style.backgroundColor = tagData[2].colors[0][tag];
                    })
                }catch(error){
                    console.error("error loading tag color from json", error);
                }
                form.appendChild(input);
                form.appendChild(label);
                form.appendChild(document.createElement("br"));
                clickingLabelClicksBox(input, label);
            });
        }
    })
})
const filterDropdown = document.getElementById("filterDropdown");
const formDiv = document.getElementById("filters");
const dateDiv = document.getElementById("date-filter");
filterDropdown.addEventListener("click", () => {
    if(formDiv.style.display == "none"){
        formDiv.style.display = "inline-block";
        dateDiv.style.display = "inline-block";
    }
    else{
        formDiv.style.display = "none";
        dateDiv.style.display = "none";
    }
})
filterDropdown.click();

const clearButton = document.getElementById("clear-filters")
clearButton.addEventListener("click", () => {
const children = form.children;
for(let child of children){
    if(child.nodeName == "INPUT"){
        child.checked = false;
    }
}
})

const clearDateButton = document.getElementById("clear-dates");
clearDateButton.addEventListener("click", () => {
    document.getElementById("min-date-input").value = "";
    document.getElementById("max-date-input").value = "";
})


function clickingLabelClicksBox(input, label){
    label.addEventListener("click", () => {
        if(input.checked == false){
            input.checked = true;
        }
        else{
            input.checked = false;
        }
    })
}