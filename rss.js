const fs = require("fs");

const currentDate = new Date();
const year = currentDate.getFullYear();
const indexes = JSON.parse(fs.readFileSync("./data/indexes.json", "utf8"));
const indexToGet = indexes[(String(year))];
const posts = JSON.parse(fs.readFileSync(`./data/news/${year}-${indexToGet}.json`, "utf8"));
const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

if(posts){
  const items = posts.map(p => `
    <item>
      <title>${p.summary}</title>
      <link>https://hytaletracker.github.io?goTo=${p.date.replaceAll(" ", "-")}</link>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    </item>`).join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
  <channel>
    <title>The latest Hytale news</title>
    <link>https://hytaletracker.github.io</link>
    <description>The Hytale tracker has new news!</description>
    <lastBuildDate>${currentDate.toUTCString}</lastBuildDate>
    <language>en</language>

    ${items}
  </channel>
  </rss>`;

  fs.writeFileSync("rss.xml", rss);
}
