const form = document.getElementById("filterForm");
document.addEventListener("DOMContentLoaded", () => {
    const h3 = document.createElement("h3");
    h3.textContent = "Tags: ";
    form.appendChild(h3);
    fetch("/data/tags.json")
    .then(response => response.json())
    .then(data => {
        data.forEach(tag => {
            const input = document.createElement("input");
            input.type = "checkbox";
            input.id = tag;
            input.name = tag;
            const label = document.createElement("label");
            label.for = tag;
            label.textContent = tag;
            form.appendChild(input);
            form.appendChild(label);
            form.appendChild(document.createElement("br"));
            clickingLabelClicksBox(input, label);
        });
    })
})
const filterDropdown = document.getElementById("filterDropdown");
const formDiv = document.getElementById("filters");
filterDropdown.addEventListener("click", () => {
    if(formDiv.style.display == "none"){
        formDiv.style.display = "inherit";
    }
    else{
        formDiv.style.display = "none";
    }
})
filterDropdown.click();

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