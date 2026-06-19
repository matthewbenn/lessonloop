export type Drill = {
  id: string;
  title: string;
  description: string;
  tags: string[];
};

export const DRILL_LIBRARY: Drill[] = [
  {
    id: "gate-start-line",
    title: "Gate start line",
    description: "Set two tees just ahead of the ball and roll or launch shots through the gate.",
    tags: ["start line", "face"]
  },
  {
    id: "towel-low-point",
    title: "Towel low point",
    description: "Place a towel behind the ball and make ball-first contact without brushing it.",
    tags: ["contact", "low point"]
  },
  {
    id: "path-stick-channel",
    title: "Path stick channel",
    description: "Use two alignment sticks to shape the club path through impact.",
    tags: ["path", "alignment"]
  },
  {
    id: "clock-wedge-ladder",
    title: "Clock wedge ladder",
    description: "Hit wedge shots with 8, 9, and 10 o'clock swings and record carry distance.",
    tags: ["wedges", "distance"]
  },
  {
    id: "putting-ladder",
    title: "Putting ladder",
    description: "Putt to 10, 20, and 30 feet while keeping the same tempo.",
    tags: ["putting", "pace"]
  },
  {
    id: "bunker-splash-line",
    title: "Bunker splash line",
    description: "Draw a line in the sand and splash the line out before adding a ball.",
    tags: ["bunker", "sand"]
  },
  {
    id: "finish-balance-hold",
    title: "Finish balance hold",
    description: "Hold the finish for three seconds and score only swings that stay balanced.",
    tags: ["balance", "tempo"]
  },
  {
    id: "nine-shot-window",
    title: "Nine-shot window",
    description: "Work low, stock, and high windows while keeping start line inside a small target.",
    tags: ["flight", "control"]
  }
];
