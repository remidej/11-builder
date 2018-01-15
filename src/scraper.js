// Run with: node --max-old-space-size=8192 src/scraper.js

const cheerio = require("cheerio")
const requestPromise = require('request-promise')
const fs = require('file-system')
const removeAccents = require('remove-accents')
const limit = require("simple-rate-limiter")
const download = require('image-downloader')
const log = require('log-to-file')

let dataList = []
let failedDownloads = []
let i = 1 // count url pages
let totalPages = 3 // 604 for all data
let count = 0
let lastFail
let failCount = 0
let unavailableCount = 0
let downloadsAreDone = false
let alreadySavedData = false
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
			if (i == totalPages) {
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

let retryDownloads = () => {
	if (failedDownloads.length > 0 && !alreadySavedData) {
		const fail = failedDownloads[0]
		if (fail == lastFail) {
			failCount++
		} else {
			failCount = 0
		}
		// Stop trying after 4 fails
		if (failCount < 4) {
			log(`failed downloads left: ${failedDownloads.length}`)
			console.log(`failed downloads left: ${failedDownloads.length}`)
			download
				.image({
					url: fail.url,
					dest: fail.dest,
					timeout: 10000
				})
				.then(() => {
					// Delete element from fails list
					failedDownloads.splice(0, 1)
					log('Fixed failed download of ' + fail.url)
					console.log('Fixed failed download of ' + fail.url)
					if (failedDownloads.length > 0) {
						if (!downloadsAreDone) {
							retryDownloads()
						}
					} else {
						// Finished downloads
						log('downloads are done')
						console.log('downloads are done')
						if (count == dataList.length) {
							downloadsAreDone = true
							// Save JSON files
							if (!alreadySavedData) {
								savePlayersData()
							}
						}
					}
				})
				.catch(error => {
					log("Failed again downloading " + fail.url)
					console.log("Failed again downloading " + fail.url)
					lastFail = fail
					if (!downloadsAreDone) {
						retryDownloads()
					}
				})
			
		} else {
			log(`image ${fail.url} is unavailable`)
			console.log(`image ${fail.url} is unavailable`)
			failedDownloads.splice(0, 1)
			unavailableCount++
			if (failedDownloads.length == 0) {
				downloadsAreDone = true
				if (!alreadySavedData) {
					savePlayersData()
				}
			} else {
				retryDownloads()
			}
		}
	} else {
		if (!alreadySavedData) {
			savePlayersData()
		}
	}
}
retryDownloads = limit(retryDownloads).to(1).per(300)

let downloadClubLogos = (playerObject) => {
	// Download club logo if not done already
	let formattedClubName = 'undefined'
	if (playerObject.club.name != undefined) {
		formattedClubName = removeAccents(playerObject.club.name.replace(/\s/g,"").normalize("NFC"))
	}
	download
		.image({
			url: playerObject.club.logo,
			dest: `public/data/images/clubs/${formattedClubName}.png`,
			timeout: 10000
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
downloadClubLogos = limit(downloadClubLogos).to(1).per(300)

// Download nation flags
let downloadFlags = (playerObject) => {
	download
		.image({
			url: playerObject.flag,
			dest: `public/data/images/flags/`,
			timeout: 10000
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
downloadFlags = limit(downloadFlags).to(1).per(300)

// Check donwload fails
const checkDownloadSuccess = () => {
  //console.log("getting " + playerObject.name)
  //console.log(`downloading images: ${Math.trunc(count*100/dataList.length)}%`)
  count++
  if (count >= dataList.length) {
    if (failedDownloads.length == 0) {
			log('Downloads are done')
			console.log('Downloads are done')
			// Last loop ended, write json files
			if (!alreadySavedData) {
				savePlayersData()
			}
    } else {
			if (!downloadsAreDone) {
				retryDownloads()
			}
    }
  } else {
		log(`${Math.trunc(count*10000/dataList.length)/100}%, ${count} out of ${dataList.length}`)
		console.log(`${Math.trunc(count*10000/dataList.length)/100}%, ${count} out of ${dataList.length}`)
	}
}

let downloadPictures = (playerObject) => {
	download
		.image({
			url: playerObject.photo,
			dest: "public/data/images/photos/",
			timeout: 10000
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
downloadPictures = limit(downloadPictures).to(1).per(300)

let saveImages = () => {
  fs.mkdir('public/data/images/photos')
  fs.mkdir('public/data/images/clubs')
  fs.mkdir('public/data/images/flags')
	log('datalist length:')
	console.log('datalist length:')
  log(dataList.length)
  console.log(dataList.length)
  for (const playerObject of dataList) {
		// Download player photo
		downloadPictures(playerObject)
  }
}

const savePlayersData = () => {
	log('saving data')
	console.log('saving data')
	alreadySavedData = true
  for (let j=0; j<dataList.length; j++) {
		log(`Saving ${Math.trunc(j * 10000 / dataList.length) / 100}%`)
		console.log(`Saving ${Math.trunc(j * 10000 / dataList.length) / 100}%`)
		// Change image links to the ones we downloaded
		let clubName = ''
		if (typeof dataList[j].club.name !== 'undefined') {
			clubName = removeAccents(dataList[j].club.name.replace(/\s/g, "").normalize('NFC'))
		} else {
			log(dataList[j].club.name)
			console.log(dataList[j].club.name)
			log(dataList[j].flag)
			console.log(dataList[j].flag)
			log(dataList[j].photo)
			console.log(dataList[j].photo)
			log(dataList[j].name)
			console.log(dataList[j].name)
			clubName = 'unavailable'
		}
		fs.access(`/data/images/photos/${dataList[j].id}.png`, (error) => {
			if (!error) {
				dataList[j].photo = `/data/images/photos/${dataList[j].id}.png`
			} else {
				// Link placeholder image
				dataList[j].photo = '/data/images/photos/none.png'
			}
		})
		dataList[j].club.logo = `/data/images/photos/${clubName}.png`
		dataList[j].flag = `/data/images/photos/${dataList[j].flag.replace(/^.*[\\\/]/, "")}`
		// Create JSON file
		const formattedName = removeAccents(dataList[j].name.replace(/\s/g, "").normalize('NFC'))
		if (formattedName !== 'undefined') {
			console.log(JSON.stringify(dataList[j]))
			fs.writeFileSync(`public/data/players/${formattedName}.json`, JSON.stringify(dataList[j]))
		}
		if (j == dataList.length - 1) {
			log('over and out')
			console.log('over and out')
			log(`done with ${unavailableCount} 404s`)
			console.log(`done with ${unavailableCount} 404s`)
			process.exit()
		}
	}
}

// Start scraping
getData(`${urlToScrape}${i}/`)