export default function BackgroundBlobs() {
  return (
    <>
      <div
        className="fixed top-[-15%] left-[-10%] w-[65vw] h-[65vw] rounded-full pointer-events-none bg-gray-50"
        style={{ filter: "blur(70px)" }}
      />
      <div
        className="fixed bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full pointer-events-none bg-gray-50"
        style={{ filter: "blur(60px)" }}
      />
      <div
        className="fixed top-[35%] right-[15%] w-[35vw] h-[35vw] rounded-full pointer-events-none bg-gray-50"
        style={{ filter: "blur(50px)" }}
      />
    </>
  );
}
