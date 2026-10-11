"""Run with: python -m unittest test_api -v (data is isolated in a temp directory)."""
import copy
import os
import tempfile
import unittest
from pathlib import Path

temporary = tempfile.TemporaryDirectory()
os.environ["NSUT_DATA_PATH"] = str(Path(temporary.name) / "data.json")
os.environ["GOOGLE_CLIENT_ID"] = ""
os.environ["ALLOW_DEMO"] = "true"  # Explicitly enabled only for isolated tests.
from fastapi.testclient import TestClient
import main
baseline = copy.deepcopy(main.data)

class CampusAPI(unittest.TestCase):
    def setUp(self):
        main.data = copy.deepcopy(baseline)
        main.SESSIONS.clear()
        self.client = TestClient(main.app)
        self.student = {"Authorization": "Bearer " + self.client.post("/api/auth/demo", json={"email": "student@nsut.ac.in"}).json()["token"]}
        self.admin = {"Authorization": "Bearer " + self.client.post("/api/auth/demo", json={"email": "admin@nsut.ac.in"}).json()["token"]}

    def test_auth_and_role_boundary(self):
        self.assertEqual(self.client.get("/api/posts").status_code, 401)
        self.assertEqual(self.client.post("/api/auth/demo",json={"email":"someone@gmail.com"}).status_code,403)
        body={"title":"Campus update","content":"A useful update for everyone."}
        self.assertEqual(self.client.post("/api/announcements",json=body,headers=self.student).status_code,403)
        self.assertEqual(self.client.delete("/api/posts/1",headers=self.student).status_code,403)
        self.client.post("/api/auth/logout",headers=self.student)
        self.assertEqual(self.client.get("/api/me",headers=self.student).status_code,401)

    def test_conversation_lifecycle_and_persistence(self):
        response=self.client.post("/api/posts",headers=self.student,json={"title":"Study group?","content":"Meet at the library after class.","category":"Academics"})
        self.assertEqual(response.status_code,201)
        post=response.json();path=f'/api/posts/{post["id"]}'
        self.assertEqual(self.client.post(path+"/like",headers=self.student).json()["likes"],1)
        self.assertEqual(self.client.post(path+"/like",headers=self.student).json()["likes"],0)
        saved=self.client.post(path+"/save",headers=self.student).json()["saved"]
        self.assertIn(post["id"],saved)
        comment=self.client.post(path+"/comments",headers=self.student,json={"content":"Count me in."})
        self.assertEqual(comment.status_code,201)
        self.assertEqual(comment.json()["comments"][0]["content"],"Count me in.")
        import json
        persisted=json.loads(main.DATA_PATH.read_text(encoding="utf-8"))
        self.assertTrue(any(p["id"]==post["id"] for p in persisted["posts"]))
        self.assertEqual(self.client.delete(path,headers=self.student).status_code,200)
        self.assertEqual(self.client.post(path+"/like",headers=self.student).status_code,404)

    def test_admin_announcement_lifecycle(self):
        body={"title":"Workshop on Friday","content":"Bring a laptop and a good question.","category":"Events","is_pinned":True}
        response=self.client.post("/api/announcements",headers=self.admin,json=body)
        self.assertEqual(response.status_code,201)
        item=response.json();path=f'/api/announcements/{item["id"]}'
        self.assertEqual(self.client.patch(path,headers=self.student,json=body).status_code,403)
        body["title"]="Workshop moved to Monday"
        self.assertEqual(self.client.patch(path,headers=self.admin,json=body).json()["title"],body["title"])
        self.assertEqual(self.client.get("/api/announcements",headers=self.student).json()[0]["id"],item["id"])
        self.assertEqual(self.client.delete(path,headers=self.admin).status_code,200)

    def test_timetable_profile_and_validation(self):
        table=self.client.get("/api/timetable?branch=cse&semester=1",headers=self.student).json()
        self.assertIn("Monday",table["days"])
        self.assertEqual(len(table["days"]["Monday"]),5)
        self.assertEqual(table["days"]["Monday"][0]["time"], "08:00–10:00")
        self.assertEqual(table["days"]["Monday"][-1]["subject"], "Fundamentals of Electrical Engineering Lab")
        self.assertEqual(table["days"]["Monday"][-1]["time"], "16:00–18:00")
        section_two = self.client.get("/api/timetable?branch=cse&semester=1&section=2", headers=self.student).json()
        self.assertEqual(section_two["days"]["Monday"][0]["subject"], "Mathematics-I")
        self.assertEqual(section_two["days"]["Monday"][0]["time"], "10:00–11:00")
        self.assertEqual(section_two["days"]["Monday"][1]["time"], "11:00–13:00")
        self.assertEqual(self.client.get("/api/me", headers=self.student).json()["name"], "Student")
        self.assertEqual(len(table["days"]["Sunday"]),0)
        body={"name":"Test Student","bio":"Making things.","branch":"CSDS","semester":"5"}
        self.assertEqual(self.client.patch("/api/me",headers=self.student,json=body).json()["branch"],"CSDS")
        body["semester"]="2"
        self.assertEqual(self.client.patch("/api/me",headers=self.student,json=body).status_code,400)
        invalid={"title":"   ","content":"    ","category":"Campus"}
        self.assertEqual(self.client.post("/api/posts",headers=self.student,json=invalid).status_code,400)
        self.assertEqual(self.client.post("/api/auth/google",json={"credential":"invalid"}).status_code,503)

if __name__ == '__main__':
    unittest.main()
