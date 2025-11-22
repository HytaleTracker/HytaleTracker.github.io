document.addEventListener("DOMContentLoaded", () => {

    
    document.getElementById("new-tag-news").addEventListener("click", () => {
        const input = document.createElement("input");
        input.classList.add("tag-news");
        document.getElementById("new-tag-news").before(input);
    });

    
    document.getElementById("new-tag-community").addEventListener("click", () => {
        const input = document.createElement("input");
        input.classList.add("tag-community");
        document.getElementById("new-tag-community").before(input);
    });

   
    document.getElementById("tag-colors").addEventListener("click", () => {
        const wrap = document.createElement("div");
        wrap.classList.add("color-pair");

        wrap.innerHTML = `
            <input class="color-key" placeholder="tag name">
            <input class="color-value" placeholder="background Color">
            <input class="text-color" placeholder = "text Color">
        `;

        document.getElementById("tag-colors").before(wrap);
    });

    document.getElementById("new-tag-tweet").addEventListener("click", () => {
        const input = document.createElement("input");
        input.classList.add("tag-tweet");
        document.getElementById("new-tag-tweet").before(input);
    });

    
    document.getElementById("create").addEventListener("click", () => {
        const text = document.getElementById("current").value.trim();

        let json = [];
        if (text) {
            try {
                json = JSON.parse(text);
            } catch {
                alert("Invalid JSON");
                return;
            }
        } else {
            
            json = [
                { news: [] },
                { community: [] },
                { colors: [{}] },
                { tweets: [] }
            ];
        }

        
        const news = [...document.querySelectorAll(".tag-news")]
            .map(i => i.value.trim())
            .filter(Boolean);

        
        const community = [...document.querySelectorAll(".tag-community")]
            .map(i => i.value.trim())
            .filter(Boolean);
        const tweets = [...document.querySelectorAll(".tag-tweet")]
            .map(i => i.value.trim())
            .filter(Boolean);

        
        const colorObj = {};
        document.querySelectorAll(".color-pair").forEach(pair => {
            const key = pair.querySelector(".color-key").value.trim();
            const val = pair.querySelector(".color-value").value.trim();
            const txt = pair.querySelector(".text-color").value.trim();
            if(key && val && txt){
                colorObj[key] = [val, txt];
            }
            else if (key && val) {
                colorObj[key] = [val];
            }
        });

        
        json[0].news.push(...news);
        json[1].community.push(...community);

        if (Object.keys(colorObj).length > 0) {
            json[2].colors[0] = {
                ...json[2].colors[0],
                ...colorObj
            };
        }
        const nameValue = document.getElementById("name").value.trim();
        const catValue = document.getElementById("catagory").value.trim().toLowerCase();

        if (nameValue && catValue) {
            switch (catValue) {
                case "news":
                    json[0].news = json[0].news.filter(tag => tag !== nameValue);
                    break;
                case "community":
                    json[1].community = json[1].community.filter(tag => tag !== nameValue);
                    break;
                case "colors":
                    
                    if (json[2].colors[0][nameValue]) {
                        delete json[2].colors[0][nameValue];
                    }
                    break;
                default:
                    console.warn("Unknown category:", catValue);
            }
        }

        json[3].tweets.push(...tweets)



        
        document.getElementById("preview").value =
            JSON.stringify(json, null, 4);

        document.getElementById("current").value =
            JSON.stringify(json, null, 4);

        
        function removeElementsByClass(className) {
            const elements = document.getElementsByClassName(className);
            while (elements.length > 0) { 
                elements[0].remove();
            }
        }

        
        removeElementsByClass("tag-community");
        removeElementsByClass("tag-news");
        removeElementsByClass("color-pair");
        document.getElementById("catagory").value = "";
        document.getElementById("name").value = "";

            });
});
document.getElementById("copyOutput").addEventListener("click", () => {
    navigator.clipboard.writeText(document.getElementById("preview").value);
})
document.getElementById("remove-new-tag-news").addEventListener("click", () => {
    const elements = document.getElementsByClassName("tag-news");
    const i = elements.length;
    elements[i - 1].remove();
})
document.getElementById("remove-new-tag-community").addEventListener("click", () => {
    const elements = document.getElementsByClassName("tag-community");
    const i = elements.length;
    elements[i - 1].remove();
})
document.getElementById("remove-new-tag-tweet").addEventListener("click", () => {
    const elements = document.getElementsByClassName("tag-tweet");
    const i = elements.length;
    elements[i - 1].remove();
})
document.getElementById("remove-new-tag-color").addEventListener("click", () => {
    const elements = document.getElementsByClassName("color-pair");
    const i = elements.length;
    elements[i - 1].remove();
})