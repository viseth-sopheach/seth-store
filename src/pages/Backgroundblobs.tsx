// ─── BackgroundBlobs ──────────────────────────────────────────────────────────
// Purely decorative ambient gradient orbs rendered at a fixed position.

export default function BackgroundBlobs() {
  return (
    <>
      <div
        className="fixed top-[-15%] left-[-10%] w-[65vw] h-[65vw] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(147,197,253,0.45) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
      <div
        className="fixed bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(216,180,254,0.4) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="fixed top-[35%] right-[15%] w-[35vw] h-[35vw] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(252,165,165,0.25) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
    </>
  );
}
