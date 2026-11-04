async function inspectLayout() {
  const cinemaId = "CN24";
  const sessionId = 16099;
  const layoutRes = await fetch(`http://14.194.50.141/api.asmx/GetSeatLayout?strCinemaId=${cinemaId}&strTransId=&strSessId=${sessionId}`);
  const layoutData = await layoutRes.json();
  console.log("LayoutData keys:", Object.keys(layoutData.data || {}));
  console.log("Sample layoutData item:", Array.isArray(layoutData.data) ? layoutData.data[0] : layoutData.data);
}

inspectLayout().catch(console.error);
