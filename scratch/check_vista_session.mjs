async function checkVista() {
  const cinemaId = 'CN06';
  const strSessId = '13635';

  try {
    const url = `http://14.194.50.141/api.asmx/GetSessionSeatLayout?strCinemaId=${cinemaId}&lngSessionId=${strSessId}`;
    console.log('Fetching layout from Vista:', url);
    const res = await fetch(url);
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response length:', text.length);
    console.log('Preview:', text.substring(0, 500));
  } catch (e) {
    console.error('Error fetching layout:', e.message);
  }
}

checkVista();
