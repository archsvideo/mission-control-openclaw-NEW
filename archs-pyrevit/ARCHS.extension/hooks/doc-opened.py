# -*- coding: utf-8 -*-
"""
ARCH-S autonomous hook
Runs when a document is opened in Revit.
If there is a matching job JSON in revit-autonomy/jobs/inbox, executes tasks automatically.
"""
import os
import json
import traceback

from Autodesk.Revit.DB import (
    FilteredElementCollector, ViewFamilyType, ViewFamily, ViewPlan, Level,
    BuiltInCategory, BuiltInParameter, Wall, LocationCurve, XYZ, Transaction,
    UnitUtils, UnitTypeId, WallFunction, Family
)
from Autodesk.Revit.DB.Structure import StructuralType
import clr


ROOT = r"C:\Users\Oscar\.openclaw\workspace\revit-autonomy"
INBOX = os.path.join(ROOT, "jobs", "inbox")
DONE = os.path.join(ROOT, "jobs", "done")
FAILED = os.path.join(ROOT, "jobs", "failed")
OUT = os.path.join(ROOT, "output")
FAM_DEFAULT = r"C:\Users\Oscar\.openclaw\workspace\families\Wall-Receptacle.rfa"

for p in (INBOX, DONE, FAILED, OUT):
    if not os.path.exists(p):
        os.makedirs(p)


def m_to_ft(v):
    return UnitUtils.ConvertToInternalUnits(v, UnitTypeId.Meters)


def type_name(elem):
    try:
        return elem.Name
    except Exception:
        p = elem.get_Parameter(BuiltInParameter.SYMBOL_NAME_PARAM)
        return (p.AsString() if p and p.HasValue else "")


def unique_name(doc, base):
    names = set(v.Name for v in FilteredElementCollector(doc).OfClass(ViewPlan))
    if base not in names:
        return base
    i = 2
    while True:
        n = "{} ({})".format(base, i)
        if n not in names:
            return n
        i += 1


def create_electrical_views(doc):
    levels = sorted(list(FilteredElementCollector(doc).OfClass(Level)), key=lambda l: l.Elevation)
    vft = None
    for t in FilteredElementCollector(doc).OfClass(ViewFamilyType):
        if t.ViewFamily == ViewFamily.ElectricalPlan:
            vft = t
            break
    if vft is None:
        raise Exception("No ElectricalPlan ViewFamilyType found")

    created = []
    tr = Transaction(doc, "ARCH-S Auto | Create Electrical Views")
    tr.Start()
    try:
        existing = set(v.Name for v in FilteredElementCollector(doc).OfClass(ViewPlan))
        for lvl in levels:
            base = "ELEC - {}".format(lvl.Name)
            if base in existing:
                continue
            vp = ViewPlan.Create(doc, vft.Id, lvl.Id)
            vp.Name = unique_name(doc, base)
            created.append(vp.Name)
        tr.Commit()
    except Exception:
        tr.RollBack()
        raise
    return {"created_views": len(created), "names": created}


def is_internal_wall(w):
    try:
        return w.WallType and w.WallType.Function == WallFunction.Interior
    except Exception:
        p = w.get_Parameter(BuiltInParameter.WALL_ATTR_FUNCTION_PARAM)
        return p and p.HasValue and p.AsInteger() == 0


def get_symbols(doc):
    return list(FilteredElementCollector(doc).OfCategory(BuiltInCategory.OST_ElectricalFixtures).WhereElementIsElementType())


def load_default_family(doc):
    if not os.path.exists(FAM_DEFAULT):
        return False
    t = Transaction(doc, "ARCH-S Auto | Load outlet family")
    t.Start()
    try:
        fam_ref = clr.Reference[Family]()
        ok = doc.LoadFamily(FAM_DEFAULT, fam_ref)
        t.Commit()
        return bool(ok)
    except Exception:
        t.RollBack()
        return False


def place_outlets_internal_2m(doc):
    symbols = get_symbols(doc)
    if not symbols and load_default_family(doc):
        doc.Regenerate()
        symbols = get_symbols(doc)
    if not symbols:
        raise Exception("No electrical fixture symbols found")

    keywords = ["toma", "tomacorr", "recept", "outlet", "socket", "enchufe"]
    candidates = []
    for s in symbols:
        txt = ("{} {}".format(s.FamilyName, type_name(s))).lower()
        if any(k in txt for k in keywords):
            candidates.append(s)
    if not candidates:
        candidates = symbols
    picked = candidates[0]

    spacing = m_to_ft(2.0)
    end_offset = m_to_ft(0.2)
    height = m_to_ft(0.30)

    walls = [w for w in FilteredElementCollector(doc).OfClass(Wall) if is_internal_wall(w)]
    if not walls:
        return {"walls": 0, "placed": 0, "type": "none"}

    placed = 0
    tr = Transaction(doc, "ARCH-S Auto | Place outlets every 2m")
    tr.Start()
    try:
        if not picked.IsActive:
            picked.Activate()
            doc.Regenerate()

        for w in walls:
            loc = w.Location
            if not isinstance(loc, LocationCurve):
                continue
            curve = loc.Curve
            length = curve.Length
            if length <= (2 * end_offset):
                continue
            level = doc.GetElement(w.LevelId)
            if level is None:
                continue
            d = end_offset
            while d < (length - end_offset):
                p = curve.Evaluate(d / length, True)
                p = XYZ(p.X, p.Y, level.Elevation + height)
                doc.Create.NewFamilyInstance(p, picked, w, level, StructuralType.NonStructural)
                placed += 1
                d += spacing
        tr.Commit()
    except Exception:
        tr.RollBack()
        raise

    return {"walls": len(walls), "placed": placed, "type": "{} : {}".format(picked.FamilyName, type_name(picked))}


def model_matches(open_doc, model_path):
    if not model_path:
        return True
    a = os.path.normcase(os.path.normpath(open_doc.PathName or ""))
    b = os.path.normcase(os.path.normpath(model_path.replace('/', '\\')))
    if a and b and a == b:
        return True
    # fallback by filename
    return os.path.basename(a) == os.path.basename(b)


def process_job(doc, job_file):
    job_path = os.path.join(INBOX, job_file)
    with open(job_path, 'r') as f:
        job = json.load(f)

    if not model_matches(doc, job.get('modelPath')):
        return False

    report = {
        "job": job_file,
        "doc": doc.PathName,
        "ok": True,
        "tasks": []
    }
    try:
        for t in job.get('tasks', []):
            name = t.get('name')
            if name == 'create_electrical_views':
                r = create_electrical_views(doc)
            elif name == 'place_outlets_internal_2m':
                r = place_outlets_internal_2m(doc)
            else:
                raise Exception("Unknown task: {}".format(name))
            report['tasks'].append({"name": name, "ok": True, "result": r})
    except Exception as ex:
        report['ok'] = False
        report['error'] = str(ex)
        report['trace'] = traceback.format_exc()

    stamp = __import__('datetime').datetime.now().strftime('%Y%m%d-%H%M%S')
    rep_file = os.path.join(OUT, 'hook-report-{}-{}.json'.format(stamp, job_file))
    with open(rep_file, 'w') as rf:
        json.dump(report, rf, indent=2)

    target = DONE if report['ok'] else FAILED
    os.rename(job_path, os.path.join(target, job_file))
    return True


# ENTRY
uidoc = __revit__.ActiveUIDocument
if uidoc and uidoc.Document and os.path.exists(INBOX):
    for jf in sorted([x for x in os.listdir(INBOX) if x.lower().endswith('.json')]):
        try:
            process_job(uidoc.Document, jf)
        except Exception:
            pass
