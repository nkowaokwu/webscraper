import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import { filter, split, map, last, compact } from 'lodash';

const igboRadio = 'https://igboradio.com';

const dir = './articles/igbo_radio';
const files = [];

// Navigation links
const navbarAnchors = '.navbar-nav.navbar-left a.nav-link';
const navbarAnchorsDropdownMenu =
  '.nav-item.dropdown .nav-dropdown-menu a.dropdown-item';
const navbarLinkCategories = '.navbar .link-sub-category';

// List of Articles
const articleLink = 'div.post-item h3.title a';
const nextButtonLink = 'li.page-item:nth-last-child(2) a';

// Article Content
const postTitle = 'h1.post-title';
const firstPostDate = 'div.post-details-meta .item-meta:nth-child(2) span'; // Post and edit dates
const secondPostDate = 'div.post-details-meta .item-meta:nth-child(3) span'; // Post and edit dates
const postText = 'div.post-text p';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const urls = new Set();

const scrapeDataAndWriteFile = ({ link, data }) => {
  const $ = cheerio.load(data);
  const docName = last(split(link, `${igboRadio}/`));
  const $postTitle = $(postTitle).text();
  const $firstPostDate = $(firstPostDate).text();
  const $secondPostDate = $(secondPostDate).text().trim() || '';
  const $postText = $(postText)
    .text()
    .split('.')
    .map((line) => line.trim());

  const finalContent = {
    id: docName,
    data: {
      title: $postTitle,
      published: $firstPostDate,
      edited: $secondPostDate,
      sentences: compact($postText),
    },
  };

  return finalContent;
};

const navigateListOfArticles = async ({ link, data }) => {
  const $ = cheerio.load(data);
  let $nextButtonLink = $(nextButtonLink);

  if (urls.has(link)) {
    return '';
  }

  urls.add(link);

  const articleLinks = filter(
    $(articleLink)
      .map((_, anchor) => $(anchor).attr('href'))
      .toArray(),
    (anchor) => anchor.startsWith('https://')
  );

  Promise.all(
    articleLinks.map(async (articleLink) => {
      if (urls.has(articleLink)) {
        return '';
      }

      urls.add(articleLink);
      const articleData = await axios
        .get(encodeURI(articleLink))
        .then(({ data: articleData }) =>
          scrapeDataAndWriteFile({ link: articleLink, data: articleData })
        )
        .catch((err) => {
          console.log('Unable to fetch article data');
        });

      files.push(articleData);
      return articleData;
    })
  );

  if (Boolean($nextButtonLink) && $nextButtonLink.attr('href')) {
    // Navigate to the next page
    const nextLink = $nextButtonLink.attr('href');
    const nextData = await axios
      .get(encodeURI(nextLink))
      .then(({ data }) => data);
    await navigateListOfArticles({ link: nextLink, data: nextData });
  }
};

const collectValidNavigationLinks = ({ data }) => {
  const $ = cheerio.load(data);

  const navbarAnchorHrefs = filter(
    $(navbarAnchors)
      .map((_, anchor) => $(anchor).attr('href'))
      .toArray(),
    (anchor) => anchor.startsWith('https://')
  );

  const navbarAnchorsDropdownMenuHrefs = filter(
    $(navbarAnchorsDropdownMenu)
      .map((_, anchor) => $(anchor).attr('href'))
      .toArray(),
    (anchor) => anchor.startsWith('https://')
  );

  const navbarLinkCategoryHrefs = filter(
    $(navbarLinkCategories)
      .map((_, anchor) => $(anchor).attr('href'))
      .toArray(),
    (anchor) => anchor.startsWith('https://')
  );

  return Array.from(
    new Set(
      navbarAnchorHrefs
        .concat(navbarAnchorsDropdownMenuHrefs)
        .concat(navbarLinkCategoryHrefs)
    )
  );
};

const visitStartLink = ({ data }) => {
  try {
    const navigationLinks = collectValidNavigationLinks({ data });
    return navigationLinks;
  } catch (err) {
    console.log('Anchor error:', err.message);
    process.exit(1);
  }
};

const scrapeContent = ({ startLink, depth }) => {
  return axios
    .get(encodeURI(startLink))
    .then(({ data }) => visitStartLink({ data }))
    .then(async (navigationLinks) => {
      await Promise.all(
        map(navigationLinks, (link) => {
          try {
            return axios
              .get(encodeURI(link))
              .then(
                async ({ data }) => await navigateListOfArticles({ link, data })
              )
              .catch((err) => {
                console.log('Caught error in .then():', err.message);
                process.exit(1);
              });
          } catch (err) {
            console.log('Caught error:', err.message);
            process.exit(1);
          }
        })
      );
    })
    .then(() => {
      compact(files).forEach(({ id, data }) => {
        fs.writeFileSync(`${dir}/${id}.json`, JSON.stringify(data, null, 2));
      });
    });
};

scrapeContent({ startLink: igboRadio, depth: 0 });
