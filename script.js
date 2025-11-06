//load the uh uh uh the uh um uh the uh news from the uh uh uh the uh um uh the uh JSON file
document.addEventListener("DOMContentLoaded", function() {
    fetch('./data/news.json')
        .then(response => response.json())
        .then(data => {
            let lastDate = null;
            let side = 'right';
            data.forEach(item => {
                const container = document.getElementById(side);
                const link = document.createElement('a');
                link.href = item.link;
                link.target = "_blank";
                link.classList.add("invisible-link");
                const newsItem = document.createElement('div');
                const mainText = document.createElement('p');
                const summary = document.createElement('h2');
                const logo = document.createElement('img');
                
                if(item.date !== lastDate) {
                    const date = document.createElement('h3');
                    const hr = document.createElement('hr');
                    hr.className = side;
                    date.textContent = item.date;
                    date.className = "date-header";
                    lastDate = item.date;
                    container.appendChild(date);
                    container.appendChild(hr);
                    container.appendChild(document.createElement('br'));
                }

                if(item.type == "tweet"){
                    logo.src = "./assets/twitter.png";
                }
                else if(item.type == "blog" | item.type == "update"){
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

                newsItem.className = "news-item";
                link.appendChild(newsItem);
                container.appendChild(link);

                

                side = (side === 'right') ? 'left' : 'right';

            });
        });
});
