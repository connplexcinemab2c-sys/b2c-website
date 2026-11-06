async function testEndpoints() {
    const BASE = 'https://backend.theconnplex.com/api';
    console.log('Testing Production Ticketing Endpoints...\n');

    // 1. Ticketing Website HTML
    try {
        const t0 = Date.now();
        const res = await fetch('https://ticketing.theconnplex.com/');
        console.log(`[PASS] Frontend Homepage: HTTP ${res.status} in ${Date.now() - t0}ms`);
    } catch (e) {
        console.error(`[FAIL] Frontend Homepage:`, e.message);
    }

    // 2. Get Region
    let sampleRegionId = null;
    try {
        const t0 = Date.now();
        const res = await fetch(`${BASE}/user/get-region`);
        const json = await res.json();
        sampleRegionId = json.data?.[1]?._id; // Ahmedabad
        console.log(`[PASS] /user/get-region: HTTP ${res.status} (${json.data?.length} regions) in ${Date.now() - t0}ms`);
    } catch (e) {
        console.error(`[FAIL] /user/get-region:`, e.message);
    }

    // 3. Get Movies By Region (Ahmedabad)
    let sampleCinemaId = null;
    let sampleMovieId = null;
    try {
        const t0 = Date.now();
        const res = await fetch(`${BASE}/user/get-movies-by-region/${sampleRegionId}`);
        const json = await res.json();
        sampleCinemaId = json.data?.[0]?.cinemaObjectId?._id;
        sampleMovieId = json.data?.[0]?._id;
        console.log(`[PASS] /user/get-movies-by-region: HTTP ${res.status} (${json.data?.length} movies) in ${Date.now() - t0}ms`);
        if (json.data?.length) {
            console.log(`       Movies available: ${json.data.map(m => m.name).join(', ')}`);
        }
    } catch (e) {
        console.error(`[FAIL] /user/get-movies-by-region:`, e.message);
    }

    // 4. Upcoming Movies
    try {
        const t0 = Date.now();
        const res = await fetch(`${BASE}/upcoming-movies`);
        const json = await res.json();
        const totalUpcoming = json.data?.reduce((acc, g) => acc + (g.movies?.length || 0), 0);
        console.log(`[PASS] /upcoming-movies: HTTP ${res.status} (${totalUpcoming} upcoming movies across ${json.data?.length} months) in ${Date.now() - t0}ms`);
    } catch (e) {
        console.error(`[FAIL] /upcoming-movies:`, e.message);
    }

    // 5. Site Settings
    try {
        const t0 = Date.now();
        const res = await fetch(`${BASE}/user/site-setting`);
        console.log(`[PASS] /user/site-setting: HTTP ${res.status} in ${Date.now() - t0}ms`);
    } catch (e) {
        console.error(`[FAIL] /user/site-setting:`, e.message);
    }

    // 6. Movie Shows by Cinema
    if (sampleCinemaId && sampleRegionId) {
        try {
            const t0 = Date.now();
            const res = await fetch(`${BASE}/user/movie-shows-by-cinema`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cinemaId: sampleCinemaId,
                    regionId: sampleRegionId,
                    date: new Date().toISOString().split('T')[0]
                })
            });
            const json = await res.json();
            console.log(`[PASS] /user/movie-shows-by-cinema: HTTP ${res.status} (${json.data?.movieDetailsWithShows?.length || 0} movies with shows) in ${Date.now() - t0}ms`);
        } catch (e) {
            console.error(`[FAIL] /user/movie-shows-by-cinema:`, e.message);
        }
    }

    console.log('\nAll tests complete!');
}

testEndpoints();
