const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(process.cwd(), 'data', 'anime.db');

try {
  // Check if file exists before attempting to delete
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Successfully deleted anime.db');
  } else {
    console.log('anime.db does not exist');
  }
} catch (error) {
  if (error.code === 'EBUSY') {
    console.error('Database file is busy. Please close all connections and try again.');
    console.error('Try these steps:');
    console.error('1. Stop your Next.js development server');
    console.error('2. Close any database management tools');
    console.error('3. If on Windows, check Task Manager for node.js processes');
  } else {
    console.error('Error deleting database:', error);
  }
  process.exit(1);
}
