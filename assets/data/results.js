/* Numbers of the paper (Table 1, Table 2, Figs. 4-7) and the clip lists. */
window.BAPL_RESULTS = {
 "table1": {
  "columns": [
   {
    "key": "c2c",
    "group": "RoboTwin 2.0",
    "label": "C2C"
   },
   {
    "key": "c2r",
    "group": "RoboTwin 2.0",
    "label": "C2R",
    "main": true
   },
   {
    "key": "gen",
    "group": "RoboDojo",
    "label": "Gen."
   },
   {
    "key": "mem",
    "group": "RoboDojo",
    "label": "Mem."
   },
   {
    "key": "open",
    "group": "RoboDojo",
    "label": "Open"
   },
   {
    "key": "avg",
    "group": "RoboDojo",
    "label": "Avg.",
    "main": true
   }
  ],
  "rows": [
   {
    "method": "π0.5",
    "kind": "whole-task policy alone",
    "c2c": 85.8,
    "c2r": 40.0,
    "gen": 16.7,
    "mem": 3.3,
    "open": 0.0,
    "avg": 8.5
   },
   {
    "method": "AGP",
    "kind": "agent without a learned policy",
    "c2c": 54.0,
    "c2r": 56.0,
    "gen": 10.0,
    "mem": 46.7,
    "open": 50.0,
    "avg": 30.8
   },
   {
    "method": "ORA",
    "kind": "agent without a learned policy",
    "c2c": 74.0,
    "c2r": 70.0,
    "gen": null,
    "mem": null,
    "open": null,
    "avg": null
   },
   {
    "method": "Harness VLA",
    "kind": "agent that orchestrates a whole-task policy",
    "c2c": 96.0,
    "c2r": 72.0,
    "gen": 41.7,
    "mem": 36.7,
    "open": 42.5,
    "avg": 40.8,
    "dagger": [
     "gen"
    ]
   },
   {
    "method": "Ours",
    "kind": "agent that orchestrates our policy",
    "ours": true,
    "c2c": 95.6,
    "c2r": 98.4,
    "gen": 62.5,
    "mem": 80.0,
    "open": 71.3,
    "avg": 69.2
   }
  ],
  "best": {
   "c2c": "Harness VLA",
   "c2r": "Ours",
   "gen": "Ours",
   "mem": "Ours",
   "open": "Ours",
   "avg": "Ours"
  },
  "gain": {
   "c2r": 26.4,
   "avg": 28.4
  },
  "dagger_note": "Reported by the official release."
 },
 "selfimprove": {
  "metrics": [
   {
    "key": "success",
    "label": "success (%)"
   },
   {
    "key": "calls",
    "label": "LLM calls"
   },
   {
    "key": "cost",
    "label": "cost ($)"
   },
   {
    "key": "time",
    "label": "time (min)"
   }
  ],
  "all50": {
   "easy": {
    "before": {
     "success": 96.4,
     "calls": 26.3,
     "cost": 1.74,
     "time": 4.21
    },
    "after": {
     "success": 97.2,
     "calls": 15.3,
     "cost": 0.96,
     "time": 2.44
    },
    "delta": {
     "calls": -42,
     "cost": -45,
     "time": -42
    }
   },
   "hard": {
    "before": {
     "success": 93.6,
     "calls": 26.2,
     "cost": 1.67,
     "time": 3.95
    },
    "after": {
     "success": 94.2,
     "calls": 15.7,
     "cost": 1.04,
     "time": 2.65
    },
    "delta": {
     "calls": -40,
     "cost": -38,
     "time": -33
    }
   }
  },
  "subset30": {
   "easy": {
    "before": {
     "success": 97.3,
     "calls": 20.7,
     "cost": 1.32,
     "time": 3.13
    },
    "after": {
     "success": 98.7,
     "calls": 11.0,
     "cost": 0.68,
     "time": 1.57
    },
    "second": {
     "success": 98.3,
     "calls": 10.0,
     "cost": 0.552,
     "time": 1.28
    },
    "delta_after": {
     "calls": -47,
     "cost": -48,
     "time": -50
    },
    "delta_second": {
     "calls": -9,
     "cost": -19,
     "time": -18
    }
   },
   "hard": {
    "before": {
     "success": 98.3,
     "calls": 19.1,
     "cost": 1.12,
     "time": 2.56
    },
    "after": {
     "success": 98.7,
     "calls": 12.0,
     "cost": 0.75,
     "time": 1.71
    },
    "second": {
     "success": 98.3,
     "calls": 9.9,
     "cost": 0.544,
     "time": 1.3
    },
    "delta_after": {
     "calls": -37,
     "cost": -33,
     "time": -33
    },
    "delta_second": {
     "calls": -18,
     "cost": -27,
     "time": -24
    }
   }
  },
  "average": {
   "cost": -41.3,
   "time": -37.5,
   "calls_note": "about 40% fewer language-model calls"
  }
 },
 "boundary": {
  "policy_alone": [
   {
    "label": "training pose + clean scene",
    "value": 93.2
   },
   {
    "label": "training pose + randomized scene",
    "value": 89.8
   },
   {
    "label": "new pose + randomized scene",
    "value": 83.7
   }
  ],
  "bins": [
   {
    "mm": "0–10",
    "policy": 87,
    "handoffs": 54
   },
   {
    "mm": "10–20",
    "policy": 91,
    "handoffs": 23
   },
   {
    "mm": "20–30",
    "policy": 89,
    "handoffs": 11
   },
   {
    "mm": "30–40",
    "policy": 82,
    "handoffs": 3
   },
   {
    "mm": "40–60",
    "policy": 73,
    "handoffs": 3
   },
   {
    "mm": "≥60",
    "policy": 59,
    "handoffs": 6
   }
  ],
  "within40": 91.1,
  "beyond60": 6.1,
  "harness": {
   "initial_pose_success": 71.5,
   "recall_distance_mm": 80.1,
   "recall_success": 36.8,
   "system_success": 72.0
  }
 },
 "ablation": [
  {
   "label": "Harness VLA",
   "value": 72.0
  },
  {
   "label": "+ handoff protocol",
   "value": 86.0
  },
  {
   "label": "+ our policy",
   "value": 93.0
  },
  {
   "label": "Ours (both)",
   "value": 98.4,
   "ours": true
  }
 ],
 "models": [
  {
   "model": "Claude Opus 5.5",
   "effort": "high",
   "success": 98.7,
   "cost": 1.53
  },
  {
   "model": "Claude Opus 5.5",
   "effort": "low",
   "success": 80.3,
   "cost": 0.88
  },
  {
   "model": "Claude Opus 5.5",
   "effort": "max",
   "success": 99.0,
   "cost": 3.29
  },
  {
   "model": "GPT-6.1 Sol",
   "effort": "high",
   "success": 85.0,
   "cost": 0.26
  },
  {
   "model": "GPT-6 Astra",
   "effort": "high",
   "success": 83.3,
   "cost": 1.29
  },
  {
   "model": "Kimi K3.1 Pro",
   "effort": "high",
   "success": 73.3,
   "cost": 1.07
  },
  {
   "model": "DeepSeek-V4.1-Flash",
   "effort": "high",
   "success": 67.7,
   "cost": 0.62
  }
 ],
 "cup": [
  {
   "id": "cup_harness",
   "system": "Harness VLA",
   "ok": false,
   "time_s": 187,
   "calls": 7
  },
  {
   "id": "cup_ours",
   "system": "Ours, after boundary-explicit training",
   "ok": true,
   "time_s": 191,
   "calls": 16
  },
  {
   "id": "cup_after",
   "system": "Ours, after self-improvement",
   "ok": true,
   "time_s": 135,
   "calls": 4
  }
 ],
 "wall": [
  {
   "task": "adjust_bottle",
   "label": "adjust bottle",
   "video": "video/wall/adjust_bottle.mp4",
   "poster": "img/posters/wall_adjust_bottle.jpg",
   "dur": 5.9
  },
  {
   "task": "beat_block_hammer",
   "label": "beat block hammer",
   "video": "video/wall/beat_block_hammer.mp4",
   "poster": "img/posters/wall_beat_block_hammer.jpg",
   "dur": 8.1
  },
  {
   "task": "blocks_ranking_rgb",
   "label": "blocks ranking rgb",
   "video": "video/wall/blocks_ranking_rgb.mp4",
   "poster": "img/posters/wall_blocks_ranking_rgb.jpg",
   "dur": 20.8
  },
  {
   "task": "blocks_ranking_size",
   "label": "blocks ranking size",
   "video": "video/wall/blocks_ranking_size.mp4",
   "poster": "img/posters/wall_blocks_ranking_size.jpg",
   "dur": 10.4
  },
  {
   "task": "click_alarmclock",
   "label": "click alarmclock",
   "video": "video/wall/click_alarmclock.mp4",
   "poster": "img/posters/wall_click_alarmclock.jpg",
   "dur": 3.0
  },
  {
   "task": "click_bell",
   "label": "click bell",
   "video": "video/wall/click_bell.mp4",
   "poster": "img/posters/wall_click_bell.jpg",
   "dur": 9.6
  },
  {
   "task": "dump_bin_bigbin",
   "label": "dump bin bigbin",
   "video": "video/wall/dump_bin_bigbin.mp4",
   "poster": "img/posters/wall_dump_bin_bigbin.jpg",
   "dur": 9.6
  },
  {
   "task": "grab_roller",
   "label": "grab roller",
   "video": "video/wall/grab_roller.mp4",
   "poster": "img/posters/wall_grab_roller.jpg",
   "dur": 5.2
  },
  {
   "task": "handover_block",
   "label": "handover block",
   "video": "video/wall/handover_block.mp4",
   "poster": "img/posters/wall_handover_block.jpg",
   "dur": 15.2
  },
  {
   "task": "handover_mic",
   "label": "handover mic",
   "video": "video/wall/handover_mic.mp4",
   "poster": "img/posters/wall_handover_mic.jpg",
   "dur": 12.5
  },
  {
   "task": "hanging_mug",
   "label": "hanging mug",
   "video": "video/wall/hanging_mug.mp4",
   "poster": "img/posters/wall_hanging_mug.jpg",
   "dur": 22.2
  },
  {
   "task": "lift_pot",
   "label": "lift pot",
   "video": "video/wall/lift_pot.mp4",
   "poster": "img/posters/wall_lift_pot.jpg",
   "dur": 6.9
  },
  {
   "task": "move_can_pot",
   "label": "move can pot",
   "video": "video/wall/move_can_pot.mp4",
   "poster": "img/posters/wall_move_can_pot.jpg",
   "dur": 6.8
  },
  {
   "task": "move_pillbottle_pad",
   "label": "move pillbottle pad",
   "video": "video/wall/move_pillbottle_pad.mp4",
   "poster": "img/posters/wall_move_pillbottle_pad.jpg",
   "dur": 12.4
  },
  {
   "task": "move_playingcard_away",
   "label": "move playingcard away",
   "video": "video/wall/move_playingcard_away.mp4",
   "poster": "img/posters/wall_move_playingcard_away.jpg",
   "dur": 7.3
  },
  {
   "task": "move_stapler_pad",
   "label": "move stapler pad",
   "video": "video/wall/move_stapler_pad.mp4",
   "poster": "img/posters/wall_move_stapler_pad.jpg",
   "dur": 17.8
  },
  {
   "task": "open_laptop",
   "label": "open laptop",
   "video": "video/wall/open_laptop.mp4",
   "poster": "img/posters/wall_open_laptop.jpg",
   "dur": 7.0
  },
  {
   "task": "open_microwave",
   "label": "open microwave",
   "video": "video/wall/open_microwave.mp4",
   "poster": "img/posters/wall_open_microwave.jpg",
   "dur": 36.3
  },
  {
   "task": "pick_diverse_bottles",
   "label": "pick diverse bottles",
   "video": "video/wall/pick_diverse_bottles.mp4",
   "poster": "img/posters/wall_pick_diverse_bottles.jpg",
   "dur": 11.6
  },
  {
   "task": "pick_dual_bottles",
   "label": "pick dual bottles",
   "video": "video/wall/pick_dual_bottles.mp4",
   "poster": "img/posters/wall_pick_dual_bottles.jpg",
   "dur": 15.5
  },
  {
   "task": "place_a2b_left",
   "label": "place a2b left",
   "video": "video/wall/place_a2b_left.mp4",
   "poster": "img/posters/wall_place_a2b_left.jpg",
   "dur": 7.3
  },
  {
   "task": "place_a2b_right",
   "label": "place a2b right",
   "video": "video/wall/place_a2b_right.mp4",
   "poster": "img/posters/wall_place_a2b_right.jpg",
   "dur": 9.3
  },
  {
   "task": "place_bread_basket",
   "label": "place bread basket",
   "video": "video/wall/place_bread_basket.mp4",
   "poster": "img/posters/wall_place_bread_basket.jpg",
   "dur": 14.6
  },
  {
   "task": "place_bread_skillet",
   "label": "place bread skillet",
   "video": "video/wall/place_bread_skillet.mp4",
   "poster": "img/posters/wall_place_bread_skillet.jpg",
   "dur": 13.1
  },
  {
   "task": "place_burger_fries",
   "label": "place burger fries",
   "video": "video/wall/place_burger_fries.mp4",
   "poster": "img/posters/wall_place_burger_fries.jpg",
   "dur": 16.7
  },
  {
   "task": "place_can_basket",
   "label": "place can basket",
   "video": "video/wall/place_can_basket.mp4",
   "poster": "img/posters/wall_place_can_basket.jpg",
   "dur": 15.8
  },
  {
   "task": "place_cans_plasticbox",
   "label": "place cans plasticbox",
   "video": "video/wall/place_cans_plasticbox.mp4",
   "poster": "img/posters/wall_place_cans_plasticbox.jpg",
   "dur": 13.6
  },
  {
   "task": "place_container_plate",
   "label": "place container plate",
   "video": "video/wall/place_container_plate.mp4",
   "poster": "img/posters/wall_place_container_plate.jpg",
   "dur": 7.4
  },
  {
   "task": "place_dual_shoes",
   "label": "place dual shoes",
   "video": "video/wall/place_dual_shoes.mp4",
   "poster": "img/posters/wall_place_dual_shoes.jpg",
   "dur": 44.5
  },
  {
   "task": "place_empty_cup",
   "label": "place empty cup",
   "video": "video/wall/place_empty_cup.mp4",
   "poster": "img/posters/wall_place_empty_cup.jpg",
   "dur": 8.4
  },
  {
   "task": "place_fan",
   "label": "place fan",
   "video": "video/wall/place_fan.mp4",
   "poster": "img/posters/wall_place_fan.jpg",
   "dur": 9.4
  },
  {
   "task": "place_mouse_pad",
   "label": "place mouse pad",
   "video": "video/wall/place_mouse_pad.mp4",
   "poster": "img/posters/wall_place_mouse_pad.jpg",
   "dur": 10.4
  },
  {
   "task": "place_object_basket",
   "label": "place object basket",
   "video": "video/wall/place_object_basket.mp4",
   "poster": "img/posters/wall_place_object_basket.jpg",
   "dur": 19.7
  },
  {
   "task": "place_object_scale",
   "label": "place object scale",
   "video": "video/wall/place_object_scale.mp4",
   "poster": "img/posters/wall_place_object_scale.jpg",
   "dur": 12.2
  },
  {
   "task": "place_object_stand",
   "label": "place object stand",
   "video": "video/wall/place_object_stand.mp4",
   "poster": "img/posters/wall_place_object_stand.jpg",
   "dur": 10.4
  },
  {
   "task": "place_phone_stand",
   "label": "place phone stand",
   "video": "video/wall/place_phone_stand.mp4",
   "poster": "img/posters/wall_place_phone_stand.jpg",
   "dur": 10.7
  },
  {
   "task": "place_shoe",
   "label": "place shoe",
   "video": "video/wall/place_shoe.mp4",
   "poster": "img/posters/wall_place_shoe.jpg",
   "dur": 11.4
  },
  {
   "task": "press_stapler",
   "label": "press stapler",
   "video": "video/wall/press_stapler.mp4",
   "poster": "img/posters/wall_press_stapler.jpg",
   "dur": 5.9
  },
  {
   "task": "put_bottles_dustbin",
   "label": "put bottles dustbin",
   "video": "video/wall/put_bottles_dustbin.mp4",
   "poster": "img/posters/wall_put_bottles_dustbin.jpg",
   "dur": 37.3
  },
  {
   "task": "put_object_cabinet",
   "label": "put object cabinet",
   "video": "video/wall/put_object_cabinet.mp4",
   "poster": "img/posters/wall_put_object_cabinet.jpg",
   "dur": 19.4
  },
  {
   "task": "rotate_qrcode",
   "label": "rotate qrcode",
   "video": "video/wall/rotate_qrcode.mp4",
   "poster": "img/posters/wall_rotate_qrcode.jpg",
   "dur": 10.2
  },
  {
   "task": "scan_object",
   "label": "scan object",
   "video": "video/wall/scan_object.mp4",
   "poster": "img/posters/wall_scan_object.jpg",
   "dur": 14.0
  },
  {
   "task": "shake_bottle",
   "label": "shake bottle",
   "video": "video/wall/shake_bottle.mp4",
   "poster": "img/posters/wall_shake_bottle.jpg",
   "dur": 4.0
  },
  {
   "task": "shake_bottle_horizontally",
   "label": "shake bottle horizontally",
   "video": "video/wall/shake_bottle_horizontally.mp4",
   "poster": "img/posters/wall_shake_bottle_horizontally.jpg",
   "dur": 4.4
  },
  {
   "task": "stack_blocks_three",
   "label": "stack blocks three",
   "video": "video/wall/stack_blocks_three.mp4",
   "poster": "img/posters/wall_stack_blocks_three.jpg",
   "dur": 33.5
  },
  {
   "task": "stack_blocks_two",
   "label": "stack blocks two",
   "video": "video/wall/stack_blocks_two.mp4",
   "poster": "img/posters/wall_stack_blocks_two.jpg",
   "dur": 20.8
  },
  {
   "task": "stack_bowls_three",
   "label": "stack bowls three",
   "video": "video/wall/stack_bowls_three.mp4",
   "poster": "img/posters/wall_stack_bowls_three.jpg",
   "dur": 17.8
  },
  {
   "task": "stack_bowls_two",
   "label": "stack bowls two",
   "video": "video/wall/stack_bowls_two.mp4",
   "poster": "img/posters/wall_stack_bowls_two.jpg",
   "dur": 6.4
  },
  {
   "task": "stamp_seal",
   "label": "stamp seal",
   "video": "video/wall/stamp_seal.mp4",
   "poster": "img/posters/wall_stamp_seal.jpg",
   "dur": 9.4
  },
  {
   "task": "turn_switch",
   "label": "turn switch",
   "video": "video/wall/turn_switch.mp4",
   "poster": "img/posters/wall_turn_switch.jpg",
   "dur": 8.0
  }
 ],
 "robodojo": [
  {
   "subset": "generalization",
   "label": "arrange largest number",
   "instruction": "Arrange the numbers from left to right to form the largest possible number, and place them on the pad.",
   "video": "video/robodojo/generalization__arrange_largest_number_random.mp4",
   "poster": "img/posters/robodojo_generalization__arrange_largest_number_random.jpg",
   "dur": 54.0
  },
  {
   "subset": "generalization",
   "label": "stack blocks",
   "instruction": "Stack the three blocks with different textures.",
   "video": "video/robodojo/generalization__stack_blocks_random.mp4",
   "poster": "img/posters/robodojo_generalization__stack_blocks_random.jpg",
   "dur": 22.3
  },
  {
   "subset": "generalization",
   "label": "stack bowls",
   "instruction": "Stack the three bowls together.",
   "video": "video/robodojo/generalization__stack_bowls_random.mp4",
   "poster": "img/posters/robodojo_generalization__stack_bowls_random.jpg",
   "dur": 29.0
  },
  {
   "subset": "memory",
   "label": "cover blocks",
   "instruction": "Cover the blocks from left to right, remember their colors, then uncover them in the order: red, green, and blue.",
   "video": "video/robodojo/memory__cover_blocks.mp4",
   "poster": "img/posters/robodojo_memory__cover_blocks.jpg",
   "dur": 61.6
  },
  {
   "subset": "memory",
   "label": "imitate sorting sequence",
   "instruction": "Observe the object placement order, remember it, then place the corresponding objects into the basket in the same order. Wait until the demonstration arm has finished its demonstration before moving either robot arm.",
   "video": "video/robodojo/memory__imitate_sorting_sequence.mp4",
   "poster": "img/posters/robodojo_memory__imitate_sorting_sequence.jpg",
   "dur": 102.5
  },
  {
   "subset": "memory",
   "label": "swap blocks",
   "instruction": "Swap the two blocks using the empty mat, pressing the button after each move.",
   "video": "video/robodojo/memory__swap_blocks.mp4",
   "poster": "img/posters/robodojo_memory__swap_blocks.jpg",
   "dur": 39.7
  },
  {
   "subset": "open vocabulary",
   "label": "general pickup",
   "instruction": "Pick up the noodle cup by 10 cm.",
   "video": "video/robodojo/open_vocabulary__general_pickup.mp4",
   "poster": "img/posters/robodojo_open_vocabulary__general_pickup.jpg",
   "dur": 20.9
  },
  {
   "subset": "open vocabulary",
   "label": "solve equation",
   "instruction": "Complete the equation by selecting the correct missing number or operator and placing it on the pad, then reset the robot arm.",
   "video": "video/robodojo/open_vocabulary__solve_equation.mp4",
   "poster": "img/posters/robodojo_open_vocabulary__solve_equation.jpg",
   "dur": 30.4
  },
  {
   "subset": "open vocabulary",
   "label": "stack blocks by language",
   "instruction": "Stack the blocks from bottom to top in the order of yellow, cyan, and red, then reset the robot arm.",
   "video": "video/robodojo/open_vocabulary__stack_blocks_by_language.mp4",
   "poster": "img/posters/robodojo_open_vocabulary__stack_blocks_by_language.jpg",
   "dur": 27.1
  }
 ]
};
