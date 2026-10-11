
USERS = [
    {
        "id": 1,
        "email": "admin@nsut.ac.in",
        "name": "Admin",
        "role": "admin",
        "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=admin"
    },
    {
        "id": 2,
        "email": "student@nsut.ac.in",
        "name": "Student",
        "role": "student",
        "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=ritesh"
    }
]


POSTS = [
    {
        "id": 1,
        "author": "Dharamphal",
        "author_email": "dharamphal@nsut.ac.in",
        "title": "Re koi hame bhi dandiya night le jao",
        "content": "Looking for a group to go with for the Moksha dandiya night tomorrow! Ping me on WhatsApp.",
        "category": "Events",
        "likes": 14,
        "created_at": "2026-10-10 18:30"
    },
    {
        "id": 2,
        "author": "Omprakash",
        "author_email": "omprakash@nsut.ac.in",
        "title": "ECE padhadoooo koi bhaii",
        "content": "Signals and Systems endsem is in 3 days. Any seniors having handwritten notes for Unit 4 and 5?",
        "category": "Academics",
        "likes": 9,
        "created_at": "2026-10-10 19:15"
    },
    {
        "id": 3,
        "author": "Aanya Gupta",
        "author_email": "aanya@nsut.ac.in",
        "title": "Smart India Hackathon team members needed",
        "content": "We need 1 frontend dev and 1 ML enthusiast for SIH 2026. Reach out if interested!",
        "category": "Hackathons",
        "likes": 23,
        "created_at": "2026-10-10 20:00"
    }
]


ANNOUNCEMENTS = [
    {
        "id": 1,
        "title": "Mid-Semester Examination Schedule Released",
        "content": "The date sheet for Autumn Semester 2026 is published on the university portal. Practical exams commence from next Monday.",
        "posted_by": "Dean Academic Affairs",
        "is_pinned": True,
        "created_at": "2026-10-08 10:00"
    },
    {
        "id": 2,
        "title": "Moksha 2026 Core Committee Recruitment",
        "content": "Registrations are now open for technical, sponsorships, and PR teams for the annual cultural fest.",
        "posted_by": "Student Council",
        "is_pinned": False,
        "created_at": "2026-10-09 14:00"
    }
]



# Timetable transcribed from the supplied July–December 2026 PDF.
import json
from pathlib import Path

TIMETABLES = json.loads((Path(__file__).parent / "timetable.json").read_text(encoding="utf-8"))
