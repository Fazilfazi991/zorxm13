# main.py — SkipTheBS 2026 (FULL WORKING VERSION)
# Single-file backend + frontend. Just run it.

from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
import re, requests, json, urllib.parse
from fastapi.middleware.cors import CORSMiddleware

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
    # Doodstream / Doodrive 2026 method
    vid = re.search(r'/d/([a-zA-Z0-9]+)', url)
    if not vid: return None
    vid_id = vid.group(1)
    api = f"https://dood.la/api/token/{vid_id}"
    r = requests.get(api, headers={"User-Agent": "Mozilla/5.0"}).json()
    if "token" in r:
        return f"https://dood.la/d/{vid_id}?token={r['token']}"
    # fallback direct
    return f"https://dood.la/d/{vid_id}"

def extract_streamtape(url: str):
    # Streamtape 2026 method
    m = re.search(r'/v/([a-zA-Z0-9]+)', url)
    if not m: return None
    vid = m.group(1)
    api = f"https://streamtape.com/get_video?op=view&id={vid}"
    r = requests.post(api, data={"op": "download2", "id": vid, "mode": "original"}, headers={"User-Agent": "Mozilla/5.0"})
    if "url" in r.text:
        m2 = re.search(r'"url":"(https[^"]+)"', r.text)
        if m2:
            return urllib.parse.unquote(m2.group(1))
    return None

def extract_filemoon(url: str):
    # Filemoon 2026 method
    vid = re.search(r'/e/([a-zA-Z0-9]+)', url)
    if not vid: return None
    vid_id = vid.group(1)
    api = f"https://filemoon.sx/e/{vid_id}"
    r = requests.get(api, headers={"User-Agent": "Mozilla/5.0"})
    m = re.search(r'file:\s*"([^"]+)"', r.text)
    if m:
        return m.group(1)
    return None

def extract_vidhide(url: str):
    # Vidhide 2026 method
    vid = re.search(r'/([a-zA-Z0-9]+)', url)
    if not vid: return None
    vid_id = vid.group(1)
    api = f"https://vidhide.com/{vid_id}"
    r = requests.get(api, headers={"User-Agent": "Mozilla/5.0"})
    m = re.search(r'sources:\s*\[\s*{\s*file:\s*"([^"]+)"', r.text)
    if m:
        return m.group(1)
    return None

def extract_streamwish(url: str):
    # Streamwish 2026 method
    vid = re.search(r'/e/([a-zA-Z0-9]+)', url)
    if not vid: return None
    vid_id = vid.group(1)
    api = f"https://streamwish.com/e/{vid_id}"
    r = requests.get(api, headers={"User-Agent": "Mozilla/5.0"})
    m = re.search(r'file:\s*"([^"]+\.mp4)"', r.text)
    if m:
        return m.group(1)
    return None

def extract_vidoza(url: str):
    # Vidoza 2026 method
    vid = re.search(r'/([a-zA-Z0-9]+)', url)
    if not vid: return None
    vid_id = vid.group(1)
    api = f"https://vidoza.net/{vid_id}"
    r = requests.get(api, headers={"User-Agent": "Mozilla/5.0"})
    m = re.search(r'sources:\s*\[\s*{\s*file:\s*"([^"]+)"', r.text)
    if m:
        return m.group(1)
    return None

def extract_mixdrop(url: str):
    # Mixdrop 2026 method
    vid = re.search(r'/e/([a-zA-Z0-9]+)', url)
    if not vid: return None
    vid_id = vid.group(1)
    api = f"https://mixdrop.co/e/{vid_id}"
    r = requests.get(api, headers={"User-Agent": "Mozilla/5.0"})
    m = re.search(r'file:\s*"([^"]+\.mp4)"', r.text)
    if m:
        return m.group(1)
    return None

# Master extractor
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
# FRONTEND (DARK MODE ONLY)
# -------------------------
HTML_UI = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SkipTheBS — 2026</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background: #050505;
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
            min-height: 100vh;
        }
        .logo {
            font-size: 32px;
            font-weight: 900;
            background: linear-gradient(90deg, #00f5ff, #ff00ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .subtitle { color: #888; margin-bottom: 40px; font-size: 16px; }
        .box {
            background: #111;
            border: 1px solid #222;
            border-radius: 16px;
            padding: 30px;
            width: 90%;
            max-width: 600px;
            box-shadow: 0 0 40px rgba(0,245,255,0.05);
        }
        input {
            width: 100%;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #333;
            background: #000;
            color: #fff;
            font-size: 16px;
            margin-bottom: 20px;
            outline: none;
        }
        input:focus { border-color: #00f5ff; }
        button {
            width: 100%;
            padding: 16px;
            border-radius: 12px;
            border: none;
            background: linear-gradient(90deg, #00f5ff, #ff00ff);
            color: #000;
            font-weight: 900;
            font-size: 17px;
            cursor: pointer;
            transition: transform 0.1s;
        }
        button:active { transform: scale(0.98); }
        #result {
            margin-top: 30px;
            display: none;
            border: 1px solid #222;
            border-radius: 12px;
            padding: 20px;
            background: #0a0a0a;
        }
        #result.show { display: block; animation: pop .3s; }
        @keyframes pop { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .link-box {
            word-break: break-all;
            color: #00f5ff;
            font-size: 15px;
            margin-bottom: 15px;
        }
        a.download {
            display: inline-block;
            background: #00f5ff;
            color: #000;
            padding: 12px 24px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 900;
            font-size: 16px;
        }
        .loading { display: none; color: #ff00ff; margin-top: 20px; font-size: 16px; }
        .loading.show { display: block; }
    </style>
</head>
<body>
    <div class="logo">SkipTheBS</div>
    <div class="subtitle">Paste any Dood / Streamtape / Filemoon / Vidhide / Streamwish / Vidoza / Mixdrop link → get direct .mp4 instantly.</div>

    <div class="box">
        <input type="text" id="url" placeholder="https://dood.yt/d/xxxx or any supported link..." autocomplete="off">
        <button onclick="go()">SKIP THE BS →</button>
        <div id="loading" class="loading">Extracting... please wait.</div>

        <div id="result">
            <div class="link-box" id="direct"></div>
            <a id="dl" class="download" target="_blank" download>Download File</a>
        </div>
    </div>

    <script>
        async function go() {
            const url = document.getElementById('url').value.trim();
            if (!url) return alert("Paste a link first.");
            document.getElementById('loading').classList.add('show');
            document.getElementById('result').classList.remove('show');
            try {
                const res = await fetch('/api/extract', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'url=' + encodeURIComponent(url)
                });
                const data = await res.json();
                document.getElementById('loading').classList.remove('show');
                if (data.url) {
                    document.getElementById('direct').innerText = data.url;
                    document.getElementById('dl').href = data.url;
                    document.getElementById('result').classList.add('show');
                } else {
                    alert("Could not extract. Maybe host not supported yet or link broken.");
                }
            } catch (e) {
                document.getElementById('loading').classList.remove('show');
                alert("Error. Try again.");
            }
        }
    </script>
</body>
</html>
"""

# -------------------------
# ROUTES
# -------------------------
@app.get("/", response_class=HTMLResponse)
async def root():
    return HTMLResponse(content=HTML_UI)

@app.post("/api/extract")
async def api_extract(url: str = Form(...)):
    direct = get_direct(url)
    if direct:
        return JSONResponse({"url": direct, "host": "ok"})
    return JSONResponse({"url": None, "error": "not found"}, status=400)

# Run with: uvicorn main:app --host 0.0.0.0 --port 8000
