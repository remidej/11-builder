// Run with: node --max-old-space-size=4096 src/scraper.js

const cheerio = require("cheerio")
const requestPromise = require('request-promise')
const fs = require('file-system')
const removeAccents = require('remove-accents')
const download = require('image-downloader')
const log = require('log-to-file')

let dataList = []
let failedDownloads = []
let i = 1 // count url pages
let totalPages = 50
let count = 0
const urlToScrape = "https://www.fifaindex.com/fr/players/"
const urlRoot = "https://www.fifaindex.com"

const getData = (url) => {
	log(`scraping pages : ${Math.trunc(i*100/totalPages)}%`)
	console.log(`scraping pages : ${Math.trunc(i*100/totalPages)}%`)
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
			// Stop at last page
			if (i== totalPages) {
				log('stopped before loading page ' + i)
				console.log('stopped before loading page ' + i)
				// Scraping is done, save data to JSON
				saveImages()
			} else {
				getData(`${urlToScrape}${i}/`)
			}
		})
		.catch((error) => {
			log('Crawling failed')
			console.log('Crawling failed')
		})
}

const retryDownloads = () => {
	for (const fail of failedDownloads) {
		log(failedDownloads.length)
		console.log(failedDownloads.length)
		download
		.image({
			url: fail.url,
			dest: fail.dest
		}).then(() => {
			// Delete element from fails list
			let fixedIndex = failedDownloads.indexOf(fail)
			failedDownloads.splice(fixedIndex, 1)
			log('Fixed failed download of ' + fail.url)
			console.log('Fixed failed download of ' + fail.url)
			// Save JSON files
			if (fixedIndex == failedDownloads.length - 1) {
				savePlayersData()
			}
		}).catch(error => {
			log("Failed again downloading " + fail.url)
			console.log("Failed again downloading " + fail.url)
			retryDownloads()
		})
	}
}

const downloadClubLogos = (playerObject) => {
	// Download club logo if not done already
	const formattedClubName = removeAccents(playerObject.club.name.replace(/\s/g,"").normalize("NFC"))
	download
		.image({
			url:
				playerObject
					.club
					.logo,
			dest: `public/data/images/clubs/${formattedClubName}.png`
		})
		.catch(
			error => {
				log("Failed loading " + playerObject.club.logo)
				console.log("Failed loading " + playerObject.club.logo)
				failedDownloads.push({
						url: playerObject.club.logo,
						dest: `public/data/images/clubs/${formattedClubName}.png`
				})
				downloadFlags(playerObject)
			}
		)
		.then(
			() => {
				downloadFlags(playerObject)
			}
		)
}

// Download nation flags
const downloadFlags = (playerObject) => {
	download
		.image({
			url: playerObject.flag,
			dest: `public/data/images/flags/`
		})
		.then(() => {
			checkDownloadSuccess(playerObject)
		})
		.catch(error => {
			log("Failed loading " + playerObject.flag)
			console.log("Failed loading " + playerObject.flag)
			failedDownloads.push({
				url: playerObject.flag,
				dest: `public/data/images/flags/`
			})
			checkDownloadSuccess(playerObject)
		})
}

// Check donwload fails
const checkDownloadSuccess = () => {
	log(`${Math.trunc(count*10000/dataList.length)/100}%, ${count} out of ${dataList.length}`)
	console.log(`${Math.trunc(count*100/dataList.length)/100}%, ${count} out of ${dataList.length}`)
  //console.log("getting " + playerObject.name)
  //console.log(`downloading images: ${Math.trunc(count*100/dataList.length)}%`)
  count++
  if (count == dataList.length) {
    log(`Finished dl with ${failedDownloads.length} fails`)
    console.log(`Finished dl with ${failedDownloads.length} fails`)
    if (failedDownloads.length == 0) {
      // Last loop ended, write json files
      savePlayersData()
    } else {
      log("download fails: " + failedDownloads)
      console.log("download fails:")
      console.log(failedDownloads)
      retryDownloads()
    }
  }
}

const saveImages = () => {
  fs.mkdir('public/data/images/photos')
  fs.mkdir('public/data/images/clubs')
  fs.mkdir('public/data/images/flags')
	log('datalist length:')
	console.log('datalist length:')
  log(dataList.length)
  console.log(dataList.length)
  for (const playerObject of dataList) {
		log('not done: ' + playerObject.name)
		console.log('not done: ' + playerObject.name)
		// Download player photo
		download
			.image({
				url: playerObject.photo,
				dest: "public/data/images/photos/"
			})
			.catch((error) => {
				log('Failed loading ' + playerObject.photo)
				console.log('Failed loading ' + playerObject.photo)
				failedDownloads.push({
					url: playerObject.photo,
					dest: "public/data/images/photos/"
				})
				downloadClubLogos(playerObject)
			})
			.then(() => {
				downloadClubLogos(playerObject)
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
	log(`done with ${failedDownloads.length} fails`)
	console.log(`done with ${failedDownloads.length} fails`)
}

getData(`${urlToScrape}${i}/`)

// TODO: find why sometimes just 1 page is loaded