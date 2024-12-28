const db = require('./database');
const fetchAnimeData = require('./fetchData');

async function storeAnimeData() {
  const animeData = await fetchAnimeData();

  db.serialize(() => {
    const stmt = db.prepare("INSERT INTO anime (id, title, synopsis, episodes, score) VALUES (?, ?, ?, ?, ?)");

    animeData.forEach(anime => {
      stmt.run(anime.mal_id, anime.title, anime.synopsis, anime.episodes, anime.score);
    });

    stmt.finalize();
    console.log("Anime data stored in the database.");
  });
}

storeAnimeData();
