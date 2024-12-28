const db = require('./database');

function retrieveAnimeData() {
  db.serialize(() => {
    db.each("SELECT id, title, synopsis, episodes, score FROM anime", (err, row) => {
      if (err) {
        console.error('Error retrieving data:', err);
      } else {
        console.log(`${row.id}: ${row.title} - ${row.synopsis} (${row.episodes} episodes, Score: ${row.score})`);
      }
    });
  });
}

retrieveAnimeData();
