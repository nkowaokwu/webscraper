import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import { filter, trim, map, reduce, split, last } from 'lodash';

const bbc = 'https://bbc.com';
const bbcIgbo = 'https://bbc.com/igbo';
const articleBases = ['/igbo/afirika-', '/igbo/articles/'];
const MAX_DEPTH = 2;

const finalObject = {};

const dir = './articles';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const scrapeDataAndWriteFile = ({ link, data, depth }) => {
  const $ = cheerio.load(data);
  const docName = split(link, '/')[2].split('-')[1] || last(split(link, '/'));
  finalObject[docName] = { published: '', sentences: [] };
  finalObject[docName].published = $('time').first().text();
  finalObject[docName].sentences = reduce(
    $('p, li').map((_, text) => {
      const finalText = $(text)
        .text()
        .replace(/^([0-9:\.])+/g, '');
      return finalText;
    }),
    (listOfSentences, sentence) => {
      listOfSentences.push(trim(sentence));
      return listOfSentences;
    },
    []
  );
  const filePath = `articles/${docName}.json`;
  // Writes to file if it doesn't exist
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(finalObject[docName], null, 2));
    console.log(`Successfully wrote ${docName}`);
  }
  return scrapeContent({ startLink: `${bbc}${link}`, depth: depth + 1 });
};

const collectValidArticleLinks = ({ data }) => {
  const $ = cheerio.load(data);
  return filter(
    $('a').map((_, anchor) => $(anchor).attr('href')),
    (anchorLink) =>
      articleBases.some((articleBase) => anchorLink.startsWith(articleBase))
  );
};

const visitStartLink = ({ link, data, depth }) => {
  try {
    const articleLinks = collectValidArticleLinks({ data });
    return articleLinks;
  } catch (err) {
    console.log('Anchor error:', err.message);
    process.exit(1);
  }
};

const scrapeContent = ({ startLink, depth }) => {
  if (depth === MAX_DEPTH) {
    return;
  }

  return axios
    .get(startLink)
    .then(({ data }) => visitStartLink({ link: startLink, data, depth }))
    .then((articleLinks) => {
      Promise.all(
        map(articleLinks, (link) => {
          try {
            return axios
              .get(`${bbc}${link}`)
              .then(({ data }) => scrapeDataAndWriteFile({ link, data, depth }))
              .catch((err) => {
                console.log('Caught error in .then():', err.message);
                process.exit(1);
              });
          } catch (err) {
            console.log('Caught error:', err.message);
            process.exit(1);
          }
        })
      ).then(() => {
        // console.log(finalObject);
        process.exit(0);
      });
    });
};

scrapeContent({ startLink: bbcIgbo, depth: 0 });
