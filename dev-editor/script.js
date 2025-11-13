document.addEventListener("DOMContentLoaded", () => {
    fetch("../data/tags.json")
    .then(response => response.json())
    .then(data => {
        data[0].news.forEach(tag => {
            console.log(tag);
            const checkBox = document.createElement("input");
            checkBox.type = "checkbox";
            checkBox.name = "tags";
            checkBox.value = tag;
            checkBox.id = tag;
            checkBox.classList.add("tagCheckbox");
            const label = document.createElement("label");
            label.for = tag;
            label.textContent = tag;
            const container = document.getElementById("tagsForm");

            label.addEventListener("click", () => {
                checkBox.checked = true;
            })

            container.appendChild(checkBox);
            container.appendChild(label);
        })
    })
})




document.getElementById("create").addEventListener("click", () => {
    const currentText = document.getElementById("current").value.trim();

    let jsonArray = [];
    if (currentText) {
        try {
            jsonArray = JSON.parse(currentText);
        } catch {
            alert("Current data is not valid JSON.");
            return;
        }
    }

    const mainPlatform = document.querySelector("input[name='main']:checked")?.value || "";
    const headline = document.getElementById("headline").value.trim();
    const summary = headline;
    const mainText = document.getElementById("summary").value.trim();
    let date = document.getElementById("date").value;
    date = date.split("-")[1] + " " + date.split("-")[2] + " " + date.split("-")[0];
    if(date[0] == "0"){
        date[0] = "";
    }

    const tagElements = [...document.querySelectorAll(".tagCheckbox")]
    let tags = [];
    tagElements.forEach(tag => {
        if(tag.checked){
            tags.push(tag.value);
        }
    });
    if(mainPlatform == "blog"){
        tags.push("blog");
    }
    if(mainPlatform == "update"){
        tags.push("update");
    }
    if(mainPlatform == "tweet"){
        tags.push("tweet");
    }

    let sourceIndex = 1;
    const sources = [];

    document.querySelectorAll(".source-group").forEach(group => {
        const entries = {};
        group.querySelectorAll(".source-entry").forEach(() => {});

        const rows = group.querySelectorAll(".source-entry");
        if (rows.length > 0) {
            const row = rows[0];
            const display = row.querySelector(".source-display").value.trim();
            const url = row.querySelector(".source-url").value.trim();
            if (display || url) {
                entries[sourceIndex] = [display, url];
                sourceIndex++;
                sources.push(entries);
            }
        }
    });

    const newEntry = {
        mainPlatform,
        summary,
        mainText,
        date,
        tags,
        sources
    };

    jsonArray.unshift(newEntry);

    document.getElementById("preview").value =
        JSON.stringify(jsonArray, null, 4);

    document.getElementById("current").value =
        JSON.stringify(jsonArray, null, 4);

    document.getElementById("tweet").checked = false;
    document.getElementById("blog").checked = false;
    document.getElementById("update").checked = false;
    document.getElementById("summary").value = "";
    document.getElementById("headline").value = "";
    document.getElementById("date").value = "";

    function removeElementsByClass(className) {
            const elements = document.getElementsByClassName(className);
            while (elements.length > 0) {
                elements[0].remove();
            }
        }
    removeElementsByClass("source-group");

    [...document.getElementsByClassName("tagCheckbox")].forEach(box => {
        box.checked = false;
    });
});

document.getElementById("new-source").addEventListener("click", () => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("source-group");

    const entry = document.createElement("div");
    entry.classList.add("source-entry");

    entry.innerHTML = `
        <input class="source-display" placeholder="display text">
        <input class="source-url" placeholder="url">
    `;

    wrapper.appendChild(entry);
    document.body.insertBefore(wrapper, document.getElementById("new-source"));
});

document.getElementById("copyOutput").addEventListener("click", () => {
    navigator.clipboard.writeText(document.getElementById("preview").value);
})
document.getElementById("remove-source").addEventListener("click", () => {
    const elements = document.getElementsByClassName("source-group");
    const i = elements.length;
    elements[i - 1].remove();
})