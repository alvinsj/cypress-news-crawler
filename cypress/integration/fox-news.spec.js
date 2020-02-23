const _ = require("lodash");

describe("fox-news", () => {
  it("crawls fox news search > politics > between dates", () => {
    cy.visit("https://www.foxnews.com/search-results/search?q=trump");

    cy.get(".section > .select").click();
    cy.get(".section > .option > :nth-child(1) > label").click();
    cy.get(".section > .select").click();

    cy.get(".min > .month > .select").click();
    cy.get(".min > .month > .option >#11 ").click();

    cy.get(".min > .day > .select").click();
    cy.get(".min > .day > .option > #21 ").click();

    cy.get(".min > .year > .select").click();
    cy.get(".min > .year > .option > #2019 ").click();

    cy.get(".max > .month > .select").click();
    cy.get(".max > .month > .option > .12 ").click();

    cy.get(".max > .day > .select").click();
    cy.get(".max > .day > .option > .03 ").click();

    cy.get(".max > .year > .select").click();
    cy.get(".max > .year > .option > li:nth-of-type(2) ").click();

    // click search
    cy.get(".search-form > .button > a").click();

    // click load more
    cy.get(".button.load-more > a").click();

    let totalResults = 0;
    // get number of result
    cy.get(".num-found").then(el => {
      totalResults = parseInt(el.find("span span").text());
      let currentNum = parseInt(el.find("span:first").text());
      let csv = {};

      // click load more
      const loadMore = () => {
        cy.get(".button.load-more > a").click();

        cy.get(".main .collection-search.active").then(search => {
          let currentNum = parseInt(el.find("span:first").text());

          if (currentNum + 9 < totalResults) loadMore();
          else {
            let articles = search.find("article");
            cy.get(".main article").each((art, index) => {
              let time = art
                .find(".meta")
                .text()
                .trim();
              let title = art.find(".title > a").text();
              let href = art.find(".title > a").attr("href");

              let description = art.find(".content").text();

              csv[href] = {
                time,
                title,
                href,
                description
              };
            });

            cy.writeFile("fox-news.json", csv, "utf8");
          }
        });
      };

      loadMore();
    });
  });
});
