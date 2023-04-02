import fs from 'fs';

let count = 0;
const BATCH_SIZE = 1000;
const skipRegex = [
  /^©/,
  /^AdChoices/,
  /^</,
];

fs.readdir('./articles', (err, files) => {
  files.forEach((file) => {
    const fileData = fs.readFileSync(`./articles/${file}`, 'utf8');
    JSON.parse(fileData).sentences.forEach((line) => {
      const rawLine = (line.match(/(?![Vidio, ]).*(?=, Duration)/g) || [line])[0]
        .replaceAll(/\"/g, '')
      if (skip)
      console.log(rawLine);
      count += 1;
    })
  })
  console.log({ count })
});
