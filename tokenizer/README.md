# 🧼 webscraper
Scrapes the [BBC Igbo](https://bbc.com/igbo) daily.

The articles that are scraped form the publication for a given day
are found on the site's homepage.

## Igbo Tokenizer

Tokenizing the extracted articles to find new and interesting Igbo words.
So far, got `29,018` words. Look in `words.json` or `words.txt`.

#### TO DO
1. Github action to automatically tokenize the newly scraped articles and append newly found words to `words.json` and/or `words.txt`.
2. Find a way to automatically filter out non-meaningful words.
