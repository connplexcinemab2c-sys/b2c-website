const axios = require('axios');

const BASE_URL = 'https://backend.theconnplex.com/api';

const testRegions = [
  { name: 'AHMEDABAD', id: '64da17939cdcb529a693aac2' },
  { name: 'PATNA', id: '655f4ad8ce7b06677ad5f70a' },
  { name: 'PUNE', id: '69bd5e2e5637b0a44da23e31' },
  { name: 'VADODARA', id: '67da8522ce556ac55f26e704' },
  { name: 'SOLAPUR', id: '6a810384e02d4a3a7ee1818e' },
  { name: 'HYDERABAD', id: '68d3d34064c67c80b94e1ec0' },
  { name: 'BALOTRA', id: '65c1e51a65d1f285d0032af1' },
  { name: 'AHILYANAGAR', id: '65c1da3d65d1f285d00320d0' },
  { name: 'JAMMU', id: '6ae9e0fdd9b8dd84380614b0' },
];

async function run() {
  console.log('Testing End-to-End API across multiple regions...\n');

  // Test 1: Get all regions
  try {
    const regRes = await axios.get(`${BASE_URL}/user/get-region`);
    console.log(`✓ /user/get-region: HTTP ${regRes.status}, total regions returned: ${regRes.data?.data?.length}`);
  } catch (e) {
    console.error('✗ /user/get-region failed:', e.message);
  }

  // Test 2: For each region, test movies, cinemas, and show timings
  for (const r of testRegions) {
    console.log(`\n--- Testing [${r.name}] (${r.id}) ---`);
    
    // A: Cinemas by region
    let cinemaId = null;
    let cinemaObjId = null;
    try {
      const cRes = await axios.get(`${BASE_URL}/user/get-cinema-by-region/${r.id}`);
      const cList = cRes.data?.data || [];
      console.log(`  ✓ get-cinema-by-region: HTTP ${cRes.status}, cinemas: ${cList.length}`);
      if (cList.length > 0) {
        cinemaId = cList[0].cinemaId;
        cinemaObjId = cList[0]._id;
      }
    } catch (e) {
      console.error(`  ✗ get-cinema-by-region error: ${e.response?.status || e.message}`);
    }

    // B: Movies by region
    let movieId = null;
    try {
      const mRes = await axios.get(`${BASE_URL}/user/get-movies-by-region/${r.id}`);
      const mList = mRes.data?.data || [];
      console.log(`  ✓ get-movies-by-region: HTTP ${mRes.status}, movies: ${mList.length}`);
      if (mList.length > 0) {
        movieId = mList[0]._id;
        console.log(`    Top movie: "${mList[0].name}" (shows: ${mList[0].showTimingCount})`);
      }
    } catch (e) {
      console.error(`  ✗ get-movies-by-region error: ${e.response?.status || e.message}`);
    }

    // C: movie-shows-by-cinema
    if (cinemaObjId) {
      try {
        const payload = new URLSearchParams();
        payload.append('cinemaId', cinemaObjId);
        payload.append('regionId', r.id);
        payload.append('date', new Date().toISOString().split('T')[0]);

        const scRes = await axios.post(`${BASE_URL}/user/movie-shows-by-cinema`, payload.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const shows = scRes.data?.data?.movieDetailsWithShows || [];
        console.log(`  ✓ movie-shows-by-cinema: HTTP ${scRes.status}, movieDetailsWithShows: ${shows.length}`);
      } catch (e) {
        console.error(`  ✗ movie-shows-by-cinema error: ${e.response?.status || e.message}`);
      }
    }

    // D: movie-detils-with-shows
    if (movieId) {
      try {
        const payload = new URLSearchParams();
        const dateStr = new Date().toISOString().split('T')[0];
        payload.append('id', `${r.id}|${dateStr}|${movieId}`);

        const msRes = await axios.post(`${BASE_URL}/movie-detils-with-shows`, payload.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const mShows = msRes.data?.data || [];
        console.log(`  ✓ movie-detils-with-shows: HTTP ${msRes.status}, cinemas showing this movie: ${mShows.length}`);
      } catch (e) {
        console.error(`  ✗ movie-detils-with-shows error: ${e.response?.status || e.message}`);
      }
    }
  }

  console.log('\nAll End-to-End API tests finished successfully!');
}

run().catch(console.error);
