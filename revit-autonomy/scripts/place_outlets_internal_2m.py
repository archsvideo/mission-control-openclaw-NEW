# -*- coding: utf-8 -*-
from Autodesk.Revit.DB import (
    BuiltInCategory, FilteredElementCollector, BuiltInParameter,
    Wall, LocationCurve, XYZ, Transaction,
    UnitUtils, UnitTypeId, WallFunction, Family
)
from Autodesk.Revit.DB.Structure import StructuralType
import clr
import os


def m_to_ft(v):
    return UnitUtils.ConvertToInternalUnits(v, UnitTypeId.Meters)


def type_name(elem):
    try:
        return elem.Name
    except Exception:
        p = elem.get_Parameter(BuiltInParameter.SYMBOL_NAME_PARAM)
        return (p.AsString() if p and p.HasValue else '')


def is_internal_wall(w):
    try:
        return w.WallType and w.WallType.Function == WallFunction.Interior
    except Exception:
        p = w.get_Parameter(BuiltInParameter.WALL_ATTR_FUNCTION_PARAM)
        return p and p.HasValue and p.AsInteger() == 0


def get_symbols(doc):
    return list(FilteredElementCollector(doc).OfCategory(BuiltInCategory.OST_ElectricalFixtures).WhereElementIsElementType())


def try_load_default(doc):
    fam_path = r"C:\Users\Oscar\.openclaw\workspace\families\Wall-Receptacle.rfa"
    if not os.path.exists(fam_path):
        return False
    t = Transaction(doc, 'ARCH-S Autonomy | Load outlet family')
    t.Start()
    try:
        fref = clr.Reference[Family]()
        ok = doc.LoadFamily(fam_path, fref)
        t.Commit()
        return bool(ok)
    except Exception:
        t.RollBack()
        return False

uidoc = __revit__.ActiveUIDocument
doc = uidoc.Document

symbols = get_symbols(doc)
if not symbols and try_load_default(doc):
    doc.Regenerate()
    symbols = get_symbols(doc)
if not symbols:
    raise Exception('No electrical fixture symbols found')

keywords = ['toma','tomacorr','recept','outlet','socket','enchufe']
candidates = []
for s in symbols:
    txt = ('{} {}'.format(s.FamilyName, type_name(s))).lower()
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
    raise Exception('No internal walls found')

placed = 0
tr = Transaction(doc, 'ARCH-S Autonomy | Place outlets every 2m')
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

print('OUTLET_TYPE={} : {}'.format(picked.FamilyName, type_name(picked)))
print('INTERNAL_WALLS={}'.format(len(walls)))
print('OUTLETS_PLACED={}'.format(placed))
