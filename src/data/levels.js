export const data = [
    {
        organs: ["heart"],
        qualities_required: [],
        qualities_banned: [],
        prompt: "Greetings, trainee! Welcome to your first day at Mob and Boss Organ Concerns! We have customers willing to pay top dollar for healthy organs. Your job is to obtain said organs from our \"donors\". Now, you may have some questions. Questions such as, \"How much vacation time do I get?\", and, \"Why did you put quotation marks around the word donor?\" We'll answer both of those questions and more after your first job.\n\nWe have a customer willing to pay top-dollar for a new heart. We need you to go out, find a donor, lead him to a secluded part of the city, and tranquilize him. We'll take care of the rest.\n\nWASD: Move\nMouse: Aim and Talk\nQ: Draw or Holster Tranquilizer",
        npc_count: 3,
        preset_npcs: [
            ["drunkard"],
            [],
        ],
        quality_chances: [
            { quality: "drunkard", chance: 0.5 },
        ],
    },
    {
        organs: ["liver"],
        qualities_required: [],
        qualities_banned: [
            {
                quality: "drunkard",
                organ: "liver",
                issue: "Fatty Liver",
                solution: "Find someone who isn't an alcoholic!"
            },
        ],
        prompt: "You expressed some concerns over this whole \"Organ Harvesting\" thing. Harvest is such a dirty word. I prefer to call it \"Crowdsourced Organsharing\". But let me assuage your fears. Did you know that every year, over 8000 people die from not getting the organs they need? I say it would be immoral NOT to indulge in some harvesting! And if we didn't harvest them, someone else would. What's the harm?\n\nAnywhom, our customer wants you to find him a new liver. Now, livers and darksville residents don't tend to get along. They like their beverages alcoholic and their livers fat. You'll need to search for someone who isn't a drinker to get a quality liver.",
        npc_count: 5,
        preset_npcs: [
            ["gamer"],
            ["gamer", "drunkard"],
        ],
        quality_chances: [
            { quality: "drunkard", chance: 0.5 },
            { quality: "gamer", chance: 0.3 },
        ],
    },
    {
        organs: ["lungs"],
        qualities_required: [
            {
                quality: "athletic",
                organ: "lungs",
                issue: "Weak Lungs",
                solution: "Find someone more athletic!"
            },
        ],
        qualities_banned: [],
        prompt: "We got a real moneybags customer who's looking to compete in the Triathalon next month. To help him out, he needs a new pair of lungs. Good breathing is part of a good athlete, after all. We'll wait until after the sale to tell him about steroids.",
        npc_count: 7,
        preset_npcs: [
            ["athletic", "drunkard"],
        ],
        quality_chances: [
            { quality: "drunkard", chance: 0.8 },
            { quality: "gamer", chance: 0.2 },
            { quality: "fat", chance: 0.4 },
        ],
    },
    {
        organs: ["liver", "lungs"],
        qualities_required: [],
        qualities_banned: [
            {
                quality: "smoker",
                organ: "lungs",
                issue: "Black Lung",
                solution: "Find someone who doesn't smoke!"
            },
            {
                quality: "drunkard",
                organ: "liver",
                issue: "Fatty Liver",
                solution: "Find someone who isn't an alcoholic!"
            },
        ],
        prompt: "Great work so far! I'm assigning you a larger order this time. We need a liver and a pair of lungs. Note that these need to come from the same donor! I'm not making my boys work double duty tonight.\n\nNo special requirements, just make sure they're healthy. You'll have to talk to people a bit before you can ask them more personal questions.",
        npc_count: 8,
        preset_npcs: [
            ["athletic", "gamer"],
        ],
        quality_chances: [
            { quality: "smoker", chance: 0.5 },
            { quality: "fat", chance: 0.5 },
            { quality: "drunkard", chance: 0.6 },
            { quality: "athletic", chance: 0.05 },
            { quality: "gamer", chance: 0.2 },
        ],
    },
    {
        organs: ["tongue"],
        qualities_required: [
            {
                quality: "foodie",
                organ: "tongue",
                issue: "Unrefined Palate",
                solution: ""
            },
        ],
        qualities_banned: [],
        prompt: "We got a customer in who had his tongue cut out by the mob. Here's the kicker, he's a food critic! It's a real tragedy I tell ya. To make things right, we're gonna find him a new tongue with a real refined palate. You know what they say, \"Create a problem, sell the solution.\"",
        npc_count: 6,
        preset_npcs: [
            ["foodie", "musician", "snob"],
        ],
        quality_chances: [
            { quality: "smoker", chance: 0.4 },
            { quality: "fat", chance: 0.5 },
            { quality: "drunkard", chance: 0.6 },
            { quality: "boring", chance: 0.5 },
        ],
    },
    {
        organs: ["heart", "lungs"],
        qualities_required: [],
        qualities_banned: [
            {
                quality: "smoker",
                organ: "lungs",
                issue: "Black Lung",
                solution: ""
            },
            {
                quality: "fat",
                organ: "heart",
                issue: "Clogged Artery",
                solution: ""
            },
        ],
        prompt: "This next job is in what is lovingly referred to as the \"blubber district\". We need a human heart and lungs from one of our fine, gluttonous friends.",
        npc_count: 4,
        preset_npcs: [
            ["boring"],
        ],
        quality_chances: [
            { quality: "smoker", chance: 0.6 },
            { quality: "fat", chance: 1 },
            { quality: "drunkard", chance: 0.6 },
            { quality: "gamer", chance: 1 },
            { quality: "boring", chance: 0.5 },
        ],
    },
    {
        organs: ["finger", "lungs"],
        qualities_required: [
            {
                quality: "nimble",
                organ: "finger",
                issue: "Finger isn't nimble enough",
                solution: ""
            },
            {
                quality: "big_lungs",
                organ: "lungs",
                issue: "Weak Lungs",
                solution: ""
            },
        ],
        qualities_banned: [
            {
                quality: "smoker",
                organ: "lungs",
                issue: "Black Lung",
                solution: ""
            },
        ],
        prompt: "We just had a high-profile order come in. Guy wants to be a world-class E-Sports player and he wants us to find a donor with really nimble fingers so he can get good instantly. Now, our job isn't to ask such trifling questions as, \"Does that make any sense?\" or, \"Are you a fucking idiot?\" Our job is to do our job. So go out there and get me a gamer finger!\n\nOh, we also need another one of those really athletic lungs. So make sure he's got one of those too.",
        npc_count: 1,
        preset_npcs: [
            ["pianist", "trombone_player", "drunkard", "nimble", "big_lungs", "multi_instrumentalist"],
            ["pianist", "drunkard", "nimble"],
            ["trombone_player", "fat", "big_lungs"],
            ["smoker", "gamer", "nimble"],
            ["athletic", "drunkard", "big_lungs"],
        ],
        quality_chances: [
            { quality: "smoker", chance: 0.4 },
            { quality: "fat", chance: 0.5 },
            { quality: "drunkard", chance: 0.6 },
            { quality: "boring", chance: 0.5 },
        ],
    },
]