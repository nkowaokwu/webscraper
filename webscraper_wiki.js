import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import { compact, flatten, trim, map, last } from 'lodash';

const wikipedia = 'https://ig.wikipedia.org';
const wikipediaDirectoryPath =
  '/w/index.php?title=Ih%C3%BC_k%C3%A1r%C3%ADr%C3%AD:Ih%C3%BCN%C3%ADl%C3%A9&from=Abuja+Declaration+%282001%29';

const dir = './wikipedia';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const nextNavigationLinks = [];
const skipMatches = [/\[\d{1,}\]/g, /\s\.{1,}/g];
let finalSentenceCount = 0;

const scrapePageContent = async (pageLinks) => {
  await Promise.all(
    map(pageLinks, async (pageLink) => {
      await axios.get(`${wikipedia}${pageLink}`).then(({ data }) => {
        const $ = cheerio.load(data);
        const sentences = compact(
            map($('#mw-content-text p'), (paragraph) => {
              const paragraphContent = $(paragraph).text();
              if (paragraphContent?.split) {
                return map(paragraphContent.split('. '), (sentence) => {
                  const cleanedSentence = skipMatches.reduce(
                    (finalSentence, skipMatch) => {
                      return finalSentence.replaceAll(skipMatch, '');
                    },
                    sentence
                  );
                  return trim(cleanedSentence);
                });
              }
              return [];
            })
          )
        );
        finalSentenceCount += sentences.length;
        const docName = pageLink.split('/wiki/')[1].replace('/', '_');
        const filePath = `${dir}/${docName}.json`;

        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, JSON.stringify(sentences, null, 2));
          console.log(`Successfully wrote ${docName}`);
        }
      });
    })
  );
};

const saveNextPageNavigationURL = async ($) => {
  const nextNavigationLink = $(last($('.mw-allpages-nav a'))).attr('href');
  if (!nextNavigationLinks.includes(nextNavigationLink)) {
    nextNavigationLinks.push(nextNavigationLink);

    const pageLinks = map($('.mw-allpages-chunk li a'), (link) =>
      $(link).attr('href')
    );

    await scrapePageContent(pageLinks);

    await nextPageNavigation({
      startLink: `${wikipedia}${nextNavigationLink}`,
    });
  }
};

const sleep = (timeout) => {
  console.log(`Sleeping for ${timeout}ms`);
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

const nextPageNavigation = async ({ startLink }) => {
  const url = startLink ? startLink : `${wikipedia}${wikipediaDirectoryPath}`;
  // Sleep for 10 seconds to avoid rate limiting
  await sleep(5000);
  await axios.get(url).then(async ({ data }) => {
    const $ = cheerio.load(data);
    // Save the next navigation link in the array
    await saveNextPageNavigationURL($);
  });
  console.log('final sentence count', finalSentenceCount);
};

nextPageNavigation({});
