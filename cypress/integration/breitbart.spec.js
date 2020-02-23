const _ = require("lodash");
const moment = require("moment");

describe("breibart", () => {
  it("crawls breibart news by date url", () => {
    // Nov 21 - Dec 3

    const startDate = moment.utc("2019-11-21");
    const endDate = moment.utc("2019-12-03");

    const crawlForDate = (date, done) =>
      cy.readFile("breibart-news.json").then(processed => {
        let data = { ...processed };

        cy.visit(
          `https://www.breitbart.com/politics/${date.year()}/${date.format(
            "MM"
          )}/${date.format("DD")}/`
        );

        cy.get(".aList article")
          .each((article, index) => {
            const title = article.find(".tC > h2").text();
            const href = article.find(".tC > h2 > a").attr("href");
            const url = `https://www.breitbart.com/${href}`;

            // skips video
            if (href.match("/clips") || data[url]) return;

            const description = article.find(".tC > .excerpt").text();

            const author = article.find(".tC > footer > address").text();
            const authorLink = article
              .find(".tC > footer > address > a")
              .attr("href");

            const time = article.find(".tC > footer > time").text();
            const date = moment(time).format("YYYY-MM-DD");
            const datetime = article
              .find(".tC > footer > time")
              .attr("datetime");

            const discuqCount = article.find(".tC > footer > .byC").text();
            const discuqUrl = article
              .find(".tC > footer > .byC")
              .attr("data-dsqu");

            data[url] = {
              index,
              date,
              title,
              href: url,
              description,
              meta: {
                author,
                authorLink,
                discuqUrl,
                discuqCount,
                datetime
              }
            };
            cy.writeFile("breibart-news.json", data, "utf8");
          })
          .then(() => {
            const newDate = date.add(1, "days");
            if (newDate.isSameOrBefore(endDate)) crawlForDate(newDate, done);
            else done();
          });
      });
    crawlForDate(startDate, () => console.log("done"));
  });
});
