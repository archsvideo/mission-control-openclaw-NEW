# -*- coding: utf-8 -*-
import os
import runpy
from Autodesk.Revit.UI import TaskDialog

hook_file = r"C:\Users\Oscar\AppData\Roaming\pyRevit\Extensions\ARCHS.extension\hooks\doc-opened.py"
if not os.path.exists(hook_file):
    TaskDialog.Show("ARCH-S", "No encuentro hook file:\n{}".format(hook_file))
    raise Exception("Missing hook")

runpy.run_path(hook_file, run_name='__main__')
TaskDialog.Show("ARCH-S", "Procesamiento de jobs ejecutado. Revisa revit-autonomy/jobs/done y output.")
