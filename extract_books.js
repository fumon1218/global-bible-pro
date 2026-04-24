const fs = require('fs');
const path = require('path');

const krvPath = path.join(__dirname, 'public/data/bible/krv.json');
const data = JSON.parse(fs.readFileSync(krvPath, 'utf8'));

const books = [];
for (let id in data.book) {
  const info = data.book[id].info;
  const chapters = Object.keys(data.book[id].chapter).length;
  books.push({
    id: info.shortname || `B${id}`, // Some might not have shortnames
    name: info.name,
    chapters: chapters,
    jsonId: id
  });
}

console.log(JSON.stringify(books, null, 2));
