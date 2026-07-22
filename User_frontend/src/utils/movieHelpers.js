export const groupMoviesByBaseName = (moviesList) => {
  if (!moviesList || !moviesList.length) return [];

  const groups = {};
  moviesList.forEach((movie) => {
    if (!movie) return;

    let groupKey = "";
    if (movie.description && movie.description.trim().length > 10) {
      groupKey = "DESC_" + movie.description.trim().toLowerCase();
    } else {
      let baseName = movie.name || "";
      // Remove parentheses contents (e.g. (HINDI), (ENGLISH))
      baseName = baseName.replace(/\s*\([^)]*\)/g, "");
      // Remove "3D" or "2D" from the name
      baseName = baseName.replace(/\b(3D|2D)\b/gi, "");
      // Clean up colons, spaces, dashes
      baseName = baseName.replace(/\s+/g, " ").trim();
      baseName = baseName.replace(/^[:-\s]+|[:-\s]+$/g, "").trim().toUpperCase();
      groupKey = "NAME_" + baseName;
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(movie);
  });

  return Object.keys(groups).map((groupKey) => {
    const group = groups[groupKey];
    // Find representative with a valid poster
    const representative = group.find((m) => m.poster) || group[0];
    
    // Clean parenthesized language and format suffixes from display name
    let cleanDisplayName = representative.name || "";
    cleanDisplayName = cleanDisplayName.replace(/\s*\([^)]*\)/g, "");
    cleanDisplayName = cleanDisplayName.replace(/\b(3D|2D)\b/gi, "");
    cleanDisplayName = cleanDisplayName.replace(/\s+/g, " ").trim();
    cleanDisplayName = cleanDisplayName.replace(/^[:-\s]+|[:-\s]+$/g, "").trim();

    return {
      ...representative,
      name: cleanDisplayName || representative.name,
      versions: group,
    };
  });
};
