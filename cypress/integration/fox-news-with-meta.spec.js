const _ = require("lodash");

describe("fox-news-published-date", () => {
  before(() => {
    cy.server();

    cy.route({
      method: "GET",
      url: "/api/**",
      response: []
    });
    cy.route({
      method: "GET",
      url: "/feeds/**",
      response: []
    });
    cy.route({
      method: "GET",
      url: "/static/**",
      response: ";"
    });

    cy.route({
      method: "GET",
      url: "/_wzln/**",
      response: ";"
    });
  });

  it("visits", () => {
    cy.readFile("fox-news-with-meta.json").then(processed => {
      let processedUrls = Object.keys(processed);
      // 1. initialize with processed items
      let data = { ...processed };

      // 2. go through list of articles from source
      cy.readFile("fox-news.json").then(articles => {
        const urls = _.keys(articles);

        urls.forEach(url => {
          // 3. skips processed && video url
          if (
            (processedUrls.includes(url) && processed[url].meta) ||
            url.match("video.foxnews")
          ) {
            return;
          }

          // 4. browse to website
          // make sure it's same domain/subdomain
          cy.visit(url.replace("http://", "https://"), {
            onBeforeLoad: contentWindow => {
              // prevent loading of videos
              Cypress.$("body").each((index, v) => Cypress.$(v).remove());
            }
          });

          // prevent video loading
          Cypress.$(".video-container").each((index, v) =>
            Cypress.$(v).remove()
          );

          // get meta
          cy.get('[data-n-head="true"][type="application/ld+json"]').then(
            jsonText => {
              const json = JSON.parse(jsonText[0].text);

              // 5. save scraped data
              data[url] = {
                ..._.omit(articles[url], ["time"]),
                meta: json,
                date: Cypress.$('meta[name="dc.date"]').attr("content")
              };
              cy.writeFile("fox-news-with-meta.json", data, "utf8");
            }
          );
        });
      });
    });
  });
});
