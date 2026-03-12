# -*- coding: utf-8 -*-
from Autodesk.Revit.DB import (
    BuiltInCategory, FilteredElementCollector, FamilySymbol, LocationCurve,
    XYZ, Transaction, StructuralType, UnitUtils, UnitTypeId
)
from Autodesk.Revit.UI import TaskDialog


def m_to_ft(m):
    return UnitUtils.ConvertToInternalUnits(m, UnitTypeId.Meters)

uidoc = __revit__.ActiveUIDocument
doc = uidoc.Document

sel_ids = list(uidoc.Selection.GetElementIds())
if not sel_ids:
    TaskDialog.Show("pyRevit", "Selecciona primero los muros donde quieres colocar tomacorrientes (cada 1.5m) y vuelve a ejecutar.")
    raise Exception("No walls selected")

walls = []
for eid in sel_ids:
    e = doc.GetElement(eid)
    if e and e.Category and e.Category.Id.IntegerValue == int(BuiltInCategory.OST_Walls):
        walls.append(e)

if not walls:
    TaskDialog.Show("pyRevit", "La selección no contiene muros válidos.")
    raise Exception("No valid walls")

# Buscar símbolo de tomacorriente/receptacle/outlet
symbols = list(FilteredElementCollector(doc)
               .OfCategory(BuiltInCategory.OST_ElectricalFixtures)
               .WhereElementIsElementType())

symbol = None
keywords = ["toma", "tomacorr", "recept", "outlet", "socket"]
for s in symbols:
    name = (s.FamilyName + " " + s.get_Parameter(BuiltInCategory.INVALID).AsString()) if False else s.FamilyName
    low = (s.FamilyName + " " + s.Name).lower()
    if any(k in low for k in keywords):
        symbol = s
        break

if symbol is None and symbols:
    symbol = symbols[0]

if symbol is None:
    TaskDialog.Show("pyRevit", "No encontré familias en Electrical Fixtures. Carga una familia de tomacorriente e intenta de nuevo.")
    raise Exception("No electrical fixture symbol")

spacing = m_to_ft(1.5)
end_offset = m_to_ft(0.2)
height = m_to_ft(0.30)  # 30 cm

placed = 0
tr = Transaction(doc, "Place outlets every 1.5m on selected walls")
tr.Start()
try:
    if not symbol.IsActive:
        symbol.Activate()
        doc.Regenerate()

    for w in walls:
        lc = w.Location
        if not isinstance(lc, LocationCurve):
            continue
        curve = lc.Curve
        length = curve.Length
        if length <= (2 * end_offset):
            continue

        level = doc.GetElement(w.LevelId)
        start = end_offset
        while start < (length - end_offset):
            p = curve.Evaluate(start / length, True)
            p = XYZ(p.X, p.Y, level.Elevation + height)
            doc.Create.NewFamilyInstance(p, symbol, w, level, StructuralType.NonStructural)
            placed += 1
            start += spacing

    tr.Commit()
except Exception:
    tr.RollBack()
    raise

TaskDialog.Show("pyRevit", "Listo. Tomacorrientes colocados: {}\nTipo usado: {} : {}".format(placed, symbol.FamilyName, symbol.Name))
