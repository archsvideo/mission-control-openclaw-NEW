# -*- coding: utf-8 -*-
from Autodesk.Revit.DB import FilteredElementCollector, ViewFamilyType, ViewFamily, ViewPlan, Level, Transaction


def unique_name(doc, base):
    names = set(v.Name for v in FilteredElementCollector(doc).OfClass(ViewPlan))
    if base not in names:
        return base
    i = 2
    while True:
        n = '{} ({})'.format(base, i)
        if n not in names:
            return n
        i += 1

uidoc = __revit__.ActiveUIDocument
doc = uidoc.Document

levels = sorted(list(FilteredElementCollector(doc).OfClass(Level)), key=lambda x: x.Elevation)
vft = None
for t in FilteredElementCollector(doc).OfClass(ViewFamilyType):
    if t.ViewFamily == ViewFamily.ElectricalPlan:
        vft = t
        break

if vft is None:
    raise Exception('No ElectricalPlan ViewFamilyType found')

created = []
tr = Transaction(doc, 'ARCH-S Autonomy | Create Electrical Plan Views')
tr.Start()
try:
    existing = set(v.Name for v in FilteredElementCollector(doc).OfClass(ViewPlan))
    for lvl in levels:
        base = 'ELEC - {}'.format(lvl.Name)
        if base in existing:
            continue
        vp = ViewPlan.Create(doc, vft.Id, lvl.Id)
        vp.Name = unique_name(doc, base)
        created.append(vp.Name)
    tr.Commit()
except Exception:
    tr.RollBack()
    raise

print('CREATED_VIEWS={}'.format(len(created)))
for n in created:
    print(n)
