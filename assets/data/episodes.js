/* Episode timelines extracted from the run logs of the evaluation episodes shown on the page.
   Times are real seconds from the start of the agent. frames: [t0, t1, f0, f1] maps episode time to video frames
   (the recordings contain executed robot motion only). */
window.BAPL_EPISODES = {
 "cup_harness": {
  "id": "cup_harness",
  "label": "Harness VLA",
  "sub": "calls a whole-task policy from the start",
  "task": "Drop the cup for holding liquids firmly on the smooth round palm-sized coaster using arm",
  "end": 186.6,
  "calls": 7,
  "ok": false,
  "call_times": [
   6.0,
   9.0,
   69.0,
   122.0,
   124.0,
   177.0,
   185.0
  ],
  "policy": [
   [
    9.0,
    67.0
   ],
   [
    69.0,
    119.0
   ],
   [
    124.0,
    175.0
   ]
  ],
  "motions": [
   [
    178.0,
    183.0
   ]
  ],
  "video": "video/episode/cup_harness.mp4",
  "poster": "img/posters/episode_cup_harness.jpg",
  "fps": 20.0,
  "n_frames": 325,
  "frames": [
   [
    9.0,
    67.0,
    0,
    100
   ],
   [
    69.0,
    119.0,
    100,
    200
   ],
   [
    124.0,
    175.0,
    200,
    300
   ],
   [
    178.0,
    183.0,
    300,
    324
   ]
  ],
  "steps": [
   {
    "t": 6.0,
    "verb": "recall",
    "kind": "agent",
    "lines": [
     "task memory"
    ]
   },
   {
    "t": 9.0,
    "verb": "hand over",
    "kind": "policy",
    "lines": [
     "Policy",
     "\"Drop the cup for holding liquids firmly on the smooth round palm-sized coaster using arm\"",
     "2 calls, 2 chunks each"
    ]
   },
   {
    "t": 122.0,
    "verb": "look",
    "kind": "agent",
    "lines": [
     "camera images"
    ]
   },
   {
    "t": 124.0,
    "verb": "hand over",
    "kind": "policy",
    "lines": [
     "Policy",
     "\"Drop the cup for holding liquids firmly on the smooth round palm-sized coaster using arm\"",
     "2 chunks"
    ]
   },
   {
    "t": 178.0,
    "verb": "move",
    "kind": "agent",
    "lines": [
     "right arm aside",
     "planner motion"
    ]
   }
  ],
  "quotes": [
   {
    "t": 69.0,
    "text": "Right gripper closed, holding cup (blue visible). Continue."
   },
   {
    "t": 185.0,
    "text": "The cup appears gone from the table (pushed off right edge during the first VLA chunk); not recoverable."
   }
  ],
  "boxes": []
 },
 "cup_ours": {
  "id": "cup_ours",
  "label": "Ours, after boundary-explicit training",
  "sub": "hands over a contact segment",
  "task": "Place the plastic cup for drinks on top of the coaster made of smooth wood",
  "end": 191.3,
  "calls": 16,
  "ok": true,
  "call_times": [
   10.0,
   17.0,
   23.0,
   31.0,
   50.0,
   101.0,
   104.0,
   109.0,
   112.0,
   116.0,
   133.0,
   138.0,
   157.0,
   173.0,
   181.0,
   191.0
  ],
  "policy": [
   [
    51.0,
    99.0
   ]
  ],
  "motions": [
   [
    32.0,
    47.0
   ],
   [
    117.0,
    130.0
   ],
   [
    139.0,
    155.0
   ],
   [
    157.0,
    171.0
   ],
   [
    173.0,
    180.0
   ]
  ],
  "video": "video/episode/cup_ours.mp4",
  "poster": "img/posters/episode_cup_ours.jpg",
  "fps": 25.0,
  "n_frames": 209,
  "frames": [
   [
    32.0,
    47.0,
    0,
    25
   ],
   [
    51.0,
    99.0,
    25,
    125
   ],
   [
    117.0,
    130.0,
    125,
    150
   ],
   [
    139.0,
    155.0,
    150,
    175
   ],
   [
    157.0,
    171.0,
    175,
    200
   ],
   [
    173.0,
    180.0,
    200,
    208
   ]
  ],
  "steps": [
   {
    "t": 11.0,
    "verb": "recall",
    "kind": "agent",
    "lines": [
     "handoff protocol, task memory"
    ]
   },
   {
    "t": 19.0,
    "verb": "look",
    "kind": "agent",
    "lines": [
     "\"blue plastic cup\"  0.96",
     "\"round coaster\"  0.76"
    ]
   },
   {
    "t": 32.0,
    "verb": "move",
    "kind": "agent",
    "lines": [
     "left gripper above the cup",
     "planner motion"
    ]
   },
   {
    "t": 51.0,
    "verb": "hand over",
    "kind": "policy",
    "lines": [
     "Policy",
     "\"Pick up the cup with the left arm.\"",
     "2 chunks"
    ]
   },
   {
    "t": 101.0,
    "verb": "check",
    "kind": "agent",
    "lines": [
     "\"blue plastic cup\"  0.92"
    ]
   },
   {
    "t": 117.0,
    "verb": "move",
    "kind": "agent",
    "lines": [
     "above the coaster, then down",
     "3 planner motions"
    ]
   },
   {
    "t": 173.0,
    "verb": "release",
    "kind": "agent",
    "lines": [
     "cup on the coaster"
    ]
   }
  ],
  "quotes": [
   {
    "t": 101.0,
    "text": "The left arm is holding the cup after the π0.5 pick. Next I'm checking that the cup actually lifted off the table."
   },
   {
    "t": 138.0,
    "text": "The cup is held above the coaster. I'm making a small position correction and lowering it onto the coaster."
   },
   {
    "t": 173.0,
    "text": "The cup looks like it's sitting on the coaster. Releasing the gripper now."
   }
  ],
  "boxes": [
   {
    "t0": 21.0,
    "t1": 32.0,
    "label": "blue plastic cup 0.96",
    "xyxy": [
     200,
     250,
     262,
     326
    ]
   },
   {
    "t0": 21.0,
    "t1": 32.0,
    "label": "round coaster 0.76",
    "xyxy": [
     274,
     249,
     341,
     307
    ]
   },
   {
    "t0": 102.0,
    "t1": 117.0,
    "label": "blue plastic cup 0.92",
    "xyxy": [
     183,
     230,
     252,
     306
    ]
   }
  ]
 },
 "cup_after": {
  "id": "cup_after",
  "label": "Ours, after self-improvement",
  "sub": "hands over the whole task",
  "task": "Place the plastic cup for drinks on top of the coaster made of smooth wood",
  "end": 134.5,
  "calls": 4,
  "ok": true,
  "call_times": [
   17.0,
   23.0,
   28.0,
   133.0
  ],
  "policy": [
   [
    28.0,
    133.0
   ]
  ],
  "motions": [],
  "video": "video/episode/cup_after.mp4",
  "poster": "img/posters/episode_cup_after.jpg",
  "fps": 20.0,
  "n_frames": 150,
  "frames": [
   [
    28.0,
    133.0,
    0,
    149
   ]
  ],
  "steps": [
   {
    "t": 17.0,
    "verb": "recall",
    "kind": "agent",
    "lines": [
     "handoff protocol, task memory"
    ]
   },
   {
    "t": 28.0,
    "verb": "hand over",
    "kind": "policy",
    "lines": [
     "Policy",
     "\"Place the plastic cup for drinks on top of the coaster made of smooth wood\"",
     "8 chunks"
    ]
   }
  ],
  "quotes": [
   {
    "t": 28.0,
    "text": "Scene: blue cup on left-centre, wooden coaster to its right. Starting whole-task VLA with 8 chunks."
   }
  ],
  "boxes": []
 }
};
