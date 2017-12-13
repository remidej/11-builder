const cheerio = require("cheerio")
const jsonframe = require("jsonframe-cheerio")
const requestPromise = require('request-promise')

const urlToScrape = "https://www.fifaindex.com/fr/players/"

const scrapedData = {}

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

const getData = () => {
  for (let i=1; i<=6; i++) {
    requestPromise(`${urlToScrape}${i}/`)
      .then((html) => {
        // Scrape data
        let $ = cheerio.load(html)
        jsonframe($)
        //let index = i.toString()
        scrapedData[i] = $(".table.table-striped.players tbody").scrape(frame, { string: true })
      })
      .catch((error) => {
        console.log('Crawling failed')
      })
  }
}

getData()

setTimeout(() => {
  console.log(scrapedData)
}, 2000)