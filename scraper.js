// Run with: node --max-old-space-size=8192 src/scraper.js
// Or npm run scrape

const cheerio = require("cheerio")
const requestPromise = require('request-promise')
const fs = require('file-system')
const limit = require("simple-rate-limiter")
const download = require('image-downloader')

let dataList = []
let failedDownloads = []
let i = 1 // count url pages
let totalPages = 150 // 604 for all data, 150 for most
let count = 0
let lastFail
let failCount = 0
let unavailableCount = 0
let downloadsAreDone = false
let alreadySavedData = false
let jsonIndex = {}
const urlToScrape = "https://www.fifaindex.com/fr/players/"
const urlRoot = "https://www.fifaindex.com"

let getData = url => {
	console.log(`scraping pages : ${Math.trunc(i*100/totalPages)}%`)
	requestPromise(url)
		.then(html => {
			// Scrape data
			let $ = cheerio.load(html)
			const rows = $(".table.table-striped.players tbody tr:not(.table-ad, .hidden)").toArray()
			for (const row of rows) {
				// Setup player JSON structure
				const player = {}
				player.id = $(row).attr('data-playerid')
				player.name = $(row).find("td[data-title='Nom'] a").text()
				player.rating = $(row).find('span.label.rating').first().text()
				player.photo = urlRoot + $(row).find('img.player.small').attr('src')
				player.club = {
					name: $(row).find("td[data-title='Équipe'] a").attr('title'),
					logo: urlRoot + $(row).find('img.team.small').attr('src')
				}
				const positions = []
				for (const position of Array.from($(row).find('span.label.position'))) {
					positions.push($(position).text())
				}
				player.positions = positions
				player.photoFolderIndex = rows.indexOf(row) % 5
				dataList.push(player)
			}
		})
		.then(() => {
			// Stop at last page
			if (i === totalPages) {
				// Scraping is done, save data to JSON
				saveImages()
			} else {
				// Load next page
				i++
				getData(`${urlToScrape}${i}/`)
			}
		})
		.catch((error) => {
			console.log('Crawling failed')
			console.log(error)
		})
}
getData = limit(getData).to(1).per(600)

let retryDownloads = () => {
	if (failedDownloads.length > 0 && !alreadySavedData) {
		const fail = failedDownloads[0]
		if (fail === lastFail) {
			failCount++
		} else {
			failCount = 0
		}
		// Stop trying after 10 fails
		if (failCount < 10) {
			console.log(`failed downloads left: ${failedDownloads.length}`)
			download
				.image({
					url: fail.url,
					dest: fail.dest,
					timeout: 15000
				})
				.then(() => {
					// Delete element from fails list
					failedDownloads.splice(0, 1)
					console.log('FIXED failed download of ' + fail.url)
					if (failedDownloads.length > 0) {
						if (!downloadsAreDone) {
							retryDownloads()
						}
					} else {
						// Finished downloads
						console.log('downloads are done')
						if (count === dataList.length) {
							downloadsAreDone = true
							// Save JSON files
							if (!alreadySavedData) {
								savePlayersData()
							}
						}
					}
				})
				.catch(error => {
					console.log("Failed again downloading " + fail.url)
					lastFail = fail
					if (!downloadsAreDone) {
						retryDownloads()
					}
				})
			
		} else {
			console.log(`image ${fail.url} is unavailable`)
			failedDownloads.splice(0, 1)
			unavailableCount++
			if (failedDownloads.length === 0) {
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
retryDownloads = limit(retryDownloads).to(1).per(600)

let downloadClubLogos = playerObject => {
	// Download club logo if not done already
	let formattedClubName = 'undefined'
	if (playerObject.club.name !== undefined) {
		formattedClubName = playerObject.club.name.replace(/\s/g, "").normalize('NFD').replace(/[\u0300-\u036f]/g, "")
	}
	download
		.image({
			url: playerObject.club.logo,
			dest: `public/data/images/clubs/${formattedClubName}.png`,
			timeout: 15000
		})
		.catch(
			error => {
				console.log("Failed loading " + playerObject.club.logo)
				failedDownloads.push({
						url: playerObject.club.logo,
						dest: `public/data/images/clubs/${formattedClubName}.png`
				})
				checkDownloadSuccess(playerObject)
			}
		)
		.then(
			() => {
				checkDownloadSuccess(playerObject)
			}
		)
}
downloadClubLogos = limit(downloadClubLogos).to(1).per(600)

// Check donwload fails
const checkDownloadSuccess = () => {
  count++
  if (count >= dataList.length) {
    if (failedDownloads.length === 0) {
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
		console.log(`${Math.trunc(count*10000/dataList.length)/100}%, ${count} out of ${dataList.length}`)
	}
}

let downloadPictures = playerObject => {
	// Split downloads across several folders to respect GitHub's limitations
	download
		.image({
			url: playerObject.photo,
			dest: `public/data/images/photos/${playerObject.photoFolderIndex}/`,
			timeout: 15000
		})
		.catch(error => {
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
downloadPictures = limit(downloadPictures).to(1).per(600)

let saveImages = () => {
  fs.mkdir('public/data/images/clubs')
  fs.mkdir('public/data/images/photos/0')
  fs.mkdir('public/data/images/photos/1')
  fs.mkdir('public/data/images/photos/2')
  fs.mkdir('public/data/images/photos/3')
  fs.mkdir('public/data/images/photos/4')
	console.log(`datalist length: ${dataList.length}`)
  for (const playerObject of dataList) {
		// Download player photo
		downloadPictures(playerObject)
  }
}

const savePlayersData = () => {
	console.log('saving data')
	alreadySavedData = true
  for (let j=0; j<dataList.length; j++) {
		console.log(`Saving ${Math.trunc(j * 10000 / dataList.length) / 100}%`)
		// Change image links to the ones we downloaded
		let clubName = ''
		if (typeof dataList[j].club.name !== 'undefined') {
			clubName = dataList[j].club.name.replace(/\s/g, "").normalize('NFD').replace(/[\u0300-\u036f]/g, "")
		}
		dataList[j].photo = `./data/images/photos/${dataList[j].photoFolderIndex}/${dataList[j].id}.png`
		fs.access(`/public/data/images/photos/${dataList[j].photoFolderIndex}/${dataList[j].id}.png`, error => {
			if (!error) {
				console.log('changed path')
				dataList[j].photo = `./data/images/photos/${dataList[j].photoFolderIndex}/${dataList[j].id}.png`
			} else {
				console.log('default path')
				// Link placeholder image
				dataList[j].photo = './data/images/photos/none.png'
			}
			// Remove already used player data
			delete dataList[j].photoFolderIndex
		})
		dataList[j].club.logo = `./data/images/clubs/${clubName}.png`
		// Create JSON file
		let formattedName = dataList[j].name.replace(/\s/g, "").normalize('NFD').replace(/[\u0300-\u036f]/g, "")
		let uniqueIndex = 0
		while (fs.exists(`src/data/players/${formattedName}${uniqueIndex.toString()}.json`)) {
			uniqueIndex++
		}
		formattedName = `${formattedName}${uniqueIndex.toString()}`
		if (formattedName !== 'undefined') {
			fs.writeFileSync(`src/data/players/${formattedName}.json`, JSON.stringify(dataList[j]))
			jsonIndex[formattedName] = `./data/players/${formattedName}.json`
		}
		if (j === dataList.length - 1) {
			console.log(`Finished with ${unavailableCount} 404s`)
			fs.writeFileSync('src/data/index.json', JSON.stringify(jsonIndex))
			process.exit()
		}
	}
}

// Start scraping
getData(`${urlToScrape}${i}/`)