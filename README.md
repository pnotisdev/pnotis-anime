# Animestugan.se

Animestugan.se is a web application that allows users to manage their anime watchlist. Users can register, log in, search for anime, add anime to their list, update the status of anime, and remove anime from their list. And visit other users profiles.

## Features

### User Authentication

- **Register**: Users can create a new account by providing a username and password.
- **Login**: Users can log in to their account using their username and password. Upon successful login, a token is stored in local storage for authentication.

### Anime Management

- **Search Anime**: Users can search for anime using the Jikan API. The search results are displayed with options to add anime to the user's list.
- **Add Anime**: Users can add anime to their list by selecting the status (watched, watching, want to watch) and specifying the current episode if applicable.
- **View Anime List**: Users can view their anime list, which displays the title, status, and current episode (if watching). As well as other profiles.
- **Update Anime**: Users can update the status and current episode of anime in their list.
- **Remove Anime**: Users can remove anime from their list.

### API Endpoints

- **/api/register**: Handles user registration.
- **/api/login**: Handles user login and returns a token.
- **/api/user**: Fetches the logged-in user's information.
- **/api/[username]/anime**: Handles CRUD operations for the user's anime list.

### Database

- **SQLite**: The application uses SQLite for storing user and anime data. The database is file-based and located in the `data` directory.

### Styling

- **Tailwind CSS**: The application uses Tailwind CSS for styling. Custom colors and themes are defined in the Tailwind configuration.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pnotis-anime.git
   cd pnotis-anime
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000/register`.
