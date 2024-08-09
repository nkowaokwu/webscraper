import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import { compact, values, trim } from 'lodash';

const igboNames = 'https://www.myigboname.com';
const namesCategory = '/start-with';
const letters = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'R',
  'S',
  'T',
  'U',
  'W',
  'Z',
].map((letter) => letter.toLowerCase());
var dir = './igbo_names';
const filePath = './igbo_names/names.json';
const letterToNames = {};

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const fetchAllNames = async () => {
  await Promise.all(
    letters.map(async (letter) => {
      const url = `${igboNames}${namesCategory}/${letter}`;

      return axios.get(url).then(({ data }) => {
        const $ = cheerio.load(data);
        const listOfNames = values($('.ui.list'))[0];
        const names = compact(
          listOfNames.children.map((element) => trim($(element).text()))
        );
        letterToNames[letter] = names;
      });
    })
  );

  console.log(letterToNames);
  fs.writeFileSync(filePath, JSON.stringify(letterToNames, null, 2));
};

fetchAllNames();
