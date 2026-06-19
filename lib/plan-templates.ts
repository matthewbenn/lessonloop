import type { GeneratedLessonPlan } from "@/lib/ai/lesson-plan-generator";

export type PlanTemplate = {
  id: string;
  name: string;
  draft: GeneratedLessonPlan;
};

export const planTemplates: PlanTemplate[] = [
  {
    id: "driver-slice",
    name: "Driver slice",
    draft: {
      title: "Driver slice",
      focus: "Reduce the slice by pairing clubface awareness with a calmer, more neutral swing path.",
      mainCue: "Close the face early, then swing to right field.",
      planJson: {
        coach_notes:
          "Driver slice template. Add the student's usual start line, curve, setup tendencies, and any video checkpoints before sharing.",
        summary:
          "Build a driver pattern that starts closer to the target and curves less by checking alignment, clubface control, and path in a low-pressure progression.",
        warmup: [
          "Make 10 slow driver rehearsals with relaxed grip pressure",
          "Hit 5 easy tee shots at 60 percent speed and note start line",
          "Check that feet, hips, and shoulders are not aimed too far left"
        ],
        lesson_steps: [
          "Set the lead hand so two to three knuckles are visible at address",
          "Rehearse the clubface matching the lead forearm by waist high",
          "Place a headcover just outside the ball and swing through without clipping it",
          "Hit small sets of drivers while tracking start line first, curve second"
        ],
        practice_plan: [
          "Hit 3 sets of 5 drivers at 70 percent speed with the headcover gate",
          "Pause after each ball and call out start line before checking curve",
          "Finish with 5 drivers using only the main cue"
        ],
        success_markers: [
          "Ball starts closer to the intended line",
          "Curve is playable instead of a big slice",
          "Student can explain whether face or path caused the miss"
        ]
      }
    }
  },
  {
    id: "fat-irons",
    name: "Fat irons",
    draft: {
      title: "Fat irons",
      focus: "Move low point forward so contact happens ball first, then turf.",
      mainCue: "Brush the turf after the ball.",
      planJson: {
        coach_notes:
          "Fat irons template. Add the student's setup, weight shift pattern, divot location, and the club used most often before sharing.",
        summary:
          "Create cleaner iron contact by improving pressure shift, low-point awareness, and a simple divot-after-ball feedback station.",
        warmup: [
          "Make 10 small swings brushing the turf ahead of a tee",
          "Hit 5 half-swings with feet narrow and pressure finishing forward",
          "Use a towel behind the ball to make low point feedback obvious"
        ],
        lesson_steps: [
          "Start with slightly more pressure on the lead foot at address",
          "Rehearse a short backswing and finish with the chest facing the target",
          "Place a towel 4 inches behind the ball and miss the towel through impact",
          "Build from half-swings to three-quarter swings before using full speed"
        ],
        practice_plan: [
          "Hit 4 sets of 6 balls with the towel station",
          "Move the towel closer only when contact stays clean",
          "End practice with 10 normal shots and keep the same finish"
        ],
        success_markers: [
          "Towel stays untouched on most swings",
          "Divot or brush mark appears after the ball",
          "Ball flight launches with more consistent height"
        ]
      }
    }
  },
  {
    id: "putting-pace",
    name: "Putting pace",
    draft: {
      title: "Putting pace",
      focus: "Control distance by matching stroke length to target distance while keeping rhythm steady.",
      mainCue: "Same rhythm, different length.",
      planJson: {
        coach_notes:
          "Putting pace template. Add green speed, common miss distance, dominant slope trouble, and the student's pre-putt routine before sharing.",
        summary:
          "Sharpen pace control with ladder drills, consistent tempo, and a simple routine that helps the student react to distance instead of steering the putter.",
        warmup: [
          "Roll 10 putts while looking at the hole to feel distance",
          "Make 5 rehearsal strokes for short, medium, and long putts",
          "Choose one tempo word and keep it the same for every putt"
        ],
        lesson_steps: [
          "Set up a 10, 20, and 30 foot ladder with small landing zones",
          "Use the same rhythm and change only stroke length",
          "Roll three balls to each zone and reset the routine before every putt",
          "Finish with random distances so the student must read and react"
        ],
        practice_plan: [
          "Spend 10 minutes on a three-distance ladder",
          "Score one point for each putt finishing within a putter length",
          "Repeat until scoring 7 out of 9, then randomize the distances"
        ],
        success_markers: [
          "First putt finishes inside a comfortable two-putt range",
          "Stroke rhythm stays consistent across distances",
          "Student can adjust length without adding hit"
        ]
      }
    }
  },
  {
    id: "wedge-distance",
    name: "Wedge distance",
    draft: {
      title: "Wedge distance",
      focus: "Build predictable carry numbers with simple clock-length wedge swings.",
      mainCue: "Match the finish to the distance.",
      planJson: {
        coach_notes:
          "Wedge distance template. Add the student's wedge lofts, current carry gaps, preferred yardages, and common miss before sharing.",
        summary:
          "Turn wedge practice into a distance matrix by pairing shorter swing lengths with measured carry targets and a consistent finish.",
        warmup: [
          "Hit 8 soft wedge shots focusing on centered contact",
          "Rehearse waist-high and chest-high finishes without a ball",
          "Pick one target and land three balls near it before changing distance"
        ],
        lesson_steps: [
          "Choose one wedge and define three swing lengths",
          "Hit five balls with each length and record average carry",
          "Keep tempo even and finish balanced instead of adding speed late",
          "Randomize the three distances and call the swing length before each shot"
        ],
        practice_plan: [
          "Build a simple carry chart for one wedge this week",
          "Practice 3 rounds of 9 balls, rotating short, medium, and long",
          "Write down which swing length produced the tightest pattern"
        ],
        success_markers: [
          "Student knows three stock carry numbers",
          "Finish length matches the intended distance",
          "Distance misses shrink without changing clubs mid-drill"
        ]
      }
    }
  },
  {
    id: "bunker-escape",
    name: "Bunker escape",
    draft: {
      title: "Bunker escape",
      focus: "Use setup and sand contact to launch the ball out reliably.",
      mainCue: "Splash the sand, finish high.",
      planJson: {
        coach_notes:
          "Bunker escape template. Add sand firmness, lie type, usual miss, and whether the student leaves shots in the bunker or blades them before sharing.",
        summary:
          "Make bunker shots more predictable by setting the face, entering the sand in the right spot, and committing to a full finish.",
        warmup: [
          "Draw a line in the sand and splash the line without a ball",
          "Make 8 swings finishing with the clubhead above the hands",
          "Practice opening the face before taking the grip"
        ],
        lesson_steps: [
          "Open the clubface first, then set the hands on the grip",
          "Place the ball forward and keep weight favoring the lead foot",
          "Enter the sand about two inches behind the ball",
          "Swing through to a high finish without trying to lift the ball"
        ],
        practice_plan: [
          "Hit 10 line drills with no ball before adding balls",
          "Play 3 sets of 5 bunker shots and count only balls that exit the bunker",
          "End with 5 shots to a landing spot, keeping the same splash cue"
        ],
        success_markers: [
          "Ball exits the bunker consistently",
          "Sand splash starts near the intended entry point",
          "Finish is full rather than stopping at impact"
        ]
      }
    }
  },
  {
    id: "contact-reset",
    name: "Contact reset",
    draft: {
      title: "Contact reset",
      focus: "Find centered contact again with balance, tempo, and a simple strike feedback station.",
      mainCue: "Balanced finish, centered strike.",
      planJson: {
        coach_notes:
          "Contact reset template. Add the student's main contact miss, usual club, strike pattern, and any balance or tempo notes before sharing.",
        summary:
          "Reset ball striking with slower swings, centered-face feedback, and a finish that makes balance and contact easier to repeat.",
        warmup: [
          "Make 10 slow swings holding the finish for three seconds",
          "Hit 5 half-swings with the feet together",
          "Spray the clubface or use impact tape to see strike location"
        ],
        lesson_steps: [
          "Start every swing with a balanced setup and quiet grip pressure",
          "Hit half-swings until strike marks move toward the center",
          "Add speed only after holding the finish without stepping",
          "Alternate one rehearsal swing and one ball for each repetition"
        ],
        practice_plan: [
          "Use strike spray for 15 balls and circle centered contacts",
          "Keep a three-second finish on every shot",
          "Move from half-swings to full swings only when contact stays centered"
        ],
        success_markers: [
          "Strike pattern moves toward the center of the face",
          "Student can hold the finish after most swings",
          "Contact improves without needing many swing thoughts"
        ]
      }
    }
  }
];
