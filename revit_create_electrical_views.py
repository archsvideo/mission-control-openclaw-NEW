# -*- coding: utf-8 -*-
from Autodesk.Revit.DB import FilteredElementCollector, ViewFamilyType, ViewFamily, ViewPlan, Level, Transaction


def unique_name(doc, base):
    existing = set(v.Name for v in FilteredElementCollector(doc).OfClass(ViewPlan))
    if base not in existing:
        return base
    i = 2
    while True:
        cand = "{} ({})".format(base, i)
        if cand not in existing:
            return cand
        i += 1

uidoc = __revit__.ActiveUIDocument
if uidoc is None or uidoc.Document is None:
    print("ERROR: No active document.")
    raise Exception("No active document")

doc = uidoc.Document

levels = list(FilteredElementCollector(doc).OfClass(Level))
levels = sorted(levels, key=lambda l: l.Elevation)

vft = None
for t in FilteredElementCollector(doc).OfClass(ViewFamilyType):
    if t.ViewFamily == ViewFamily.ElectricalPlan:
        vft = t
        break

if vft is None:
    print("ERROR: No ElectricalPlan ViewFamilyType found in this template/project.")
    raise Exception("Missing ElectricalPlan ViewFamilyType")

created = []

tr = Transaction(doc, "Create Electrical Plan Views")
tr.Start()
try:
    for lvl in levels:
        base = "ELEC - {}".format(lvl.Name)
        # skip if already exists
        exists = False
        for vp in FilteredElementCollector(doc).OfClass(ViewPlan):
            if vp.Name == base:
                exists = True
                break
        if exists:
            continue

        vp = ViewPlan.Create(doc, vft.Id, lvl.Id)
        vp.Name = unique_name(doc, base)
        created.append(vp.Name)

    tr.Commit()
except Exception:
    tr.RollBack()
    raise

print("OK: Created {} electrical views".format(len(created)))
for n in created:
    print(" - " + n)
