# -*- coding: utf-8 -*-
from Autodesk.Revit.DB import (
    BuiltInCategory, FilteredElementCollector, FamilySymbol,
    BuiltInParameter, Wall, LocationCurve, XYZ, Transaction,
    UnitUtils, UnitTypeId, WallFunction
)
from Autodesk.Revit.DB.Structure import StructuralType
from Autodesk.Revit.UI import TaskDialog

try:
    from pyrevit import forms
except Exception:
    forms = None


def m_to_ft(val_m):
    return UnitUtils.ConvertToInternalUnits(val_m, UnitTypeId.Meters)


def is_internal_wall(wall):
    try:
        wtype = wall.WallType
        return wtype is not None and wtype.Function == WallFunction.Interior
    except Exception:
        # Fallback by parameter (0 interior in most templates)
        p = wall.get_Parameter(BuiltInParameter.WALL_ATTR_FUNCTION_PARAM)
        if p and p.HasValue:
            return p.AsInteger() == 0
        return False


uidoc = __revit__.ActiveUIDocument
doc = uidoc.Document

# Collect outlet symbols
symbols = list(
    FilteredElementCollector(doc)
    .OfCategory(BuiltInCategory.OST_ElectricalFixtures)
    .WhereElementIsElementType()
)

if not symbols:
    TaskDialog.Show("ARCH-S", "No hay familias cargadas en Electrical Fixtures.\nCarga una familia de tomacorriente y vuelve a intentar.")
    raise Exception("No electrical fixture symbols")

# Filter likely outlet symbols
keywords = ["toma", "tomacorr", "recept", "outlet", "socket", "enchufe"]
candidates = []
for s in symbols:
    text = ("{} {}".format(s.FamilyName, s.Name)).lower()
    if any(k in text for k in keywords):
        candidates.append(s)

if not candidates:
    candidates = symbols

picked = None
if forms and len(candidates) > 1:
    opts = ["{} : {}".format(s.FamilyName, s.Name) for s in candidates]
    chosen = forms.SelectFromList.show(
        opts,
        title="Selecciona familia/tipo de tomacorriente",
        multiselect=False,
        button_name="Usar este tipo"
    )
    if not chosen:
        raise Exception("Operación cancelada")
    picked = candidates[opts.index(chosen)]
else:
    picked = candidates[0]

spacing = m_to_ft(2.0)
end_offset = m_to_ft(0.2)
height = m_to_ft(0.30)

walls = [w for w in FilteredElementCollector(doc).OfClass(Wall) if is_internal_wall(w)]

if not walls:
    TaskDialog.Show("ARCH-S", "No encontré muros internos (Interior) en el proyecto.")
    raise Exception("No internal walls")

placed = 0
skipped = 0

tr = Transaction(doc, "ARCH-S | Outlets every 2m on internal walls")
tr.Start()
try:
    if not picked.IsActive:
        picked.Activate()
        doc.Regenerate()

    for w in walls:
        loc = w.Location
        if not isinstance(loc, LocationCurve):
            skipped += 1
            continue

        curve = loc.Curve
        length = curve.Length
        if length <= (2 * end_offset):
            skipped += 1
            continue

        level = doc.GetElement(w.LevelId)
        if level is None:
            skipped += 1
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

TaskDialog.Show(
    "ARCH-S",
    "Listo ✅\n\nTipo usado: {} : {}\nMuros internos procesados: {}\nTomacorrientes colocados: {}\nMuros omitidos: {}".format(
        picked.FamilyName,
        picked.Name,
        len(walls),
        placed,
        skipped
    )
)
