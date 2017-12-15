const cheerio = require("cheerio")
const requestPromise = require('request-promise')
const fs = require('file-system')
const removeAccents = require('remove-accents')
const downloadImage = require('image-downloader')

let dataList = []
let i = 1 // count url pages
const urlToScrape = "https://www.fifaindex.com/fr/players/"
const urlRoot = "https://www.fifaindex.com"

const getData = (url) => {
	console.log('getting data ' + i)
	requestPromise(url)
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
			i++
			if (i==105) {
				console.log('stopped before loading page ' + i)
				// Scraping is done, save data to JSON
				saveImages()
			} else {
				getData(`${urlToScrape}${i}/`)
			}
		})
		.catch((error) => {
			console.log('Crawling failed')
		})
}
  
const saveImages = () => {
  fs.mkdir('public/data/images/photos')
  fs.mkdir('public/data/images/clubs')
  fs.mkdir('public/data/images/flags')
  let count = 0
  
  for (const playerObject of dataList) {
    // Download player photo
    downloadImage.image({
      url: playerObject.photo,
      dest: "public/data/images/photos/"
    })
    
    // Download club logo if not done already
    const formattedClubName = removeAccents(playerObject.club.name.replace(/\s/g, "").normalize('NFC'))
		downloadImage.image({
			url: playerObject.club.logo,
			dest: `public/data/images/clubs/${formattedClubName}.png`
		})
    
    // Download nation flag
    downloadImage.image({
      url: playerObject.flag,
      dest: `public/data/images/flags/`
    }).then(() => {
      count++
      //console.log(count + ' vs ' + dataList.length)
      if (count == dataList.length) {
        // Last loop ended, write json files
        savePlayersData()
      }
    })
  }
}

const savePlayersData = () => {
  for (const playerObject of dataList) {
    // Change image links to the ones we downloaded
		const clubName = removeAccents(playerObject.club.name.replace(/\s/g, "").normalize('NFC'))
		fs.access(`/data/images/photos/${playerObject.id}.png`, (error) => {
			if (!error) {
				playerObject.photo = `/data/images/photos/${playerObject.id}.png`
			} else {
				// Link placeholder image
				playerObject.photo = '/data/images/photos/none.png'
			}
		})
    playerObject.club.logo = `/data/images/photos/${clubName}.png`
    playerObject.flag = `/data/images/photos/${playerObject.flag.replace(/^.*[\\\/]/, "")}`

    // Create JSON file
    const formattedName = removeAccents(playerObject.name.replace(/\s/g, "").normalize('NFC'))
    if (formattedName !== 'undefined') {
      fs.writeFile(`public/data/players/${formattedName}.json`, JSON.stringify(playerObject))
    }
  }
}

getData(`${urlToScrape}${i}/`)

// TODO: find why sometimes just 1 page is loaded