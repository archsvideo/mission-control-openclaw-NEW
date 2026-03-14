import csv, pathlib, html, base64

base = pathlib.Path(r"C:\Users\Oscar\.openclaw\workspace\reports\calendar-v12-arch-pro")
manifest = base / "manifest.csv"
out = base / "index-pro.html"
out_single = base / "index-pro-standalone.html"

rows = list(csv.DictReader(manifest.open('r', encoding='utf-8')))

pillar_map = {
    'Debate': ('Awareness', 'Carrusel 4-6 slides', 'Comenta tu postura', '09:30', 'ER > 4%'),
    'Proceso': ('Consideration', 'Imagen + mini-hilo', 'Guarda este proceso', '12:30', 'Saves > 3%'),
    'Educativo': ('Consideration', 'Carrusel educativo', '¿Quieres plantilla?', '10:00', 'Saves > 5%'),
    'Caso real': ('Decision', 'Caso + resultado', 'DM para diagnóstico', '13:00', 'CTR perfil > 2%'),
    'Opinión': ('Awareness', 'Post corto + imagen', '¿Estás de acuerdo?', '09:00', 'Comments > 15'),
    'BTS': ('Trust', 'Foto proceso + contexto', 'Guárdalo para referencia', '18:30', 'Watch/Read depth'),
    'Roundup': ('Trust', 'Resumen semanal', '¿Qué tema seguimos?', '20:00', 'Saves + Replies'),
    'Masterplan': ('Authority', 'Visual técnico potente', 'Comparte con tu equipo', '11:30', 'Shares > 2%'),
    'Story': ('Trust', 'Historia de proyecto', '¿Te pasó algo similar?', '19:00', 'Comments qual.'),
    'Interiores': ('Portfolio', 'Imagen hero + detalle', 'DM para presupuesto', '17:30', 'Leads inbound'),
    'Herramientas': ('Authority', 'Stack/workflow visual', 'Pide checklist', '16:00', 'Saves > 4%'),
    'Oferta': ('Conversion', 'Oferta clara', 'Agenda llamada', '14:00', 'Leads > baseline'),
    'Autoridad': ('Authority', 'Checklist técnico', 'Te envío versión editable', '10:30', 'Saves + DMs'),
    'Caso': ('Decision', 'Validación previa', 'Agenda revisión', '12:00', 'DM intent'),
    'Prueba social': ('Trust', 'FAQ real', 'Responde con tu duda', '18:00', 'Comments + DMs'),
    'Cierre mes': ('Trust', 'Lecciones del mes', '¿Qué repetimos?', '20:30', 'Engagement mix'),
    'Evergreen': ('Authority', 'Guía práctica', 'Guárdalo', '11:00', 'Saves'),
    'Lead magnet': ('Conversion', 'Plantilla gratuita', 'Comenta “plantilla”', '15:00', 'Leads')
}


def img_src(day: int, standalone=False):
    p = base / 'assets' / f'day-{day:02d}.jpg'
    if day <= 3 and p.exists():
        if standalone:
            b64 = base64.b64encode(p.read_bytes()).decode('ascii')
            return f"data:image/jpeg;base64,{b64}"
        return f"assets/day-{day:02d}.jpg"
    return None


def build(standalone=False):
    parts = []
    parts.append("<!doctype html><html lang='es'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Calendario ARCH-S v12 Pro</title>")
    parts.append("<style>body{font-family:Inter,Arial;background:#0f1730;color:#eaf0ff}.wrap{max-width:1700px;margin:auto;padding:20px}table{width:100%;border-collapse:collapse;background:#121a33}th,td{border:1px solid #243156;padding:8px;vertical-align:top}th{background:#162246;position:sticky;top:0}img{width:260px;height:146px;object-fit:cover;border-radius:8px}.pill{border:1px solid #3a4c84;border-radius:999px;padding:2px 8px;font-size:11px}.muted{color:#9fb0d9}.small{font-size:12px;color:#b9c8ef}h1{margin:0 0 8px}.k{display:inline-block;margin-right:12px;background:#0d1631;border:1px solid #2b3b6b;padding:4px 8px;border-radius:8px;font-size:12px}</style></head><body><div class='wrap'>")
    parts.append("<h1>Calendario mensual v12 PRO (arquitectura, sin personas)</h1>")
    parts.append("<p class='muted'>Versión profesional con: objetivo de embudo, formato, CTA, hora recomendada, KPI objetivo y prompt detallado por día. Días 1-3 ya generados con Nano Banana 2.</p>")
    parts.append("<div><span class='k'>Canal: LinkedIn</span><span class='k'>Zona: Europe/Madrid</span><span class='k'>Frecuencia: 1 post/día</span><span class='k'>Estilo visual: proyectos arquitectónicos sin personas</span></div><br>")
    parts.append("<table><thead><tr><th>Día</th><th>Pilar</th><th>Gancho</th><th>Embudo</th><th>Formato</th><th>CTA</th><th>Hora</th><th>KPI objetivo</th><th>Prompt imagen (detallado)</th><th>Preview</th><th>Publicado</th></tr></thead><tbody>")

    for r in rows:
        d = int(r['day'])
        pillar = r['pillar']
        funnel, fmt, cta, t, kpi = pillar_map.get(pillar, ('Consideration', 'Imagen', 'Guardar', '12:00', 'ER'))
        src = img_src(d, standalone=standalone)
        preview = f"<img src='{src}' alt='dia {d}'>" if src else "<span class='muted'>Pendiente</span>"
        parts.append(
            "<tr>"
            f"<td>{d}</td>"
            f"<td><span class='pill'>{html.escape(pillar)}</span></td>"
            f"<td>{html.escape(r['hook'])}</td>"
            f"<td class='small'>{html.escape(funnel)}</td>"
            f"<td class='small'>{html.escape(fmt)}</td>"
            f"<td class='small'>{html.escape(cta)}</td>"
            f"<td><b>{html.escape(t)}</b></td>"
            f"<td class='small'>{html.escape(kpi)}</td>"
            f"<td class='small'>{html.escape(r['image_prompt_detailed'])}</td>"
            f"<td>{preview}</td>"
            f"<td><label><input type='checkbox'/> Listo</label></td>"
            "</tr>"
        )

    parts.append("</tbody></table></div></body></html>")
    return ''.join(parts)

out.write_text(build(standalone=False), encoding='utf-8')
out_single.write_text(build(standalone=True), encoding='utf-8')
print('built', out)
print('built', out_single)
