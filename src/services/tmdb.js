const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

export async function searchMovies(query, page = 1) {
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(
      query
    )}&page=${page}`,
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

  const enrichedResults = await Promise.all(
    data.results.map(async (movie) => {
      try {
        const details = await getMovieDetails(movie.id);
        return {
          ...movie,
          runtime: details.runtime ?? null,
          genres: details.genres ? details.genres.map((g) => g.name) : [],
        };
      } catch (err) {
        return movie;
      }
    })
  );

  return {
    results: enrichedResults,
    page: data.page,
    totalPages: data.total_pages,
  };
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