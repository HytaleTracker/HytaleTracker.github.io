document.addEventListener("DOMContentLoaded", () => {
    fetch("../data/tags.json")
    .then(response => response.json())
    .then(data => {
        data[1].community.forEach(tag => {
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

document.addEventListener("DOMContentLoaded", () => {
    const inputDiv = document.getElementById("input");
    const previewDiv = document.getElementById("preview");

    document.getElementById("create").addEventListener("click", () => {
        const currentText = document.getElementById("current").value.trim();
        let jsonArray = [];

        if (currentText) {
            try {
                jsonArray = JSON.parse(currentText);
            } catch (e) {
                alert("Current data is not valid JSON.");
                return;
            }
        }

        const image = document.getElementById("Image").value.trim();
        const summary = document.getElementById("summary").value.trim();
        const mainText = "<p class='mainTextParagraph'>" + document.getElementById("mainText").value.trim().replaceAll("<p>", "</p><p class='mainTextParagraph'>") + "</p>";
        const link = document.getElementById("link").value.trim();
        let date = document.querySelector("input[type='date']").value;
        date = date.split("-")[1] + " " + date.split("-")[2] + " " + date.split("-")[0];


        const tagElements = [...document.querySelectorAll(".tagCheckbox")]
        let tags = [];
        tagElements.forEach(tag => {
            if(tag.checked){
                tags.push(tag.value);
            }
        });

        const newEntry = {
            image,
            mainText,
            summary,
            link,
            date,
            tags
        };

        jsonArray.unshift(newEntry);

        previewDiv.value = JSON.stringify(jsonArray, null, 4);

        document.getElementById("current").value =
        JSON.stringify(jsonArray, null, 4);

        document.getElementById("Image").value = "";
        document.getElementById("summary").value = "";
        document.getElementById("mainText").value = "";
        document.getElementById("link").value = "";
        document.getElementById("date").value = "";
        [...document.getElementsByClassName("tagCheckbox")].forEach(box => {
            box.checked = false;
        });
    });
});
document.getElementById("copyOutput").addEventListener("click", () => {
    navigator.clipboard.writeText(document.getElementById("preview").value);
})