"""NSUT Connect: a dummy-data API with session auth and JSON persistence."""
import copy
import json
import os
import secrets
import threading
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import store

app = FastAPI(title="NSUT Connect API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_methods=["*"], allow_headers=["*"])
ROOT = Path(__file__).parent
DATA_PATH = Path(os.environ.get("NSUT_DATA_PATH", str(ROOT / "runtime" / "data.json")))
LOCK = threading.RLock()
SESSIONS = {}
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
ALLOW_DEMO = os.environ.get("ALLOW_DEMO", "true").lower() == "true"
ADMIN_EMAILS = {s.strip().lower() for s in os.environ.get("ADMIN_EMAILS", "").split(",") if s.strip()}
data = {"users": copy.deepcopy(store.USERS), "posts": copy.deepcopy(store.POSTS), "announcements": copy.deepcopy(store.ANNOUNCEMENTS), "timetables": copy.deepcopy(store.TIMETABLES)}
data["users"][1].update(name="Yash Sharma", branch="CSE", semester="1", bio="First-year student. Building things, finding my people.")
for user in data["users"]:
    user.setdefault("branch", "CSE")
    user.setdefault("semester", "1")
    user.setdefault("bio", "Part of the NSUT community.")
    user.setdefault("saved", [])
for post in data["posts"]:
    post.update(comments=[], liked_by=[])
for announcement in data["announcements"]:
    announcement.setdefault("category", "Academics" if announcement["is_pinned"] else "Campus")
if DATA_PATH.exists():
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))

def persist():
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    temporary = DATA_PATH.with_suffix(".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(DATA_PATH)

def now():
    return datetime.now(timezone.utc).isoformat()

def next_id(items):
    return max([int(item["id"]) for item in items], default=0) + 1

def current_user(authorization: str | None = Header(default=None)):
    token = authorization.removeprefix("Bearer ") if authorization else ""
    session = SESSIONS.get(token)
    if not session or session["expires"] < datetime.now(timezone.utc).timestamp():
        raise HTTPException(401, "Your session has expired. Please sign in again.")
    user = next((u for u in data["users"] if u["id"] == session["id"]), None)
    if not user:
        raise HTTPException(401, "Please sign in again.")
    return user

def admin(user=Depends(current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Only administrators can manage announcements.")
    return user

def find(items, item_id):
    item = next((i for i in items if i["id"] == item_id), None)
    if not item:
        raise HTTPException(404, "This item could not be found.")
    return item

class DemoLogin(BaseModel):
    email: str

class GoogleLogin(BaseModel):
    credential: str

class PostInput(BaseModel):
    title: str = Field(min_length=3, max_length=140)
    content: str = Field(min_length=3, max_length=4000)
    category: str

class CommentInput(BaseModel):
    content: str = Field(min_length=1, max_length=2000)

class AnnouncementInput(BaseModel):
    title: str = Field(min_length=3, max_length=140)
    content: str = Field(min_length=3, max_length=4000)
    category: str = "Campus"
    is_pinned: bool = False

class ProfileInput(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    bio: str = Field(max_length=280)
    branch: str
    semester: str

def sign_in(user):
    token = secrets.token_urlsafe(32)
    SESSIONS[token] = {"id": user["id"], "expires": datetime.now(timezone.utc).timestamp() + 86400}
    return {"token": token, "user": user}

@app.get("/api/health")
def health():
    return {"status": "Online", "application": "NSUT Connect", "mode": "dummy-data"}

@app.get("/api/config")
def config():
    return {"google_client_id": GOOGLE_CLIENT_ID, "demo": ALLOW_DEMO}

@app.get("/api/university")
def university():
    return {"name": "Netaji Subhas University of Technology", "location": "Delhi", "application": "NSUT Connect"}

@app.post("/api/auth/demo")
def demo_login(body: DemoLogin):
    if not ALLOW_DEMO:
        raise HTTPException(403, "Demo sign-in is disabled. Use your campus Google account.")
    email = body.email.strip().lower()
    if email not in {"student@nsut.ac.in", "admin@nsut.ac.in"}:
        raise HTTPException(403, "Use one of the two listed demo accounts.")
    return sign_in(next(u for u in data["users"] if u["email"] == email))

@app.post("/api/auth/google")
def google_login(body: GoogleLogin):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(503, "Google sign-in is not configured on this server.")
    from urllib.parse import urlencode
    try:
        with urllib.request.urlopen("https://oauth2.googleapis.com/tokeninfo?" + urlencode({"id_token": body.credential}), timeout=10) as response:
            identity = json.load(response)
    except (urllib.error.URLError, ValueError):
        raise HTTPException(401, "Google could not verify this account.")
    email = identity.get("email", "").lower()
    if identity.get("aud") != GOOGLE_CLIENT_ID or identity.get("email_verified") not in (True, "true") or not email.endswith("@nsut.ac.in") or identity.get("hd") != "nsut.ac.in":
        raise HTTPException(403, "Sign in with a verified @nsut.ac.in Google account.")
    with LOCK:
        user = next((u for u in data["users"] if u["email"] == email), None)
        if not user:
            user = {"id": next_id(data["users"]), "email": email, "name": identity.get("name", email.split("@")[0]), "branch": "CSE", "semester": "1", "bio": "", "saved": []}
            data["users"].append(user)
        user["role"] = "admin" if email in ADMIN_EMAILS else "student"
        persist()
        return sign_in(user)

@app.post("/api/auth/logout")
def logout(authorization: str | None = Header(default=None)):
    SESSIONS.pop((authorization or "").removeprefix("Bearer "), None)
    return {"ok": True}

@app.get("/api/me")
def me(user=Depends(current_user)):
    return user

@app.patch("/api/me")
def update_profile(body: ProfileInput, user=Depends(current_user)):
    if len(body.name.strip()) < 2:
        raise HTTPException(400, "Add your name.")
    if body.branch not in data["timetables"] or body.semester not in data["timetables"][body.branch]:
        raise HTTPException(400, "Choose an available branch and semester.")
    with LOCK:
        user.update({**body.model_dump(), "name": body.name.strip(), "bio": body.bio.strip()})
        persist()
    return user

@app.get("/api/posts")
def posts(user=Depends(current_user)):
    return sorted(data["posts"], key=lambda p: p["id"], reverse=True)

@app.post("/api/posts", status_code=201)
def create_post(body: PostInput, user=Depends(current_user)):
    if body.category not in {"Academics", "Events", "Hackathons", "Campus", "Opportunities"}:
        raise HTTPException(400, "Choose an available category.")
    if not body.title.strip() or not body.content.strip():
        raise HTTPException(400, "Add a title and message.")
    with LOCK:
        post = {**body.model_dump(), "id": next_id(data["posts"]), "author": user["name"], "author_email": user["email"], "created_at": now(), "likes": 0, "liked_by": [], "comments": []}
        data["posts"].append(post)
        persist()
    return post

@app.delete("/api/posts/{post_id}")
def delete_post(post_id: int, user=Depends(current_user)):
    with LOCK:
        post = find(data["posts"], post_id)
        if post["author_email"] != user["email"] and user["role"] != "admin":
            raise HTTPException(403, "You can only remove your own posts.")
        data["posts"].remove(post)
        for profile in data["users"]:
            profile["saved"] = [item for item in profile.get("saved", []) if item != post_id]
        persist()
    return {"ok": True}

@app.post("/api/posts/{post_id}/like")
def like(post_id: int, user=Depends(current_user)):
    with LOCK:
        post = find(data["posts"], post_id)
        liked = user["id"] in post["liked_by"]
        if liked:
            post["liked_by"].remove(user["id"])
        else:
            post["liked_by"].append(user["id"])
        post["likes"] += -1 if liked else 1
        persist()
    return post

@app.post("/api/posts/{post_id}/save")
def save(post_id: int, user=Depends(current_user)):
    with LOCK:
        find(data["posts"], post_id)
        saved = user.setdefault("saved", [])
        saved.remove(post_id) if post_id in saved else saved.append(post_id)
        persist()
    return user

@app.post("/api/posts/{post_id}/comments", status_code=201)
def comment(post_id: int, body: CommentInput, user=Depends(current_user)):
    if not body.content.strip():
        raise HTTPException(400, "Write a reply first.")
    with LOCK:
        post = find(data["posts"], post_id)
        post["comments"].append({"id": next_id(post["comments"]), "author": user["name"], "content": body.content.strip(), "created_at": now()})
        persist()
    return post

@app.get("/api/announcements")
def announcements(user=Depends(current_user)):
    return sorted(data["announcements"], key=lambda a: (a["is_pinned"], a["id"]), reverse=True)

@app.post("/api/announcements", status_code=201)
def create_announcement(body: AnnouncementInput, user=Depends(admin)):
    if not body.title.strip() or not body.content.strip():
        raise HTTPException(400, "Add a title and message.")
    with LOCK:
        item = {**body.model_dump(), "id": next_id(data["announcements"]), "posted_by": user["name"], "created_at": now()}
        data["announcements"].append(item)
        persist()
    return item

@app.patch("/api/announcements/{item_id}")
def edit_announcement(item_id: int, body: AnnouncementInput, user=Depends(admin)):
    with LOCK:
        item = find(data["announcements"], item_id)
        item.update(body.model_dump())
        persist()
    return item

@app.delete("/api/announcements/{item_id}")
def delete_announcement(item_id: int, user=Depends(admin)):
    with LOCK:
        data["announcements"].remove(find(data["announcements"], item_id))
        persist()
    return {"ok": True}

@app.get("/api/timetable")
def timetable(branch: str | None = None, semester: str | None = None, user=Depends(current_user)):
    if not branch or not semester:
        return data["timetables"]
    classes = data["timetables"].get(branch.upper(), {}).get(semester, [])
    return {"branch": branch.upper(), "semester": semester, "days": {day: [c for c in classes if c["day"] == day] for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}}
