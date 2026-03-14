# -*- coding: utf-8 -*-
from Autodesk.Revit.DB import (
    BuiltInCategory, FilteredElementCollector, BuiltInParameter,
    Wall, LocationCurve, XYZ, Transaction,
    UnitUtils, UnitTypeId, WallFunction, Family, Line
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


def normalize_xy(v):
    n = (v.X * v.X + v.Y * v.Y) ** 0.5
    if n < 1e-9:
        return None
    return XYZ(v.X / n, v.Y / n, 0.0)


def wall_tangent(curve, t_norm):
    try:
        der = curve.ComputeDerivatives(t_norm, True)
        return normalize_xy(der.BasisX)
    except Exception:
        p0 = curve.GetEndPoint(0)
        p1 = curve.GetEndPoint(1)
        return normalize_xy(XYZ(p1.X - p0.X, p1.Y - p0.Y, 0.0))


def wall_normal_from_tangent(tan):
    if tan is None:
        return None
    return XYZ(-tan.Y, tan.X, 0.0)


def signed_side_for_wall(w, normal, side_mode):
    """
    side_mode: interior | exterior | left | right
    """
    if side_mode == 'left':
        return 1.0
    if side_mode == 'right':
        return -1.0

    try:
        ext = normalize_xy(w.Orientation)
    except Exception:
        ext = None

    if ext is None or normal is None:
        return 1.0

    dot = normal.X * ext.X + normal.Y * ext.Y
    if side_mode == 'interior':
        # interior is opposite to exterior orientation
        return -1.0 if dot >= 0 else 1.0
    # exterior
    return 1.0 if dot >= 0 else -1.0


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
# Lado de colocación en el muro: interior | exterior | left | right
side_mode = 'interior'
# Margen para no pegar exactamente sobre la cara (evita fallos geométricos)
face_clearance = m_to_ft(0.01)

walls = [w for w in FilteredElementCollector(doc).OfClass(Wall) if is_internal_wall(w)]
if not walls:
    walls = list(FilteredElementCollector(doc).OfClass(Wall))
if not walls:
    raise Exception('No walls found')

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
            t_norm = d / length
            p_center = curve.Evaluate(t_norm, True)

            tan = wall_tangent(curve, t_norm)
            normal = wall_normal_from_tangent(tan)
            if normal is None:
                d += spacing
                continue

            side_sign = signed_side_for_wall(w, normal, side_mode)
            half_w = (w.Width * 0.5) if hasattr(w, 'Width') else 0.0
            lateral = max(half_w - face_clearance, 0.0)

            p_host = XYZ(
                p_center.X + normal.X * side_sign * lateral,
                p_center.Y + normal.Y * side_sign * lateral,
                level.Elevation + height
            )

            inst = doc.Create.NewFamilyInstance(p_host, picked, w, level, StructuralType.NonStructural)

            # Alinea giro al eje del muro (mejora legibilidad del símbolo en planta)
            try:
                locp = inst.Location
                if locp and hasattr(locp, 'Point') and tan is not None:
                    p0 = locp.Point
                    axis = Line.CreateBound(p0, XYZ(p0.X, p0.Y, p0.Z + 1.0))
                    # ángulo entre X global y tangente del muro
                    import math
                    ang = math.atan2(tan.Y, tan.X)
                    from Autodesk.Revit.DB import ElementTransformUtils
                    ElementTransformUtils.RotateElement(doc, inst.Id, axis, ang)
            except Exception:
                pass

            placed += 1
            d += spacing

    tr.Commit()
except Exception:
    tr.RollBack()
    raise

print('OUTLET_TYPE={} : {}'.format(picked.FamilyName, type_name(picked)))
print('SIDE_MODE={}'.format(side_mode))
print('INTERNAL_WALLS={}'.format(len(walls)))
print('OUTLETS_PLACED={}'.format(placed))
