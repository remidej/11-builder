const cheerio = require("cheerio")
const requestPromise = require('request-promise')
const fs = require('file-system') // file system

let dataList = []

const urlToScrape = "https://www.fifaindex.com/fr/players/"
const urlRoot = "https://www.fifaindex.com"

const getData = () => {
  for (let i=1; i<=2; i++) {
    requestPromise(`${urlToScrape}${i}/`)
      .then((html) => {
        // Scrape data
        let $ = cheerio.load(html)
        const rows = $(".table.table-striped.players tbody tr").toArray()
        for (const row of rows) {
          // Setup player JSON structure
          const player = {
            'id': $(row).attr('data-playerid'),
            'name': $(row).find("td[data-title='Nom'] a").text(),
            'rating': $(row).find('span.label.rating').first().text(),
            'photo': urlRoot + $(row).find('img.player.small').attr('src'),
            'club': {
              'name': $(row).find('td[data-title=Équipe] a').attr('title'),
              'logo': urlRoot + $(row).find('img.team.small').attr('src')
            }
          }
          dataList.push(player)
        }
      })
      .then(() => {
        if (i==2) {
          // Scraping is done, save data to JSON
          saveData()
        }
      })
      .catch((error) => {
        console.log('Crawling failed')
      })
  }
}

const saveData = () => {
  console.log(dataList[0])
  fs.writeFile("data/playersData.json", JSON.stringify(dataList), error => {
    console.log(error)
  })
}

getData()