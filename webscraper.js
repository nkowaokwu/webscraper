import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import { filter, trim, map, reduce, split } from 'lodash';

const bbc = 'https://bbc.com';
const bbcIgbo = 'https://bbc.com/igbo';
const articleBase = '/igbo/afirika-';

const finalObject = {}

var dir = './articles';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

axios.get(bbcIgbo)
  .then(({ data }) => {
    try {
      const $ = cheerio.load(data);
      const articleLinks = filter($('a').map((_, anchor) => (
        $(anchor).attr('href')
      )), (anchorLink) => anchorLink.startsWith(articleBase));
      return articleLinks;
    } catch (err) {
      console.log('Anchor error:', err.message);
      process.exit(1);
    }
  })
  .then((articleLinks) => {
    Promise.all(map(articleLinks, (link) => {
      try {
        return axios.get(`${bbc}${link}`)
          .then(({ data }) => {
            const $ = cheerio.load(data);
            const docName = split(link, '/')[2].split('-')[1]
            finalObject[docName] = { published: '', sentences: [] };
            finalObject[docName].published = $('time').first().text();
            finalObject[docName].sentences = reduce($('p, li').map((_, text) => {
              const finalText = $(text).text().replace(/^([0-9:\.])+/g, '');
              return finalText;
            }
            ), (listOfSentences, sentence) => {
              listOfSentences.push(trim(sentence));
              return listOfSentences;
            }, []);
            const filePath = `articles/${docName}.json`;
            // Writes to file if it doesn't exist
            if (!fs.existsSync(filePath)) {
              fs.writeFileSync(filePath, JSON.stringify(finalObject[docName], null, 2))
              console.log(`Successfully wrote ${docName}`);
            }
          })
          .catch((err) => {
            console.log('Caught error in .then():', err.message);
            process.exit(1);
          });
      } catch (err) {
        console.log('Caught error:', err.message);
        process.exit(1);
      }
    }))
      .then(() => {
        console.log(finalObject);
        process.exit(0);
      });
});