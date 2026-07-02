/**
 * Full-bleed colorful background shared by every page — fixed to the viewport
 * so it stretches to any window width and stays vivid while scrolling.
 */
export default function PastelBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* base pastel wash so nothing is ever plain white */}
      <div className="absolute inset-0 bg-gradient-to-br from-blossom/50 via-butter/40 to-babyblue/50" />
      {/* blobs spread across the whole viewport (percent-based positions) */}
      <div className="absolute left-[-10%] top-[-12%] h-[34rem] w-[34rem] rounded-full bg-blossom/80 blur-3xl" />
      <div className="absolute right-[-8%] top-[-8%] h-[30rem] w-[30rem] rounded-full bg-babyblue/80 blur-3xl" />
      <div className="absolute left-[18%] top-[28%] h-[26rem] w-[26rem] rounded-full bg-butter/80 blur-3xl" />
      <div className="absolute right-[8%] top-[42%] h-[24rem] w-[24rem] rounded-full bg-mint/70 blur-3xl" />
      <div className="absolute left-[-8%] bottom-[-14%] h-[30rem] w-[30rem] rounded-full bg-lilac/70 blur-3xl" />
      <div className="absolute right-[22%] bottom-[-10%] h-[24rem] w-[24rem] rounded-full bg-peach/70 blur-3xl" />
      <div className="absolute left-[45%] top-[5%] h-72 w-72 rounded-full bg-mint/50 blur-3xl" />
    </div>
  );
}
