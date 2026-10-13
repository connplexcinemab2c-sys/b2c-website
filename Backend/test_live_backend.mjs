import axios from 'axios';

const BASE_URL = 'https://backend.theconnplex.com/api';

async function main() {
  const regionsRes = await axios.get(`${BASE_URL}/user/get-region`);
  console.log('Total active regions on live backend:', regionsRes.data?.data?.length);

  const allCinemasRes = await axios.get(`${BASE_URL}/user/get-all-cinema`);
  console.log('Total cinemas in get-all-cinema on live backend:', allCinemasRes.data?.data?.length);

  const targetCinemas = [
    { id: 'CN01', name: 'AHILYANAGAR', regionId: '65c1da3d65d1f285d00320d0' },
    { id: 'CN42', name: 'ADANI SHANTIGRAM', regionId: '64da17939cdcb529a693aac2' },
    { id: 'CN30', name: 'MPM MALL', regionId: '68d3d34064c67c80b94e1ec0' },
    { id: 'CN93', name: 'JAGDALPUR', regionId: '6a54d28d436989d460e2694d' },
    { id: 'CN26', name: 'MADHUBANI', regionId: '68403ec56318586850b625ed' },
    { id: 'CN35', name: 'MUNDRA', regionId: '693bbce6d3617ef9687c1cad' },
    { id: 'CN95', name: 'BHIKHANA PAHARI', regionId: '655f4ad8ce7b06677ad5f70a' },
    { id: 'CN39', name: 'TRIBECA', regionId: '69bd5e2e5637b0a44da23e31' },
    { id: 'CN96', name: 'SOLAPUR', regionId: '6a810384e02d4a3a7ee1818e' },
    { id: 'CN44', name: 'JUNAGADH', regionId: '6a4670734a5d2aee11b1bd65' },
  ];

  for (const tc of targetCinemas) {
    console.log(`\n---------------- ${tc.id}: ${tc.name} ----------------`);
    
    // Check if region is in regions list
    const regionFound = regionsRes.data?.data?.find(r => r._id === tc.regionId || r.region?.toLowerCase().includes(tc.name.toLowerCase()));
    console.log(`Region in get-region: ${regionFound ? regionFound.region : 'NOT FOUND'}`);

    // Check if in get-all-cinema
    const inAllCinemas = allCinemasRes.data?.data?.find(c => c.cinemaName?.toLowerCase().includes(tc.name.toLowerCase()) || c._id === tc.id);
    console.log(`In get-all-cinema: ${inAllCinemas ? inAllCinemas.cinemaName : 'NOT FOUND'}`);

    // Check get-cinema-by-region
    try {
      const cRes = await axios.get(`${BASE_URL}/user/get-cinema-by-region/${tc.regionId}`);
      console.log(`get-cinema-by-region count: ${cRes.data?.data?.length || 0}`);
      const matched = cRes.data?.data?.find(c => c.cinemaId === tc.id);
      console.log(`  Found target cinema? ${!!matched}`);
    } catch (e) {
      console.log(`get-cinema-by-region ERROR: ${e.response?.status} - ${e.message}`);
    }

    // Check get-movies-by-region
    try {
      const mRes = await axios.get(`${BASE_URL}/user/get-movies-by-region/${tc.regionId}`);
      console.log(`get-movies-by-region count: ${mRes.data?.data?.length || 0}`);
    } catch (e) {
      console.log(`get-movies-by-region ERROR: ${e.response?.status} - ${e.message}`);
    }
  }
}

main().catch(console.error);
