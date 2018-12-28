# 11-builder

11 builder is an online tool that allows you to create your own football lineup, customize its look, and download it as a ready-to-share image.

Try it yourself on [11builder.com](https://11builder.com/).

## Usage

| command                         | description                |
|---------------------------------|----------------------------|
| `yarn install` or `npm install` | Install dependencies       |
| `yarn start` or `npm start`     | Start a development server |
| `yarn build` or `npm run build` | Create a new build         |

To serve the `/build` folder:

1. `npm install -g serve` if you don't have the `serve` package
2. `serve -s build`

## Tools used

* [React.js](https://reactjs.org/), boostraped with [create-react-app](https://github.com/facebook/create-react-app)
* [Cheerio](https://github.com/cheeriojs/cheerio) to scrape data from [fifaindex.com](https://www.fifaindex.com/fr/players/) (which was itself scraped from [EA Sport's Ultimate Team database](https://www.easports.com/fifa/ultimate-team/fut/database))
* [Netlify](https://www.netlify.com/) to deploy the app

## Contributing

Pull requests are welcome. Here are a few things that you may want to look into:

* Any security vulnerability
* Use external APIs to provide "Share with X" features, such as Imgur, Twitter, Instagram or Reddit.
* Create an open API to serve the players images and info.
* Move from CSS to Sass or Styled-Components for easier styling.
* Start using React hooks
