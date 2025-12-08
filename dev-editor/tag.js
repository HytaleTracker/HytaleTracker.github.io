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

    document.getElementById("new-remove-tag").addEventListener("click", () => {
        const wrap = document.createElement("div");
        wrap.classList.add("remove-tag-pair");

        wrap.innerHTML = `
            <input class="remove-catagory" placeholder="catagory">
            <input class="remove-name" placeholder="name">
        `;

        document.getElementById("new-remove-tag").before(wrap);
    });
    document.getElementById("remove-tag-remove").addEventListener("click", () => {
        const list = document.querySelectorAll(".remove-tag-pair");
        list[list.length - 1].remove();
    })

    
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

        json[3].tweets.push(...tweets);
        

        const removePairs = document.querySelectorAll(".remove-tag-pair");

        removePairs.forEach(pair => {
            const category = pair.querySelector(".remove-catagory").value.trim().toLowerCase();
            const name = pair.querySelector(".remove-name").value.trim(); // DO NOT lowercase

            let arr = null;

            if (category === "tweets") arr = json[3].tweets;
            if (category === "news") arr = json[0].news;
            if (category === "community") arr = json[1].community;

            if (!arr) return;

            const index = arr.indexOf(name);
            if (index !== -1) arr.splice(index, 1);
        });



        



        
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
        removeElementsByClass("remove-tag-pair");

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