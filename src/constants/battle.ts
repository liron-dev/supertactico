// Attacker-priority special cases: attacker always wins regardless of rank
export const ATTACKER_PRIORITY: { attacker: string; defender: string }[] = [
  { attacker: 'Commando', defender: 'Rav Aluf' },
  { attacker: 'Navy Seal', defender: 'M7 Ship' },
  { attacker: 'Navy Seal', defender: 'Rav Aluf' },
];

// Unit victory table: specific matchups for non-ranked units
export const UNIT_VICTORIES: Record<string, { defeats: string[]; except?: string[] }> = {
  'Commando': {
    defeats: ['Navy Seal', 'Naval mine', 'Land mine', 'Flag', 'Fighter Plane', 'Reconnaissance Plane'],
  },
  'Navy Seal': {
    defeats: ['Naval mine', 'Fighter Plane', 'Reconnaissance Plane', 'Flag'],
  },
  'Fighter Plane': {
    defeats: ['Reconnaissance Plane'],
  },
  'M7 Ship': {
    defeats: ['M4 Ship', 'Patrol Ship', 'Life Raft', 'Fighter Plane', 'Reconnaissance Plane', 'Naval mine'],
  },
  'M4 Ship': {
    defeats: ['Patrol Ship', 'Life Raft', 'Fighter Plane', 'Reconnaissance Plane'],
  },
  'Patrol Ship': {
    defeats: ['Life Raft'],
  },
  'Life Raft': {
    defeats: ['Fighter Plane', 'Reconnaissance Plane'],
  },
  'Land mine': {
    defeats: ['All'],
    except: ['Commando'],
  },
  'Naval mine': {
    defeats: ['All'],
    except: ['Navy Seal', 'Commando', 'M7 Ship'],
  },
  'Flag': {
    defeats: ['Navy Seal', 'Fighter Plane', 'Reconnaissance Plane'],
  },
};
