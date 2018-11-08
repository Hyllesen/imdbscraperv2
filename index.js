const Nightmare = require("nightmare");
const nightmare = Nightmare({ show: true });
const cheerio = require("cheerio");
const fs = require("fs");

async function scrape() {
  try {
    await nightmare.goto(
      "https://www.airbnb.com/s/Denmark/homes?refinement_paths%5B%5D=%2Fhomes&query=Denmark&checkin=2018-11-07&checkout=2018-11-12&adults=1&children=0&infants=0&guests=1&place_id=ChIJ-1-U7rYnS0YRzZLgw9BDh1I&allow_override%5B%5D=&s_tag=bz0016aN"
    );

    const result = await nightmare.evaluate(() => {
      return document.body.innerHTML;
    });

    saveHtml(result);

    const $ = cheerio.load(result);
    const items = $("[itemprop='url']").map((i, element) => {
      return $(element).attr("content");
    });

    console.log(items);
    // await nightmare.goto(items[0]);
  } catch (e) {
    console.error(e);
  }
}

function saveHtml(content) {
  fs.writeFile("testhtml.html", content, function(err) {
    if (err) {
      return console.error(err);
    }
    console.log("html was saved");
  });
}

scrape();
