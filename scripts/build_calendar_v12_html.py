import csv, pathlib, html

manifest = pathlib.Path(r"C:\Users\Oscar\.openclaw\workspace\reports\calendar-v12-arch-pro\manifest.csv")
out = pathlib.Path(r"C:\Users\Oscar\.openclaw\workspace\reports\calendar-v12-arch-pro\index.html")

rows = list(csv.DictReader(manifest.open('r', encoding='utf-8')))

parts = []
parts.append("<!doctype html><html lang='es'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Calendario v12 ARCH-S</title>")
parts.append("<style>body{font-family:Inter,Arial;background:#0f1730;color:#eaf0ff}.wrap{max-width:1500px;margin:auto;padding:20px}table{width:100%;border-collapse:collapse;background:#121a33}th,td{border:1px solid #243156;padding:8px;vertical-align:top}th{background:#162246}img{width:280px;height:158px;object-fit:cover;border-radius:8px}.pill{border:1px solid #3a4c84;border-radius:999px;padding:2px 8px;font-size:11px}.muted{color:#9fb0d9}</style></head><body><div class='wrap'>")
parts.append("<h1>Calendario mensual v12 (arquitectura, sin personas)</h1><p class='muted'>Prompts detallados por día. Imágenes generadas: días 1-3 (Nano Banana 2).</p>")
parts.append("<table><thead><tr><th>Día</th><th>Pilar</th><th>Gancho</th><th>Prompt imagen (detallado)</th><th>Preview</th></tr></thead><tbody>")

for r in rows:
    d = int(r['day'])
    img_cell = "<span class='muted'>Pendiente</span>"
    if d <= 3:
        img_cell = f"<img src='assets/day-{d:02d}.jpg' alt='dia {d}'>"
    parts.append("<tr>" +
                 f"<td>{d}</td>" +
                 f"<td><span class='pill'>{html.escape(r['pillar'])}</span></td>" +
                 f"<td>{html.escape(r['hook'])}</td>" +
                 f"<td>{html.escape(r['image_prompt_detailed'])}</td>" +
                 f"<td>{img_cell}</td>" +
                 "</tr>")

parts.append("</tbody></table></div></body></html>")
out.write_text("".join(parts), encoding='utf-8')
print('built', out)
