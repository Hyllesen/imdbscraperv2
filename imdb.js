const Nightmare = require("nightmare");
const nightmare = Nightmare({ show: true });
const request = require("request-promise");
const regularRequest = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

const sampleResult = {
  title: "Bohemian Rhapsody",
  rank: 1,
  rating: "8.4",
  mediaviewer: "htttps.....",
  url:
    "https://www.imdb.com/title/tt1727824/?pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=ea4e08e1-c8a3-47b5-ac3a-75026647c16e&pf_rd_r=5TXYH4ZPWKCCG20RYSXS&pf_rd_s=center-1&pf_rd_t=15506&pf_rd_i=moviemeter&ref_=chtmvm_tt_1"
};

async function scrape() {
  const result = await request.get(
    "https://www.imdb.com/chart/moviemeter?ref_=nv_mv_mpm"
  );
  const $ = await cheerio.load(result);

  const scrapingResults = [];

  $("table > tbody > tr").each((i, element) => {
    const url =
      "https://www.imdb.com" +
      $(element)
        .find("td.titleColumn > a")
        .attr("href");

    const title = $(element)
      .find("td.titleColumn > a")
      .text();

    const rating = $(element)
      .find(".imdbRating")
      .text()
      .trim();

    const rank = $(element)
      .find("[name='rk']")
      .attr("data-value");

    const scrapingResult = {
      title,
      rating,
      rank,
      url
    };
    scrapingResults.push(scrapingResult);
  });

  return scrapingResults;
}

async function scrapeMediaviewer(url) {
  const result = await request.get(url);
  const $ = await cheerio.load(result);
  return $(".poster > a").attr("href");
}

async function getPosterUrl(scrapingResult) {
  console.log(scrapingResult);
  await nightmare.goto(scrapingResult.mediaviewerUrl);
  const html = await nightmare.evaluate(() => document.body.innerHTML);

  const $ = await cheerio.load(html);

  const imageUrl = $(
    "#photo-container > div > div:nth-child(2) > div > div.pswp__scroll-wrap > div.pswp__container > div:nth-child(2) > div > img:nth-child(2)"
  ).attr("src");

  // console.log("rank");
  // console.log(scrapingResults.rank);

  return imageUrl;
}

async function savePicture(scrapingResult) {
  regularRequest
    .get(scrapingResult.posterUrl)
    .pipe(fs.createWriteStream("images/" + scrapingResult.rank + ".png"));
}

async function main() {
  const scrapingResults = await scrape();
  for (var i = 0; i < scrapingResults.length; i++) {
    try {
      const mediaviewerUrl = await scrapeMediaviewer(scrapingResults[i].url);
      scrapingResults[i].mediaviewerUrl =
        "https://www.imdb.com" + mediaviewerUrl;
      console.log(scrapingResults[i]);
      const posterUrl = await getPosterUrl(scrapingResults[i]);
      scrapingResults[i].posterUrl = posterUrl;
      await savePicture(scrapingResults[i]);
    } catch (err) {
      console.error(err);
    }
  }

  console.log(scrapingResults);
}
main();
// getPicture({
//   title: "Mission - Impossible - Fallout",
//   rating: "8.0",
//   rank: "81",
//   url:
//     "https://www.imdb.com/title/tt4912910/?pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=ea4e08e1-c8a3-47b5-ac3a-75026647c16e&pf_rd_r=5N2706T5C3G9RKD7SCVB&pf_rd_s=center-1&pf_rd_t=15506&pf_rd_i=moviemeter&ref_=chtmvm_tt_81",
//   mediaviewerUrl:
//     "https://www.imdb.com/title/tt4912910/mediaviewer/rm1258310912?ref_=tt_ov_i"
// });
