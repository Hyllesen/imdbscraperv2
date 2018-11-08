const Nightmare = require("nightmare");
const nightmare = Nightmare({ show: true });
const request = require("request-promise");
const cheerio = require("cheerio");

const sampleResult = {
  title: "Bohemian Rhapsody",
  rank: 1,
  rating: "8.4",
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
      "https://wwww.imdb.com" +
      $(element)
        .find("td.titleColumn > a")
        .attr("href");

    const title = $(element)
      .find("td.titleColumn > a")
      .attr("title");

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

  console.log(scrapingResults);

  //   await nightmare.goto("https://www.imdb.com/chart/moviemeter?ref_=nv_mv_mpm");
}

scrape();
