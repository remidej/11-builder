const cheerio = require("cheerio")
const requestPromise = require('request-promise')
const fs = require('file-system') // file system
const removeAccents = require('remove-accents')
const downloadImage = require('image-downloader')

let dataList = []

const urlToScrape = "https://www.fifaindex.com/fr/players/"
const urlRoot = "https://www.fifaindex.com"

const getData = () => {
  for (let i=1; i<=2; i++) {
    requestPromise(`${urlToScrape}${i}/`)
      .then((html) => {
        // Scrape data
        let $ = cheerio.load(html)
        const rows = $(".table.table-striped.players tbody tr:not(.table-ad, .hidden)").toArray()
        for (const row of rows) {
          // Setup player JSON structure
          const player = {
            'id': $(row).attr('data-playerid'),
            'name': $(row).find("td[data-title='Nom'] a").text(),
            'rating': $(row).find('span.label.rating').first().text(),
            'photo': urlRoot + $(row).find('img.player.small').attr('src'),
            'club': {
              'name': $(row).find("td[data-title='Équipe'] a").attr('title'),
              'logo': urlRoot + $(row).find('img.team.small').attr('src')
            },
            'flag': urlRoot + $(row).find("td[data-title='Nationalité'] .nation.small").attr('src')
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

const saveImages = () => {
  fs.mkdir('public/data/images/photos')
  fs.mkdir('public/data/images/clubs')
  fs.mkdir('public/data/images/flags')
  for (const playerObject of dataList) {
    // Download player photo
    downloadImage.image({
      url: playerObject.photo,
      dest: "public/data/images/photos/"
    })

    // Download club logo if not done already
    const formattedClubName = removeAccents(playerObject.club.name.replace(/\s/g, "").normalize('NFC'))
    fs.exists(`/public/data/images/clubs/${formattedClubName}`, (exists) => {
      if (!exists) {
        downloadImage.image({
          url: playerObject.club.logo,
          dest: `public/data/images/clubs/${formattedClubName}.png`
        })
      }
    })

    // Download nation flag
    downloadImage.image({
      url: playerObject.flag,
      dest: `public/data/images/flags/`
    })

  }
}

const saveData = () => {
  for (const playerObject of dataList) {
    const formattedName = removeAccents(playerObject.name.replace(/\s/g, "").normalize('NFC'))
    if (formattedName !== 'undefined') {
      fs.writeFile(`public/data/players/${formattedName}.json`, JSON.stringify(playerObject))
    }
  }
  saveImages()
}

getData()