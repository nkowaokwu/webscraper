import fs from 'fs';
import _ from 'lodash';

// Just uploaded sentences-4.json

let count = 0;
const lines = [];
const BATCH_SIZE = 1000;
const skipRegex = [
  /^©/,
  /^AdChoices/,
  /^</,
  /Akụkọ/,
  /Egwuregwu/,
  /Ihe nkiri/,
  /Nke ka ewuewu/,
  /Akụkọ/,
  /Egwuregwu/,
  /Ihe nkiri/,
  /Nke ka ewuewu/,
  /BBC/,
  /Report/,
  /Reason/,
  /Spam/,
  /page/,
  /deleted/,
  /Administration/,
  /studied/,
  /financial/,
  /^-\s/g,
  /^\s-\s/g,
  /displaystyle/,
  /\p{Arabic}/,
  /\p{Armenian}/,
  /\p{Bengali}/,
  /\p{Bopomofo}/,
  /\p{Braille}/,
  /\p{Buhid}/,
  /\p{Canadian_Aboriginal}/,
  /\p{Cherokee}/,
  /\p{Cyrillic}/,
  /\p{Devanagari}/,
  /\p{Ethiopic}/,
  /\p{Georgian}/,
  /\p{Greek}/,
  /\p{Gujarati}/,
  /\p{Gurmukhi}/,
  /\p{Han}/,
  /\p{Hangul}/,
  /\p{Hanunoo}/,
  /\p{Hebrew}/,
  /\p{Hiragana}/,
  /\p{Inherited}/,
  /\p{Kannada}/,
  /\p{Katakana}/,
  /\p{Khmer}/,
  /\p{Lao}/,
  /\p{Limbu}/,
  /\p{Malayalam}/,
  /\p{Mongolian}/,
  /\p{Myanmar}/,
  /\p{Ogham}/,
  /\p{Oriya}/,
  /\p{Runic}/,
  /\p{Sinhala}/,
  /\p{Syriac}/,
  /\p{Tagalog}/,
  /\p{Tagbanwa}/,
  /\p{TaiLe}/,
  /\p{Tamil}/,
  /\p{Telugu}/,
  /\p{Thaana}/,
  /\p{Thai}/,
  /\p{Tibetan}/,
  /\p{Yi}/,
];

// // BBC Articles
// fs.readdir('./articles', (err, files) => {
//   files.forEach((file) => {
//     const fileData = fs.readFileSync(`./articles/${file}`, 'utf8');
//     JSON.parse(fileData).sentences.forEach((sentenceLine) => {
//       const rawSentenceLines = sentenceLine
//         .split('.')
//         .map((sentence) => sentence.trim());
//       rawSentenceLines.forEach((rawSentenceLine) => {
//         const rawLine = (rawSentenceLine.match(
//           /(?![Vidio, ]).*(?=, Duration)/g
//         ) || [rawSentenceLine])[0].replaceAll(/\"/g, '');
//         if (
//           skipRegex.find((regex) => rawLine.match(regex)) ||
//           !rawLine.match(/.* .*/)
//         ) {
//           // Handle this case
//         } else if (!lines.find(({ igbo }) => igbo === rawLine)) {
//           const cleanedLine = rawLine
//             .trim()
//             .replace(/^-/g, '')
//             .replace(/.*\/>/g, '')
//             .replace(/\s\s/g, ' ')
//             .replace(/Twitter/g, '')
//             .replace(/\/Twitter/g, '')
//             .replace(/[“”]/g, '');
//           // .replace(/”/g, '');
//           lines.push({ igbo: cleanedLine });
//         }
//         count += 1;
//       });
//     });
//   });
//   fs.writeFileSync(
//     './compiled-bbc-sentences.json',
//     JSON.stringify(lines, null, 2),
//     {
//       encoding: 'utf-8',
//     }
//   );
// });

// Wikipedia
let sentenceCount = 0;
let compiledSentences = [];
fs.readdir('./wikipedia', (err, files) => {
  files.forEach((file) => {
    const fileData = JSON.parse(fs.readFileSync(`./wikipedia/${file}`, 'utf8'));
    fileData.forEach((sentence) => {
      const splitSentences = _.compact(sentence.split(/\n|(\. )/));
      splitSentences.forEach((splitSentence) => {
        if (!skipRegex.find((regex) => splitSentence.match(regex))) {
          compiledSentences.push(splitSentence);
        }
      });
    });
    sentenceCount += 1;
    if (sentenceCount % BATCH_SIZE === 0) {
      compiledSentences = compiledSentences
        .map((sentence) =>
          sentence
            .replaceAll(/\t/g, ' ')
            .replaceAll(/\"/g, "'")
            .replaceAll(/\\/g, '')
            .replaceAll(/ ·/g, '')
            .replaceAll(/:/g, ' ')
            .replaceAll(/\./g, '')
            .replaceAll(/<.*>/g, '')
            .replaceAll(/''/g, '')
            .replaceAll(/\s{1,}/g, ' ')
        )
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 2)
        .map((sentence) => ({ igbo: sentence }));

      fs.writeFileSync(
        `./compiled/wikipedia/sentences-${sentenceCount / BATCH_SIZE}.json`,
        JSON.stringify(compiledSentences, null, 2),
        {
          encoding: 'utf-8',
        }
      );

      compiledSentences = [];
    }
  });
});
