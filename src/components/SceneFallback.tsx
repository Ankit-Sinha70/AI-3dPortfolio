export default function SceneFallback() {
  return (
    <div className="scene-fallback" aria-hidden="true">
      <div className="scene-fallback__halo" />
      <div className="scene-fallback__core" />
      <div className="scene-fallback__stars" />
      <style>{`
        .scene-fallback{position:absolute;inset:0;overflow:hidden;pointer-events:none;background:radial-gradient(circle at 62% 44%,rgba(75,220,205,.08),transparent 20%),radial-gradient(circle at 28% 70%,rgba(105,85,255,.07),transparent 28%)}
        .scene-fallback__halo,.scene-fallback__core,.scene-fallback__stars{position:absolute;left:62%;top:44%;transform:translate(-50%,-50%);border-radius:999px}
        .scene-fallback__halo{width:min(42vw,520px);aspect-ratio:1;border:1px solid rgba(125,232,218,.1);box-shadow:0 0 90px rgba(73,215,200,.07),inset 0 0 70px rgba(73,215,200,.035)}
        .scene-fallback__core{width:18px;height:18px;background:rgba(137,246,231,.8);box-shadow:0 0 35px rgba(137,246,231,.45)}
        .scene-fallback__stars{width:70vw;height:70vw;max-width:900px;max-height:900px;opacity:.28;background-image:radial-gradient(circle,rgba(255,255,255,.55) 0 1px,transparent 1.5px);background-size:47px 47px}
        @media(max-width:800px){.scene-fallback__halo{width:68vw}.scene-fallback__core,.scene-fallback__halo,.scene-fallback__stars{left:58%}}
      `}</style>
    </div>
  );
}
