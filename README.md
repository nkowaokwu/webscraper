# 🧼 webscraper

Scrapes the [BBC Igbo](https://bbc.com/igbo) and [Igbo Radio](https://igboradio.com) daily.

### BBC Igbo

A depth-driven search script is used to find all most recent articles starting
from the homepage of BBC Igbo.

### Igbo Radio

The scraper goes to all category links in the navigation bar, and navigates to each article
found on each page of the categories page.

## Getting Started

Install the project dependencies:

```
yarn install
```

Build the project:

```
yarn build
```

To scrape and save BBC Igbo articles, run:

```
yarn start
```

To scrape Igbo Radio articles, run:

```
yarn start:igbo_radio
```

You can also run the dev watch server for hot reloading:

```
yarn dev
```
