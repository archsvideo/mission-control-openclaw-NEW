# -*- coding: utf-8 -*-
"""
ARCH-S startup hook
Ensures job processing also runs when Revit starts with a model already open.
"""
import os

this_dir = os.path.dirname(__file__)
doc_opened_hook = os.path.join(this_dir, 'doc-opened.py')

if os.path.exists(doc_opened_hook):
    with open(doc_opened_hook, 'r') as f:
        code = f.read()
    exec(compile(code, doc_opened_hook, 'exec'))
