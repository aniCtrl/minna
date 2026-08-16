const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

export async function searchMovies(query) {
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch movies from TMDB");
  }

  const data = await response.json();

  return data.results;
}

export async function getMovieDetails(movieId) {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}`,
    {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch movie details from TMDB");
  }

  return response.json();
}