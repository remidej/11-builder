const cheerio = require("cheerio")
const jsonframe = require("jsonframe-cheerio")
const request = require('request')

const urlToScrape = "https://www.fifaindex.com/fr/players/1/"

const frame = {
  age: "td[data-title=Age]",
  lastName: "td[data-title=Nom] a"
}

let data = {}

request(urlToScrape, (error, response, html) => {
  if (!error && response.statusCode == 200) {
    let $ = cheerio.load(html)
    jsonframe($)
    $(".table.tabled-striped.players tr").each(() => {
      //data = $('body').scrape(frame, { string: true })
      console.log(this.scrape(frame, { string: true }))
    })
  }
})

console.log(data)


//const result = $('.table.tabled-striped.players tbody').scrape(frame)

//console.log(result)
