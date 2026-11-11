/** Demo data for /spotlight/jobs: the 11 hiring posts Spotlight's bot read
    from DEVS #jobs between 2026-11-01 and 2026-11-08 (the operator's own
    test posts are left out),
    already turned into the standard job record. Poster names, handles,
    studio names and the original post text are left out on purpose: this
    page is public, the posts were written for a Discord channel. Replace
    with the API once the standard record is served from the box. */

export type DemoJob = {
  id: number;
  role: string;
  title: string;
  pay: string;
  lo: number;
  hi: number;
  unit: 'R$' | 'USD' | 'EUR';
  usdLo: number;
  usdHi: number;
  basis: string;
  due: string;
  portfolio: boolean;
  notes: string[];
  posted: string;
  server: string;
  status: string;
};

export const DEMO_AS_OF = '2026-11-09';

export const DEMO_JOBS: DemoJob[] = [
  {
    "id": 56,
    "role": "GFX",
    "title": "Thumbnails and icons to lift click-through",
    "pay": "R$4,000–10,000 or $20–50",
    "lo": 4000,
    "hi": 10000,
    "unit": "R$",
    "usdLo": 15,
    "usdHi": 38,
    "basis": "fixed, bonus for results",
    "due": "",
    "portfolio": false,
    "notes": [
      "Pay stated in both Robux and USD",
      "Contact handle removed"
    ],
    "posted": "2026-11-08",
    "server": "DEVS",
    "status": "Open"
  },
  {
    "id": 55,
    "role": "UI",
    "title": "A few simple UI frames",
    "pay": "R$15,000",
    "lo": 15000,
    "hi": 15000,
    "unit": "R$",
    "usdLo": 57,
    "usdHi": 57,
    "basis": "fixed",
    "due": "",
    "portfolio": false,
    "notes": [
      "Scope is vague: no frame count"
    ],
    "posted": "2026-11-08",
    "server": "DEVS",
    "status": "Open"
  },
  {
    "id": 54,
    "role": "Coaching",
    "title": "Coach on AI-assisted Roblox development",
    "pay": "R$10,000–50,000",
    "lo": 10000,
    "hi": 50000,
    "unit": "R$",
    "usdLo": 38,
    "usdHi": 190,
    "basis": "fixed",
    "due": "",
    "portfolio": false,
    "notes": [
      "Teaching, not a deliverable"
    ],
    "posted": "2026-11-07",
    "server": "DEVS",
    "status": "Open"
  },
  {
    "id": 53,
    "role": "Modeling",
    "title": "Goose model plus 8 skins",
    "pay": "About R$3,000 per model",
    "lo": 3000,
    "hi": 3000,
    "unit": "R$",
    "usdLo": 11,
    "usdHi": 11,
    "basis": "per piece",
    "due": "24 hours",
    "portfolio": false,
    "notes": [
      "Rush: due within a day"
    ],
    "posted": "2026-11-06",
    "server": "DEVS",
    "status": "Open"
  },
  {
    "id": 52,
    "role": "VFX",
    "title": "Anime-style VFX",
    "pay": "R$20,000",
    "lo": 20000,
    "hi": 20000,
    "unit": "R$",
    "usdLo": 76,
    "usdHi": 76,
    "basis": "fixed",
    "due": "Next day",
    "portfolio": false,
    "notes": [
      "Rush: due within a day",
      "Robux only"
    ],
    "posted": "2026-11-04",
    "server": "DEVS",
    "status": "Open"
  },
  {
    "id": 51,
    "role": "Scripting",
    "title": "FPS scripter for an arena duel game",
    "pay": "$2,500 + 20% share",
    "lo": 2500,
    "hi": 2500,
    "unit": "USD",
    "usdLo": 2500,
    "usdHi": 2500,
    "basis": "fixed + revenue share",
    "due": "2 to 2.5 weeks",
    "portfolio": true,
    "notes": [
      "Revenue share on top of fixed pay",
      "Genre experience required"
    ],
    "posted": "2026-11-03",
    "server": "DEVS",
    "status": "Open"
  },
  {
    "id": 50,
    "role": "Building",
    "title": "Map for a +1 style game",
    "pay": "R$30,000+",
    "lo": 30000,
    "hi": 30000,
    "unit": "R$",
    "usdLo": 114,
    "usdHi": 114,
    "basis": "fixed",
    "due": "",
    "portfolio": false,
    "notes": [],
    "posted": "2026-11-03",
    "server": "DEVS",
    "status": "Open"
  },
  {
    "id": 49,
    "role": "GFX",
    "title": "Two thumbnails in an existing style, no AI",
    "pay": "R$10,000 (R$5,000 each)",
    "lo": 5000,
    "hi": 5000,
    "unit": "R$",
    "usdLo": 19,
    "usdHi": 19,
    "basis": "per piece",
    "due": "",
    "portfolio": false,
    "notes": [
      "Asks for no AI"
    ],
    "posted": "2026-11-02",
    "server": "DEVS",
    "status": "Open"
  },
  {
    "id": 48,
    "role": "Modeling",
    "title": "Low-poly weapons and R15 armour sets",
    "pay": "R$35,000",
    "lo": 35000,
    "hi": 35000,
    "unit": "R$",
    "usdLo": 133,
    "usdHi": 133,
    "basis": "fixed",
    "due": "Within a week",
    "portfolio": false,
    "notes": [
      "16 weapons, 3-piece armour sets"
    ],
    "posted": "2026-11-02",
    "server": "DEVS",
    "status": "Open"
  },
  {
    "id": 47,
    "role": "Building",
    "title": "Simple baseplate-style duel map",
    "pay": "R$25,000",
    "lo": 25000,
    "hi": 25000,
    "unit": "R$",
    "usdLo": 95,
    "usdHi": 95,
    "basis": "fixed",
    "due": "1 day",
    "portfolio": false,
    "notes": [
      "Rush: due within a day"
    ],
    "posted": "2026-11-01",
    "server": "DEVS",
    "status": "Open"
  },
  {
    "id": 46,
    "role": "UI",
    "title": "Themed HUD for a +1 game",
    "pay": "$60",
    "lo": 60,
    "hi": 60,
    "unit": "USD",
    "usdLo": 60,
    "usdHi": 60,
    "basis": "fixed",
    "due": "",
    "portfolio": false,
    "notes": [],
    "posted": "2026-11-01",
    "server": "DEVS",
    "status": "Talking to creators"
  }
];
