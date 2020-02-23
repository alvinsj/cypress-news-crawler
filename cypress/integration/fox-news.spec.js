const _ = require("lodash");

describe("fox-news", () => {
  it("crawls fox news search > politics > between dates", () => {
    // 1. visit page
    cy.visit("https://www.foxnews.com/search-results/search?q=trump");

    // 2. select section: politics
    cy.get(".section > .select").click();
    cy.get(".section > .option > :nth-child(1) > label").click();
    cy.get(".section > .select").click();

    // 3. select start date
    cy.get(".min > .month > .select").click();
    cy.get(".min > .month > .option >#11 ").click();

    cy.get(".min > .day > .select").click();
    cy.get(".min > .day > .option > #21 ").click();

    cy.get(".min > .year > .select").click();
    cy.get(".min > .year > .option > #2019 ").click();

    // 4. select end date
    cy.get(".max > .month > .select").click();
    cy.get(".max > .month > .option > .12 ").click();

    cy.get(".max > .day > .select").click();
    cy.get(".max > .day > .option > .03 ").click();

    cy.get(".max > .year > .select").click();
    cy.get(".max > .year > .option > li:nth-of-type(2) ").click();

    // 5. click search
    cy.get(".search-form > .button > a").click();

    let totalResults = 0;

    // 6. get number of result
    cy.get(".num-found").then(el => {
      totalResults = parseInt(el.find("span span").text());

      const loadMore = done => {
        cy.get(".button.load-more > a").click();

        cy.get(".main .collection-search.active").then(() => {
          let currentNum = parseInt(el.find("span:first").text());

          // there are still articles not displayed
          if (currentNum + 9 < totalResults) {
            loadMore(done);
            return;
          }

          // if nothing else to load, call done
          done(results);
        });
      };

      // 7. load more
      loadMore(() => {
        // 8. save scraped data
        let csv = {};
        cy.get(".main article").each((art, index) => {
          let time = art
            .find(".meta")
            .text()
            .trim();
          let title = art.find(".title > a").text();
          let href = art.find(".title > a").attr("href");

          let description = art.find(".content").text();

          // skip videos
          if (!href.match("video.foxnews"))
            csv[href] = {
              index,
              time,
              title,
              href,
              description
            };
        });

        cy.writeFile("fox-news.json", csv, "utf8");
      });
    });
  });
});
