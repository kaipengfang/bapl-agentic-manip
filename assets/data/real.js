/* Real-robot episode (one run, dual-arm robot with two dexterous hands), same schema as one entry of BAPL_EPISODES,
   plus `wrist` (the two policy windows, wrist cameras) and `instruction`.
   Source: the run log of the episode; times are real seconds from the start of the agent.
   Cut rule: the clip and every field here stop at `end` = 471.3 s, when the right hand releases the orange and before the
   scene is disturbed (as in the narrated video). `ok` is null: no success mark is shown for this clip.
   `published` holds the only whole-episode numbers that may be shown (571 s, 40 LLM calls); `full_episode` keeps the
   uncut timeline for reference. Videos keep every 5th camera frame (6 fps); frames: [t0, t1, f0, f1].
   `player`: overlays and plan list of the page-6 player. Boxes and arrows in head-image pixels (640x480; the clip shows
   the rows from crop[1] down). Boxes from look_t, arrows from plan_t (the first model call after the last segmentation;
   the run log has no plan step), both until move_t (first motion). rows[].sub: [t0, t1) of move, hand over, check, place;
   a hand over spans exactly its policy interval. */
window.BAPL_REAL = {
 "id": "real",
 "label": "Real robot",
 "sub": "hands over each grasp",
 "task": "Put the fruits on the table into the white bowl.",
 "instruction": "Put the fruits on the table into the white bowl.",
 "end": 471.3,
 "calls": 33,
 "ok": null,
 "call_times": [
  8.0,
  13.9,
  18.1,
  22.9,
  29.1,
  40.9,
  50.2,
  57.9,
  72.8,
  95.5,
  130.4,
  151.1,
  169.1,
  186.9,
  212.7,
  226.5,
  238.5,
  258.3,
  291.4,
  312.5,
  328.9,
  345.0,
  355.1,
  366.3,
  378.7,
  396.6,
  403.9,
  413.1,
  420.0,
  437.3,
  450.3,
  459.7,
  467.2
 ],
 "policy": [
  [
   113.5,
   126.8
  ],
  [
   383.0,
   393.1
  ]
 ],
 "motions": [
  [
   65.1,
   67.8
  ],
  [
   80.6,
   82.4
  ],
  [
   179.8,
   183.9
  ],
  [
   205.6,
   208.6
  ],
  [
   233.7,
   235.3
  ],
  [
   253.2,
   254.8
  ],
  [
   276.5,
   288.2
  ],
  [
   307.1,
   309.6
  ],
  [
   319.8,
   325.9
  ],
  [
   338.1,
   341.1
  ],
  [
   360.8,
   363.1
  ],
  [
   373.8,
   375.7
  ],
  [
   408.4,
   409.4
  ],
  [
   431.1,
   434.4
  ],
  [
   443.6,
   446.6
  ],
  [
   455.6,
   457.5
  ],
  [
   462.7,
   464.2
  ],
  [
   469.7,
   471.3
  ]
 ],
 "video": "video/real/real_head.mp4",
 "poster": "img/real/real_head_poster.jpg",
 "fps": 6,
 "n_frames": 2828,
 "frames": [
  [
   0.0,
   471.1667,
   0,
   2827
  ]
 ],
 "steps": [
  {
   "t": 11.5,
   "verb": "recall",
   "kind": "agent",
   "lines": [
    "task memory, robot model"
   ]
  },
  {
   "t": 26.2,
   "verb": "look",
   "kind": "agent",
   "lines": [
    "two fruits: pear (left), orange (right)"
   ]
  },
  {
   "t": 65.4,
   "verb": "move",
   "kind": "agent",
   "lines": [
    "left hand to the start pose above the pear"
   ]
  },
  {
   "t": 113.5,
   "verb": "hand over",
   "kind": "policy",
   "lines": [
    "Policy",
    "grasp and lift the pear"
   ]
  },
  {
   "t": 133.5,
   "verb": "check",
   "kind": "agent",
   "lines": [
    "grip, pear position in the hand"
   ]
  },
  {
   "t": 179.8,
   "verb": "move",
   "kind": "agent",
   "lines": [
    "carry the pear over the bowl, lower it"
   ]
  },
  {
   "t": 263.2,
   "verb": "release",
   "kind": "agent",
   "lines": [
    "open the left hand, lift, left arm home"
   ]
  },
  {
   "t": 350.0,
   "verb": "look",
   "kind": "agent",
   "lines": [
    "measure the orange"
   ]
  },
  {
   "t": 361.3,
   "verb": "move",
   "kind": "agent",
   "lines": [
    "right hand to the start pose above the orange"
   ]
  },
  {
   "t": 383.0,
   "verb": "hand over",
   "kind": "policy",
   "lines": [
    "Policy",
    "grasp and lift the orange"
   ]
  },
  {
   "t": 399.4,
   "verb": "check",
   "kind": "agent",
   "lines": [
    "grip, locate the pear in the bowl"
   ]
  },
  {
   "t": 431.5,
   "verb": "move",
   "kind": "agent",
   "lines": [
    "carry the orange over the bowl, lower it"
   ]
  },
  {
   "t": 469.6,
   "verb": "release",
   "kind": "agent",
   "lines": [
    "open the right hand"
   ]
  }
 ],
 "wrist": [
  {
   "arm": "left",
   "t0": 113.5,
   "t1": 126.8,
   "video": "video/real/real_wrist_left.mp4",
   "poster": "img/real/real_wrist_left_poster.jpg",
   "fps": 6,
   "n_frames": 80,
   "frames": [
    [
     113.5,
     126.6667,
     0,
     79
    ]
   ]
  },
  {
   "arm": "right",
   "t0": 383.0,
   "t1": 393.1,
   "video": "video/real/real_wrist_right.mp4",
   "poster": "img/real/real_wrist_right_poster.jpg",
   "fps": 6,
   "n_frames": 61,
   "frames": [
    [
     383.0,
     393.0,
     0,
     60
    ]
   ]
  }
 ],
 "published": {
  "time_s": 571,
  "calls": 40,
  "note": "whole episode as stated in the paper figure (571 s, 40 LLM calls); the clip and the fields above stop at 'end'"
 },
 "full_episode": {
  "end": 570.7,
  "calls": 40,
  "call_times": [
   8.0,
   13.9,
   18.1,
   22.9,
   29.1,
   40.9,
   50.2,
   57.9,
   72.8,
   95.5,
   130.4,
   151.1,
   169.1,
   186.9,
   212.7,
   226.5,
   238.5,
   258.3,
   291.4,
   312.5,
   328.9,
   345.0,
   355.1,
   366.3,
   378.7,
   396.6,
   403.9,
   413.1,
   420.0,
   437.3,
   450.3,
   459.7,
   467.2,
   483.5,
   496.5,
   512.5,
   522.3,
   536.8,
   545.5,
   566.6
  ],
  "motions": [
   [
    65.1,
    67.8
   ],
   [
    80.6,
    82.4
   ],
   [
    179.8,
    183.9
   ],
   [
    205.6,
    208.6
   ],
   [
    233.7,
    235.3
   ],
   [
    253.2,
    254.8
   ],
   [
    276.5,
    288.2
   ],
   [
    307.1,
    309.6
   ],
   [
    319.8,
    325.9
   ],
   [
    338.1,
    341.1
   ],
   [
    360.8,
    363.1
   ],
   [
    373.8,
    375.7
   ],
   [
    408.4,
    409.4
   ],
   [
    431.1,
    434.4
   ],
   [
    443.6,
    446.6
   ],
   [
    455.6,
    457.5
   ],
   [
    462.7,
    464.2
   ],
   [
    469.7,
    479.3
   ],
   [
    489.6,
    492.5
   ],
   [
    513.4,
    519.5
   ],
   [
    528.0,
    531.3
   ]
  ]
 },
 "player": {
  "crop": [
   0,
   96,
   640,
   384
  ],
  "look_t": 26.2,
  "plan_t": 50.2,
  "move_t": 65.1,
  "boxes": [
   {
    "name": "pear",
    "tag": "below",
    "xyxy": [
     174,
     256,
     228,
     308
    ]
   },
   {
    "name": "orange",
    "tag": "below",
    "xyxy": [
     394,
     224,
     440,
     270
    ]
   },
   {
    "name": "white bowl",
    "tag": "above",
    "xyxy": [
     256,
     184,
     356,
     282
    ]
   }
  ],
  "rows": [
   {
    "n": 1,
    "label": "left hand: pear to bowl",
    "t0": 65.1,
    "t1": 268.0,
    "sub": [
     {
      "verb": "move",
      "t0": 65.1,
      "t1": 113.5,
      "policy": false
     },
     {
      "verb": "hand over",
      "t0": 113.5,
      "t1": 126.8,
      "policy": true
     },
     {
      "verb": "check",
      "t0": 133.5,
      "t1": 179.8,
      "policy": false
     },
     {
      "verb": "place",
      "t0": 179.8,
      "t1": 268.0,
      "policy": false
     }
    ]
   },
   {
    "n": 2,
    "label": "right hand: orange to bowl",
    "t0": 350.0,
    "t1": 471.3,
    "sub": [
     {
      "verb": "move",
      "t0": 350.0,
      "t1": 383.0,
      "policy": false
     },
     {
      "verb": "hand over",
      "t0": 383.0,
      "t1": 393.1,
      "policy": true
     },
     {
      "verb": "check",
      "t0": 399.4,
      "t1": 431.5,
      "policy": false
     },
     {
      "verb": "place",
      "t0": 431.5,
      "t1": 471.3,
      "policy": false
     }
    ]
   }
  ],
  "arrows": [
   {
    "n": 1,
    "row": 0,
    "d": "M113.1 225.0Q159.6 226.4 186.5 260.4",
    "head": "187.7,262.0 183.7,247.3 174.3,254.7",
    "num": [
     165.3,
     226.2
    ]
   },
   {
    "n": 2,
    "row": 0,
    "d": "M215.0 261.4Q241.7 233.2 284.5 235.7",
    "head": "286.5,235.9 272.9,229.0 272.2,241.0",
    "num": [
     246.5,
     227.4
    ]
   },
   {
    "n": 3,
    "row": 1,
    "d": "M483.9 203.0Q450.0 204.3 429.4 228.2",
    "head": "428.1,229.7 441.8,223.0 432.7,215.2",
    "num": [
     443.1,
     201.1
    ]
   },
   {
    "n": 4,
    "row": 1,
    "d": "M398.2 234.6Q366.6 218.9 331.1 234.6",
    "head": "329.3,235.4 344.5,235.2 339.7,224.2",
    "num": [
     360.2,
     214.4
    ]
   }
  ]
 }
};
