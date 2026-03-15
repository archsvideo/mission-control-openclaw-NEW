import base64
from pathlib import Path

base = Path(r"C:\Users\Oscar\.openclaw\workspace\reports\costarica-proposal-v1")
assets = base / "assets"
out = base / "index-standalone.html"

files = {
    'hero': assets / '01-masterplan.jpg',
    'plan1': assets / '02-plan-l1.jpg',
    'exta': assets / '03-exterior-a.jpg',
    'extb': assets / '04-exterior-b.jpg',
    'sun': assets / '05-exterior-sunset.jpg',
    'plan2': assets / '06-plan-l2.jpg',
}

def data_uri(p: Path):
    b = base64.b64encode(p.read_bytes()).decode('ascii')
    return f"data:image/jpeg;base64,{b}"

img = {k: data_uri(v) for k, v in files.items()}

html = f"""<!doctype html>
<html lang='es'>
<head>
  <meta charset='utf-8' />
  <meta name='viewport' content='width=device-width,initial-scale=1' />
  <title>ARCH-S · Costa Rica Ocean Villas</title>
  <style>
    :root{{--bg:#0d1014;--card:#121721;--soft:#9ca7ba;--text:#f1f5ff;--line:#263146;--accent:#88d2b5}}
    *{{box-sizing:border-box}} html,body{{margin:0;background:var(--bg);color:var(--text);font-family:Inter,Segoe UI,Arial}}
    .nav{{position:fixed;top:0;left:0;right:0;z-index:40;background:linear-gradient(to bottom,rgba(6,8,11,.9),rgba(6,8,11,.35),transparent);padding:16px 22px}}
    .navin{{max-width:1200px;margin:auto;display:flex;justify-content:space-between;align-items:center}}
    .brand{{font-weight:700;letter-spacing:.8px}}.menu{{display:flex;gap:14px;color:#d6def0;font-size:13px}}
    .hero{{min-height:92vh;position:relative;display:grid;place-items:end start;padding:120px 24px 40px}}
    .hero::before{{content:"";position:absolute;inset:0;background:url('{img['hero']}') center/cover no-repeat;filter:saturate(.95) contrast(1.02)}}
    .hero::after{{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,7,10,.25) 0%,rgba(5,7,10,.75) 70%,rgba(5,7,10,.95) 100%)}}
    .heroBox{{position:relative;z-index:2;max-width:1200px;width:100%;margin:auto}}
    .kicker{{display:inline-block;padding:6px 10px;border:1px solid #6aa893;border-radius:999px;font-size:12px;background:rgba(20,30,28,.4)}}
    h1{{font-size:clamp(34px,6vw,74px);line-height:.98;margin:14px 0 10px;max-width:900px}}
    .sub{{color:#d5deef;max-width:760px;font-size:17px}}
    .wrap{{max-width:1200px;margin:auto;padding:28px 22px 70px}}
    .stats{{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0 30px}}
    .stat{{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px}}
    .stat b{{font-size:22px;display:block}}.stat span{{color:var(--soft);font-size:12px}}
    .section{{margin:26px 0 38px}} .title{{font-size:24px;margin:0 0 12px}} .muted{{color:var(--soft)}}
    .grid2{{display:grid;grid-template-columns:1.1fr .9fr;gap:14px}} .card{{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px}}
    .img{{width:100%;display:block;border-radius:12px;object-fit:cover;max-height:520px}}
    .gallery{{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}} .gallery img{{width:100%;height:290px;object-fit:cover;border-radius:12px;border:1px solid #1e2739}}
    .plans{{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}} .plans img{{width:100%;height:auto;border-radius:12px;background:#fff}}
    .cta{{padding:24px;border:1px solid #3a4f72;background:linear-gradient(140deg,#132035,#121a2a);border-radius:16px;display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap}}
    .btn{{padding:10px 16px;background:var(--accent);color:#083526;font-weight:700;border-radius:10px}}
    @media (max-width:920px){{.stats{{grid-template-columns:repeat(2,1fr)}}.grid2,.gallery,.plans{{grid-template-columns:1fr}}.gallery img{{height:240px}}}}
  </style>
</head>
<body>
  <div class='nav'><div class='navin'><div class='brand'>ARCH-S · COSTA RICA</div><div class='menu'><span>Concepto</span><span>Vistas</span><span>Planos</span><span>Cierre</span></div></div></div>
  <section class='hero'><div class='heroBox'><span class='kicker'>Propuesta Arquitectónica · Demo Web</span><h1>Modern Tropical Apartments<br/>con vista al mar</h1><p class='sub'>Proyecto en Costa Rica: conjunto de apartamentos de 2 niveles y 2 habitaciones, diseñado para maximizar privacidad, ventilación natural y conexión directa con el paisaje costero.</p></div></section>
  <main class='wrap'>
    <div class='stats'><div class='stat'><b>2</b><span>Niveles por unidad</span></div><div class='stat'><b>2</b><span>Habitaciones</span></div><div class='stat'><b>Vista</b><span>Frente al océano</span></div><div class='stat'><b>Tropical</b><span>Lenguaje moderno</span></div></div>
    <section class='section grid2'><article class='card'><h2 class='title'>Concepto</h2><p class='muted'>La propuesta combina arquitectura contemporánea con una implantación orgánica en ladera. La volumetría escalonada prioriza visuales al mar, recorridos peatonales fluidos y espacios exteriores habitables.</p><p class='muted'>Materialidad cálida, terrazas amplias y relación interior-exterior como eje de diseño para experiencia residencial de alto valor en clima tropical.</p></article><div class='card'><img class='img' src='{img['exta']}'/></div></section>
    <section class='section'><h2 class='title'>Vistas del proyecto</h2><div class='gallery'><img src='{img['hero']}'/><img src='{img['exta']}'/><img src='{img['extb']}'/><img src='{img['sun']}'/><img src='{img['exta']}'/><img src='{img['extb']}'/></div></section>
    <section class='section'><h2 class='title'>Plantas arquitectónicas</h2><div class='plans'><div class='card'><img src='{img['plan1']}'/></div><div class='card'><img src='{img['plan2']}'/></div></div></section>
    <section class='section'><div class='cta'><div><h2 class='title' style='margin:0 0 6px'>¿Quieres esta propuesta en formato cliente final?</h2><p class='muted' style='margin:0'>Siguiente paso: versión completa con memoria técnica, acabados, inversión y cronograma en la misma web.</p></div><span class='btn'>Solicitar versión final</span></div></section>
  </main>
</body>
</html>"""

out.write_text(html, encoding='utf-8')
print(out)
