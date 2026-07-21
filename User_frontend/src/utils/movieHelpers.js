export const groupMoviesByBaseName = (moviesList) => {
  if (!moviesList || !moviesList.length) return [];

  const groups = {};
  moviesList.forEach((movie) => {
    if (!movie) return;
    
    // Clean name logic:
    // Remove (HINDI), (ENGLISH), (H), (E), (TELUGU), etc.
    let baseName = movie.name || "";
    // Remove parentheses contents (e.g. (HINDI), (ENGLISH))
    baseName = baseName.replace(/\s*\([^)]*\)/g, "");
    // Remove "3D" or "2D" from the name
    baseName = baseName.replace(/\b(3D|2D)\b/gi, "");
    // Clean up colons, spaces, dashes
    baseName = baseName.replace(/\s+/g, " ").trim();
    baseName = baseName.replace(/^[:-\s]+|[:-\s]+$/g, "").trim().toUpperCase();

    if (!groups[baseName]) {
      groups[baseName] = [];
    }
    groups[baseName].push(movie);
  });

  return Object.keys(groups).map((baseName) => {
    const group = groups[baseName];
    // Find representative with a valid poster
    const representative = group.find((m) => m.poster) || group[0];
    return {
      ...representative,
      versions: group,
    };
  });
};
