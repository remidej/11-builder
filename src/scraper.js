const cheerio = require("cheerio")
const jsonframe = require("jsonframe-cheerio")
const requestPromise = require('request-promise')

const urlToScrape = "https://www.fifaindex.com/fr/players/1/"

const frame = {
  'players': {
    '_s': 'tr',
    '_d': [{
      'name': 'td[data-title=Nom] a',
      'rating': 'span.label.rating.r1',
      'photo': 'img.player.small',
      'club': {
        'name': 'td[data-title=Équipe] a @ title',
        'logo': 'img.team.small'
      }
    }]
  }
}

requestPromise(urlToScrape)
  .then((html) => {
    // Scrape data
    let $ = cheerio.load(html)
    jsonframe($)
    console.log( $(".table.table-striped.players tbody").scrape(frame, { string: true }) )
  })
  .catch((error) => {
    console.log('Crawling failed')
  })