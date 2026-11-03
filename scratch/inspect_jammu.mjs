async function inspectJammu() {
  const res1 = await fetch("http://182.65.36.40/VistaWebService/clsbook.asmx?op=objExecute");
  console.log("=== objExecute ===");
  console.log(await res1.text());

  const res2 = await fetch("http://182.65.36.40/VistaWebService/clsbook.asmx?op=objTest");
  console.log("\n=== objTest ===");
  console.log(await res2.text());
}
inspectJammu();
