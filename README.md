# 🧼 webscraper
Scrapes the [BBC Igbo](https://bbc.com/igbo) daily.

The articles that are scraped form the publication for a given day
are found on the site's homepage.

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

You can also run the dev watch server for hot reloading:

```
yarn dev
```

## Igbo Tokenizer

Tokenizing the extracted articles to find new and interesting Igbo words.
So far, got `29,018` words in `words.json`.

#### TO DO
1. Github action to automatically tokenize the newly scraped articles and append newly found words to `words.json`.
2. Find a way to automatically filter out non-meaningful words.
