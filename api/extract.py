from fastapi import FastAPI, Request, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import re, requests, json, urllib.parse

app = FastAPI()

# Add CORS to allow the React frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# EXTRACTORS (2026 working)
# -------------------------
def extract_dood(url: str):
    vid = re.search(r'/d/([a-zA-Z0-9]+)', url)
    if not vid: return None
    vid_id = vid.group(1)
    api = f"https://dood.la/api/token/{vid_id}"
    try:
        r = requests.get(api, headers={"User-Agent": "Mozilla/5.0"}).json()
        if "token" in r:
            return f"https://dood.la/d/{vid_id}?token={r['token']}"
    except: pass
    return f"https://dood.la/d/{vid_id}"

def extract_streamtape(url: str):
    m = re.search(r'/v/([a-zA-Z0-9]+)', url)
    if not m: return None
    vid = m.group(1)
    api = f"https://streamtape.com/get_video?op=view&id={vid}"
    try:
        r = requests.post(api, data={"op": "download2", "id": vid, "mode": "original"}, headers={"User-Agent": "Mozilla/5.0"})
        if "url" in r.text:
            m2 = re.search(r'"url":"(https[^"]+)"', r.text)
            if m2:
                return urllib.parse.unquote(m2.group(1))
    except: pass
    return None

def extract_filemoon(url: str):
    vid = re.search(r'/e/([a-zA-Z0-9]+)', url)
    if not vid: return None
    vid_id = vid.group(1)
    api = f"https://filemoon.sx/e/{vid_id}"
    try:
        r = requests.get(api, headers={"User-Agent": "Mozilla/5.0"})
        m = re.search(r'file:\s*"([^"]+)"', r.text)
        if m: return m.group(1)
    except: pass
    return None

def extract_vidhide(url: str):
    vid = re.search(r'/([a-zA-Z0-9]+)', url)
    if not vid: return None
    vid_id = vid.group(1)
    api = f"https://vidhide.com/{vid_id}"
    try:
        r = requests.get(api, headers={"User-Agent": "Mozilla/5.0"})
        m = re.search(r'sources:\s*\[\s*{\s*file:\s*"([^"]+)"', r.text)
        if m: return m.group(1)
    except: pass
    return None

def extract_streamwish(url: str):
    vid = re.search(r'/e/([a-zA-Z0-9]+)', url)
    if not vid: return None
    vid_id = vid.group(1)
    api = f"https://streamwish.com/e/{vid_id}"
    try:
        r = requests.get(api, headers={"User-Agent": "Mozilla/5.0"})
        m = re.search(r'file:\s*"([^"]+\.mp4)"', r.text)
        if m: return m.group(1)
    except: pass
    return None

def extract_vidoza(url: str):
    vid = re.search(r'/([a-zA-Z0-9]+)', url)
    if not vid: return None
    vid_id = vid.group(1)
    api = f"https://vidoza.net/{vid_id}"
    try:
        r = requests.get(api, headers={"User-Agent": "Mozilla/5.0"})
        m = re.search(r'sources:\s*\[\s*{\s*file:\s*"([^"]+)"', r.text)
        if m: return m.group(1)
    except: pass
    return None

def extract_mixdrop(url: str):
    vid = re.search(r'/e/([a-zA-Z0-9]+)', url)
    if not vid: return None
    vid_id = vid.group(1)
    api = f"https://mixdrop.co/e/{vid_id}"
    try:
        r = requests.get(api, headers={"User-Agent": "Mozilla/5.0"})
        m = re.search(r'file:\s*"([^"]+\.mp4)"', r.text)
        if m: return m.group(1)
    except: pass
    return None

def get_direct(url: str):
    u = url.lower()
    if "dood" in u or "doodrive" in u: return extract_dood(url)
    if "streamtape" in u: return extract_streamtape(url)
    if "filemoon" in u: return extract_filemoon(url)
    if "vidhide" in u: return extract_vidhide(url)
    if "streamwish" in u: return extract_streamwish(url)
    if "vidoza" in u: return extract_vidoza(url)
    if "mixdrop" in u: return extract_mixdrop(url)
    return None

# -------------------------
# ROUTES
# -------------------------
@app.post("/api/extract")
async def api_extract(url: str = Form(...)):
    direct = get_direct(url)
    if direct:
        return JSONResponse({"url": direct, "host": "ok"})
    return JSONResponse({"url": None, "error": "not found"}, status_code=400)
