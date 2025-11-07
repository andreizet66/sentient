from __future__ import annotations
import os
import time
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import xml.etree.ElementTree as ET
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ────────────────────────────────────────────────────────────────────────────────
# Paths / settings
# ────────────────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
XML_PATH = BASE_DIR / "latest_xml" / "latest.xml"
SETTINGS_FILE = BASE_DIR / "settings.json"

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app = FastAPI(title="HDD Sentinel Web API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ────────────────────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────────────────────
def _text(el: Optional[ET.Element]) -> Optional[str]:
    return el.text.strip() if el is not None and el.text else None

def _int_from_text(s: Optional[str]) -> Optional[int]:
    try:
        if s is None:
            return None
        digits = "".join(ch for ch in s if ch.isdigit())
        return int(digits) if digits else None
    except Exception:
        return None

def _first(root: ET.Element, name: str) -> Optional[ET.Element]:
    return root.find(name)

def _logical_drive_letter(summary: ET.Element) -> Optional[str]:
    txt = _text(summary.find("Logical_Drive_s"))
    if not txt:
        return None
    parts = txt.split()
    for p in parts:
        if len(p) >= 2 and p[1] == ":":
            return p[:2]
    return None

def _bytes_from_drive(drive_letter: str) -> Tuple[Optional[int], Optional[int]]:
    try:
        import shutil
        root = drive_letter
        if not drive_letter.endswith("\\"):
            root = drive_letter + "\\"
        usage = shutil.disk_usage(root)
        return usage.total, usage.free
    except Exception:
        return None, None

def _parse_smart_block(disk_el: ET.Element) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    smart_el = disk_el.find("S.M.A.R.T.")
    if smart_el is None:
        return out
    for attr in list(smart_el):
        row: Dict[str, Any] = {"name": attr.tag}
        for sub in list(attr):
            row[sub.tag] = _text(sub)
        if len(row) == 1:
            t = _text(attr)
            if t:
                row["value"] = t
        out.append(row)
    return out

# ────────────────────────────────────────────────────────────────────────────────
# Settings file helpers
# ────────────────────────────────────────────────────────────────────────────────
def _load_settings() -> Dict[str, Any]:
    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"aliases": {}, "hidden": []}

def _save_settings(data: Dict[str, Any]) -> None:
    SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

# ────────────────────────────────────────────────────────────────────────────────
# Drive parsing
# ────────────────────────────────────────────────────────────────────────────────
def _parse_drive(disk_el: ET.Element, idx: int = 0) -> Dict[str, Any]:
    summary = _first(disk_el, "Hard_Disk_Summary")

    interface = _text(summary.find("Interface")) if summary is not None else None
    model = _text(summary.find("Hard_Disk_Model_ID")) if summary is not None else None
    serial = _text(summary.find("Hard_Disk_Serial_Number")) if summary is not None else None
    firmware = _text(summary.find("Firmware_Revision")) if summary is not None else None
    size_mb = _int_from_text(_text(summary.find("Total_Size"))) if summary is not None else None
    temperature_c = _int_from_text(_text(summary.find("Current_Temperature"))) if summary is not None else None
    max_temp_ever = _text(summary.find("Maximum_Temperature_ever_measured")) if summary is not None else None
    min_temp_ever = _text(summary.find("Minimum_Temperature_ever_measured")) if summary is not None else None
    daily_avg = _text(summary.find("Daily_Average")) if summary is not None else None
    daily_max = _text(summary.find("Daily_Maximum")) if summary is not None else None
    power_on = _text(summary.find("Power_on_time")) if summary is not None else None
    lifetime_writes = _text(summary.find("Lifetime_writes")) if summary is not None else None
    est_life = _text(summary.find("Estimated_remaining_lifetime")) if summary is not None else None
    health_pct = _int_from_text(_text(summary.find("Health"))) if summary is not None else None
    performance_pct = _int_from_text(_text(summary.find("Performance"))) if summary is not None else None
    description = _text(summary.find("Description")) if summary is not None else None
    tip = _text(summary.find("Tip")) if summary is not None else None

    logical = _logical_drive_letter(summary) if summary is not None else None
    total_b, free_b = (None, None)
    used_b = None
    used_pct = None
    free_pct = None

    if logical:
        total_b, free_b = _bytes_from_drive(logical)
        if total_b is not None and free_b is not None:
            used_b = total_b - free_b
            if total_b > 0:
                used_pct = round((used_b / total_b) * 100)
                free_pct = 100 - used_pct

    smart = _parse_smart_block(disk_el)

    # generate guaranteed stable ID
    unique_id = serial or f"{(model or 'Drive').replace(' ', '_')}_{idx}"

    return {
        "id": unique_id,
        "model": model,
        "firmware": firmware,
        "serial": serial,
        "interface": interface,
        "size_mb": size_mb,
        "temperature_c": temperature_c,
        "temperature_max_ever": max_temp_ever,
        "temperature_min_ever": min_temp_ever,
        "daily_temperature_average": daily_avg,
        "daily_temperature_maximum": daily_max,
        "power_on_time": power_on,
        "lifetime_writes": lifetime_writes,
        "estimated_remaining_lifetime": est_life,
        "health_pct": health_pct,
        "performance_pct": performance_pct,
        "logical_drive": logical,
        "bytes_total": total_b,
        "bytes_free": free_b,
        "bytes_used": used_b,
        "used_pct": used_pct,
        "free_pct": free_pct,
        "description": description,
        "tip": tip,
        "smart": smart,
    }

def _collect_drives(xml_path: Path) -> List[Dict[str, Any]]:
    if not xml_path.exists():
        raise HTTPException(status_code=404, detail=f"XML not found: {xml_path}")
    root = ET.parse(xml_path).getroot()
    disks = [c for c in list(root) if c.tag.startswith("Physical_Disk_Information_Disk_")]
    if not disks:
        raise HTTPException(status_code=500, detail="No drives found in XML")
    return [_parse_drive(d, i) for i, d in enumerate(disks)]

# ────────────────────────────────────────────────────────────────────────────────
# Routes
# ────────────────────────────────────────────────────────────────────────────────

@app.get("/history")
def history() -> Dict[str, Any]:
    drives = _collect_drives(XML_PATH)
    return {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "source_mtime": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(XML_PATH.stat().st_mtime)),
        "drives": drives,
    }


@app.get("/settings")
def get_settings() -> Dict[str, Any]:
    return _load_settings()


@app.patch("/settings")
def patch_settings(patch: Dict[str, Any]) -> Dict[str, Any]:
    """
    Accepts either:
      { "aliases": {...} }
      { "hidden": [...] }  # additive
      { "hiddenSet": [...] }  # full replacement (preferred)
    """
    data = _load_settings()

    if "aliases" in patch and isinstance(patch["aliases"], dict):
        data.setdefault("aliases", {}).update(patch["aliases"])

    if "hiddenSet" in patch and isinstance(patch["hiddenSet"], list):
        data["hidden"] = patch["hiddenSet"]
    elif "hidden" in patch and isinstance(patch["hidden"], list):
        existing = set(data.get("hidden", []))
        for s in patch["hidden"]:
            existing.add(s)
        data["hidden"] = list(existing)

    _save_settings(data)
    return data


# ────────────────────────────────────────────────────────────────────────────────
# Serve built frontend (React build in frontend/dist)
# ────────────────────────────────────────────────────────────────────────────────
from fastapi.staticfiles import StaticFiles
frontend_dist = BASE_DIR / "frontend" / "dist"

if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
else:
    from fastapi.responses import JSONResponse

    @app.get("/")
    def missing_build():
        return JSONResponse(
            {"error": f"Frontend build not found at {frontend_dist}"}
        )
