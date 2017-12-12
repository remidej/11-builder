const cheerio = require("cheerio")
const jsonframe = require("jsonframe-cheerio")
const request = require('request')

const urlToScrape = "https://www.fifaindex.com/fr/players/1/"

const frame = {
  'players': {
    '_s': 'tr',
    '_d': [{
      'name': 'td[data-title=Nom] a'
    }]
  }
}

request(urlToScrape, (error, response, html) => {
  if (!error && response.statusCode == 200) {
    let $ = cheerio.load(html)
    jsonframe($)
    console.log( $(".table.table-striped.players tbody").scrape(frame, { string: true }) )
  }
})