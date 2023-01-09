export const data = {
    // Basic
    greeting: {
        level_required: 1,
        friendliness_required: 0,
        friendliness_qualities: ["all"],
        topic_relevance: {
            introduction: {
                required: 0,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "Howdy", weight: 30 },
            { value: "Heya", weight: 30 },
            { value: "Hello", weight: 100 },
            { value: "Hi", weight: 100 },
            { value: "Yo", weight: 3 },
            { value: "Hola", weight: 3 },
        ],
        responses_default: [
            { value: "Howdy", weight: 30 },
            { value: "Heya", weight: 30 },
            { value: "Hello", weight: 100 },
            { value: "Hi", weight: 100 },
            { value: "Yo", weight: 3 },
            { value: "Hola", weight: 3 },
            { value: "Nice to meet you.", weight: 9 },
            { value: "Likewise", weight: 3 },
        ],
    },
    weather: {
        level_required: 1,
        friendliness_required: 1,
        friendliness_qualities: ["all"],
        topic_relevance: {
            weather: {
                required: 0,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "Nice weather tonight, huh?", weight: 100 },
            { value: "Sure looks like rain", weight: 10 },
            { value: "It sure is nice out tonight", weight: 100 },
            { value: "What a beautiful starry night", weight: 100 },
            { value: "Gotta love city weather", weight: 10 },
            { value: "Great organ-harvesting weather, isn't it?", weight: 1 },
        ],
        responses_default: [
            { value: "I suppose so", weight: 100 },
            { value: "Yeah, I guess", weight: 100 },
            { value: "Definitely", weight: 100 },
            { value: "Sure", weight: 10 },
            { value: "I agree", weight: 100 },
        ],
    },

    // Alcohol
    nearby_bar: {
        level_required: 1,
        friendliness_required: 1,
        friendliness_qualities: ["drunkard"],
        topic_relevance: {
            alcohol: {
                required: 0,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "Know any good bars around here?", weight: 100 },
            { value: "Do you know where a good bar is?", weight: 100 },
            { value: "Do you know where's the best bar around here?", weight: 100 },
            { value: "I seriously need a drink. Know a good place?", weight: 20 },
            { value: "I'm new in town. Do you know what are the best bars?", weight: 20 },
            { value: "Know any places a fellow can drown his sorrows?", weight: 5 },
            { value: "Know any places a fellow can get blasted?", weight: 5 },
            { value: "Know any places a fellow can drink himself under the table?", weight: 5 },
            { value: "Know any places a fellow can get hammered?", weight: 5 },
            { value: "Know any places a fellow can get slammed?", weight: 5 },
            { value: "Know any places a fellow can get slammered?", weight: 1 },
            { value: "Know any places a guy can get himself liquored right on up?", weight: 3 },
            { value: "Know any places a guy can get some good Beer?", weight: 5 },
        ],
        responses_default: [
            { value: "Not really. I don't drink.", weight: 100 },
            { value: "Sorry, no. I'm not much of a drinker.", weight: 100 },
            { value: "Nope, sorry. I wouldn't know.", weight: 100 },
            { value: "Absolutely not! Alcohol kills your brain cells!", weight: 10 },
            { value: "Surely not! I do not indulge in such sinful pleasures!", weight: 10 },
        ],
        responses_drunkard: [
            { value: "Fuck yeah I do! You gotta try Jerry's Drinkhole!", weight: 100 },
            { value: "Fuck yeah I do! You gotta try Sleazy K's!", weight: 100 },
            { value: "Fuck yeah I do! You gotta try The Quickshot!", weight: 100 },

            { value: "You've gotta try Jerry's Drinkhole. I'm a regular, so I can get you in. Just ask.", weight: 100 },
            { value: "You've gotta try Sleazy K's. I'm a regular, so I can get you in. Just ask.", weight: 100 },
            { value: "You've gotta try The Quickshot. I'm a regular, so I can get you in. Just ask.", weight: 100 },

            { value: "Jerry's Drinkhole is down the block. I'm there every night!", weight: 100 },
            { value: "Sleazy K's is down the block. I'm there every night!", weight: 100 },
            { value: "The Quickshot is down the block. I'm there every night!", weight: 100 },
        ],
        responses_snob: [
            { value: "Not in this neighborhood. The beer here tastes like swill.", weight: 100 },
        ],
    },
    lets_drink: {
        level_required: 1,
        friendliness_required: 20,
        friendliness_qualities: ["drunkard"],
        topic_relevance: {
            alcohol: {
                required: 10,
                added: 100,
            },
        },
        follow_conditions: ["drunkard", "snob"],
        options: [
            { value: "Wanna join me for a drink?", weight: 100 },
            { value: "Wanna come drinking with me?", weight: 100 },
            { value: "Wanna kill some brain cells with me?", weight: 30 },
        ],
        responses_default: [
            { value: "No, I don't drink!", weight: 100 },
        ],
        responses_drunkard: [
            { value: "Let's do it!", weight: 100 },
            { value: "I'm down!", weight: 100 },
            { value: "Absolutely!", weight: 100 },
            { value: "Sure!", weight: 100 },
        ],
        responses_snob: [
            { value: "I suppose so.", weight: 100 },
        ],
    },
    favorite_alcohol: {
        level_required: 4,
        friendliness_required: 20,
        friendliness_qualities: ["drunkard"],
        topic_relevance: {
            alcohol: {
                required: 20,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "What's your favorite drink?", weight: 100 },
            { value: "What's your poison?", weight: 100 },
        ],
        responses_default: [
            { value: "I don't drink, so I don't have a favorite.", weight: 100 },
        ],
        responses_drunkard: [
            { value: "I'm a whiskey man.", weight: 100 },
            { value: "I guess I sort of like 'em all.", weight: 100 },
            { value: "You ever try Zafiro Añejo?", weight: 5 },
            { value: "Man, that's a tough choice. Vodka, probably.", weight: 100 },
            { value: "Beer. My roommate made a sick microbrew.", weight: 100 },
            { value: "Hard lemonade. I can't stand the taste of Beer.", weight: 20 },
        ],
        responses_snob: [
            { value: "I would only be interested in the rarest vintages from France.", weight: 100 },
        ],
    },
    mixing_drinks: {
        level_required: 4,
        friendliness_required: 20,
        friendliness_qualities: ["drunkard"],
        topic_relevance: {
            alcohol: {
                required: 50,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "Ever tried mixing drinks?", weight: 100 },
        ],
        responses_default: [
            { value: "I don't drink, so no.", weight: 100 },
        ],
        responses_drunkard: [
            { value: "I'm going to bartending school, actually.", weight: 100 },
            { value: "I tried once, it was a disaster.", weight: 100 },
            { value: "Oh yeah, you should seem my liquor cabinet.", weight: 100 },
            { value: "Nah, I just order from the bar.", weight: 100 },
            { value: "I'd be afraid of making someone go blind!", weight: 10 },
        ],
        responses_snob: [
            { value: "Cocktails? Surely you jest.", weight: 100 },
        ],
    },

    // Smoking
    bum_smoke: {
        level_required: 4,
        friendliness_required: 30,
        friendliness_qualities: ["smoker"],
        topic_relevance: {
            smoking: {
                required: 0,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "Mind if I bum a smoke?", weight: 100 },
            { value: "Mind if I bum a cigarette?", weight: 100 },
            { value: "Got a cigarette? I'd really appreciate it.", weight: 100 },
        ],
        responses_default: [
            { value: "I don't smoke, so I don't have any.", weight: 100 },
            { value: "I don't have any, sorry.", weight: 100 },
            { value: "Get lost, tar-breath.", weight: 20 },
            { value: "Fuck off, dirtylungs.", weight: 20 },
            { value: "Get your second-hand smoke away from me, loser.", weight: 20 },
        ],
        responses_smoker: [
            { value: "Sure. Here you go.", weight: 100 },
            { value: "Yeah. Need a light?", weight: 100 },
            { value: "Careful. Don't wanna fuck up your lungs the way I have.", weight: 5 },
            { value: "Sorry, I quit a month ago. A little too late though.", weight: 5 },
        ],
    },

    // Food
    where_to_eat: {
        level_required: 5,
        friendliness_required: 1,
        friendliness_qualities: ["all"],
        topic_relevance: {
            food: {
                required: 0,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "Do you know where the good restaurants are?", weight: 100 },
            { value: "Do you know a guy could get a bite to eat around here?", weight: 100 },
            { value: "Where's all the best food in this town?", weight: 100 },
        ],
        responses_default: [
            { value: "I think the Burg-R-Save is open right now.", weight: 100 },
            { value: "There's a Taco truck down that way.", weight: 100 },
            { value: "There's a good Mexi-Cali-French restaurant just down the street.", weight: 100 },
            { value: "Try Bagel Beagle just around the corner. They don't skimp on the cream cheese.", weight: 20 },
        ],
        responses_foodie: [
            { value: "Ugh, there aren't any good places to eat within a ten mile radius.", weight: 100 },
            { value: "Definitely not around here. The restaurants here are awful.", weight: 100 },
            { value: "If you want good food, stay away from this area, my friend.", weight: 10 },
        ],
    },
    favorite_restaurant: {
        level_required: 5,
        friendliness_required: 30,
        friendliness_qualities: ["all", "fat"],
        topic_relevance: {
            food: {
                required: 10,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "What is your favorite place to eat in this city?", weight: 100 },
            { value: "Where do you prefer to eat?", weight: 100 },
        ],
        responses_default: [
            { value: "Burg-R-Save is my favorite.", weight: 100 },
            { value: "Burg-R-Save makes the best burgers. You should try their one-and-a-quarter-pounder.", weight: 10 },
            { value: "Burg-R-Save makes the best burgers. And you save!", weight: 10 },
            { value: "That Mexi-Cali-French restaurant is really good. I love their Dijon Burrito Blasters.", weight: 90 },
            { value: "Jake's Pastries is my favorite. They make an ice cream cake served in a bowl of hot fudge!", weight: 41 },
            { value: "Burg-R-Save is great. Can't go wrong with the ham fries.", weight: 10 },
            { value: "Burg-R-Save is great. Can't go wrong with the deep fried deep fry batter.", weight: 1 },
            { value: "Burg-R-Save is great. Can't go wrong with the deep fried lard.", weight: 10 },
        ],
        responses_foodie: [
            { value: "Arnoff's is decent, but the breadsticks were somewhat dry.", weight: 100 },
            { value: "Ordinarily I would recommend Ourduinou's but they have cheaped out on their olives of late.", weight: 100 },
            { value: "The Salad Bowl makes a good salad. Too bad their tuna melt couldn't make the grade.", weight: 100 },
            { value: "I quite like the food at King's Kitchen, though the wait staff are rather curt. 3/5 stars.", weight: 100 },
        ],
    },
    food_how_often: {
        level_required: 5,
        friendliness_required: 40,
        friendliness_qualities: ["all"],
        topic_relevance: {
            food: {
                required: 20,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "How often do you eat there?", weight: 100 },
            { value: "Do you eat there a lot?", weight: 100 },
        ],
        responses_default: [
            { value: "Every couple of weeks, probably. I don't eat out too much.", weight: 100 },
            { value: "Not too often. It's a treat.", weight: 100 },
            { value: "Ocasionally. Don't want to be eating junk food every day.", weight: 100 },
        ],
        responses_fat: [
            { value: "Every day!", weight: 100 },
            { value: "I eat there all the time. Sometimes even twice in one day!", weight: 100 },
            { value: "At least four times a week. It's too good!", weight: 100 },
        ],
        responses_foodie: [
            { value: "I ate there twice last week for my food blog.", weight: 100 },
            { value: "Occasionally. There are oh so many restaurants to try in this state!", weight: 100 },
            { value: "A few times a year. I would love to eat there more, but it's rather pricy.", weight: 100 },
        ],
    },

    // Sports
    sports_events: {
        level_required: 3,
        friendliness_required: 1,
        friendliness_qualities: ["athletic"],
        topic_relevance: {
            sports: {
                required: 0,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "Are there any sports events happening soon?", weight: 100 },
            { value: "I'm new in town. Are there any sports events happening?", weight: 100 },
        ],
        responses_default: [
            { value: "Yeah, the bucks are playing next week.", weight: 100 },
            { value: "I think the bucks are playing a home game next week.", weight: 100 },
        ],
        responses_unathletic: [
            { value: "I wouldn't know, sorry.", weight: 100 },
            { value: "I'm the wrong person to ask.", weight: 100 },
            { value: "Not sure, sorry.", weight: 10 },
        ],
        responses_snob: [
            { value: "As it happens, I do not know where to find sweaty men tackling each other.", weight: 60 },
            { value: "I have no interest in sports, so I wouldn't know.", weight: 100 },
        ],
    },
    playing_sports: {
        level_required: 3,
        friendliness_required: 20,
        friendliness_qualities: ["athletic"],
        topic_relevance: {
            sports: {
                required: 1,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "Do you play any sports?", weight: 100 },
            { value: "What sports are you into?", weight: 100 },
        ],
        responses_default: [
            { value: "I don't play any sports myself. I just watch.", weight: 100 },
            { value: "Sports are cool in theory, but actually playing them is too much effort", weight: 30 },
            { value: "Nah, I'm too lazy.", weight: 100 },
            { value: "I like sports, I just prefer if there's a TV screen in between us.", weight: 5 },
            { value: "Yeah, my fantasy league is...oh wait you meant actual sports. Then no.", weight: 5 },
            { value: "I prefer to watch rather than play.", weight: 20 },
        ],
        responses_athletic: [
            { value: "I'm really into hockey.", weight: 100 },
            { value: "Football is great. Really gets the heartrate up.", weight: 100 },
            { value: "Basketball is great! Really gets the blood pumping.", weight: 100 },
            { value: "I'm a soccer man myself. Played all my life.", weight: 100 },
            { value: "I do love me some Ping-Pong.", weight: 5 },
            { value: "I'm actually on the darksville curling team!", weight: 5 },
        ],
        responses_fat: [
            { value: "Not a fan of sports myself.", weight: 100 },
            { value: "Nope. I hate sports.", weight: 100 },
            { value: "Sports are dumb.", weight: 10 },
        ],
        responses_gamer: [
            { value: "Nah, I'm more into video games.", weight: 100 },
            { value: "Not unless you count Esports.", weight: 5 },
            { value: "I'm not into sports. That's time I could be spending on my Ludum Dare entry.", weight: 1 },
        ],
        responses_snob: [
            { value: "I do not partake in such savage activities.", weight: 100 },
            { value: "I have no interest in sports.", weight: 10 },
            { value: "I have better things to do with my time than tackle other sweaty men.", weight: 100 },
            { value: "Is that a joke? No, I do not play sportsball.", weight: 100 },
            { value: "Sportsball is for boorish thugs. I am a refined individual.", weight: 100 },
            { value: "I am an intellectual, so no.", weight: 100 },
        ],
    },
    join_sports: {
        level_required: 4,
        friendliness_required: 30,
        friendliness_qualities: [],
        topic_relevance: {
            sports: {
                required: 20,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "Want to come play basketball with me?", weight: 100 },
            { value: "Want to play some soccer?", weight: 100 },
            { value: "Interested in a game of football?", weight: 100 },
        ],
        responses_default: [
            { value: "At this time of night?", weight: 100 },
            { value: "Isn't it a bit late for that?", weight: 100 },
            { value: "Not at this hour.", weight: 100 },
        ],
        responses_fat: [
            { value: "Not a fan of sports myself.", weight: 100 },
            { value: "Nope. I hate sports.", weight: 100 },
            { value: "Sports are dumb.", weight: 10 },
        ],
        responses_gamer: [
            { value: "Nah, I'm more into video games.", weight: 100 },
            { value: "Not unless you count Esports.", weight: 5 },
            { value: "I'm not into sports. That's time I could be spending on my Ludum Dare entry.", weight: 1 },
        ],
        responses_snob: [
            { value: "Emphatically no.", weight: 100 },
        ],
    },

    // Gaming
    playing_gaming: {
        level_required: 2,
        friendliness_required: 20,
        friendliness_qualities: ["gamer"],
        topic_relevance: {
            gaming: {
                required: 0,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "Do you play video games?", weight: 100 },
            { value: "Do you play any video games?", weight: 100 },
            { value: "Are you a gamer?", weight: 20 },
            { value: "Are you an epic gamer?", weight: 1 },
        ],
        responses_default: [
            { value: "I don't play video games.", weight: 100 },
            { value: "Video games are for nerds.", weight: 5 },
            { value: "Video games are for dorks.", weight: 5 },
            { value: "What? I'm no nerd.", weight: 2 },
        ],
        responses_gamer: [
            { value: "Absolutely! I've got a kitted out gaming PC.", weight: 100 },
            { value: "For sure! Video games are sick.", weight: 100 },
            { value: "For sure! Video games are sicc as fucc.", weight: 1 },
            { value: "I Love me some gaming!", weight: 40 },
            { value: "Well duh. How else am I supposed to pass the time?", weight: 10 },
            { value: "I love games! Have you heard of Ludum Dare?", weight: 10 },
        ],
        responses_snob: [
            { value: "Video games? How drole.", weight: 100 },
            { value: "Video games? How pedestrian.", weight: 100 },
        ],
    },
    console_gaming: {
        level_required: 2,
        friendliness_required: 20,
        friendliness_qualities: ["gamer"],
        topic_relevance: {
            gaming: {
                required: 10,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "PC or console?", weight: 100 },
            { value: "What console do you have?", weight: 100 },
        ],
        responses_default: [
            { value: "I don't play video games.", weight: 100 },
            { value: "Video games are for nerds.", weight: 5 },
            { value: "Video games are for dorks.", weight: 5 },
            { value: "What? I'm no nerd.", weight: 2 },
        ],
        responses_gamer: [
            { value: "I'm a PC gamer.", weight: 100 },
            { value: "I've got a Switch.", weight: 100 },
            { value: "PC master race!", weight: 5 },
            { value: "I play XBOX.", weight: 100 },
            { value: "I have a Playstation.", weight: 100 },
        ],
    },
    favorite_game: {
        level_required: 2,
        friendliness_required: 20,
        friendliness_qualities: ["gamer"],
        topic_relevance: {
            gaming: {
                required: 10,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "What games do you play?", weight: 100 },
            { value: "What's your favorite game?", weight: 100 },
        ],
        responses_default: [
            { value: "I don't play video games.", weight: 100 },
            { value: "Video games are for nerds.", weight: 5 },
            { value: "Video games are for dorks.", weight: 5 },
        ],
        responses_gamer: [
            { value: "Portal is my favorite!", weight: 50 },
            { value: "Portal 2 is my favorite!", weight: 50 },
            { value: "I've been playing a lot of Minecraft lately.", weight: 100 },
            { value: "I'm addicted to Team Fortress 2.", weight: 100 },
            { value: "Ever played Undertale? That game is bomb.", weight: 100 },
            { value: "I'm more of a Retro gamer. Quake still kicks ass 27 years later.", weight: 100 },
        ],
    },
    play_some_games: {
        level_required: 2,
        friendliness_required: 50,
        friendliness_qualities: ["gamer"],
        topic_relevance: {
            gaming: {
                required: 30,
                added: 10,
            },
        },
        follow_conditions: ["gamer"],
        options: [
            { value: "Want to see my gaming PC?", weight: 100 },
            { value: "I have an actual copy of the original Earthbound. Want to see it?", weight: 100 },
            { value: "Want to kick it and play some games?", weight: 100 },
            { value: "I bet I could kick your ass at Smash. Wanna find out?", weight: 100 },
        ],
        responses_default: [
            { value: "Fuck no. Games are for nerds", weight: 80 },
            { value: "I don't play video games, so no.", weight: 100 },
            { value: "I would rather eat a shotgun barrel than play your dorky nerd games, you dorky nerd.", weight: 3 },
        ],
        responses_gamer: [
            { value: "Yeah!", weight: 50 },
            { value: "Yeah, let's go!", weight: 50 },
            { value: "For sure!", weight: 50 },
            { value: "Let's see it!", weight: 50 },
            { value: "Gamer time!", weight: 1 },
        ],
    },

    // Music
    music_scene: {
        level_required: 3,
        friendliness_required: 1,
        friendliness_qualities: ["all"],
        topic_relevance: {
            music: {
                required: 0,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "How's the music scene in this town, anyway?", weight: 100 },
            { value: "Do you know if there are any concerts coming up?", weight: 100 },
            { value: "Do they play live music anywhere around here?", weight: 100 },
        ],
        responses_default: [
            { value: "I think there's a Big Eddie concert this weekend.", weight: 50 },
            { value: "I think there's a Lil Eddie concert this weekend.", weight: 50 },
            { value: "You should check out the Soul Pit. Great music there.", weight: 100 },
        ],
        responses_boring: [
            { value: "Sorry, I'm not sure", weight: 100 },
            { value: "I wouldn't know, sorry.", weight: 100 },
        ],
        responses_snob: [
            { value: "The music scene in this town is quite dreadful. I can't recommend anything.", weight: 50 },
        ],
    },
    music_type: {
        level_required: 3,
        friendliness_required: 30,
        friendliness_qualities: ["all"],
        topic_relevance: {
            music: {
                required: 10,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "What kind of music do you listen to?", weight: 100 },
            { value: "What's your favorite kind of music?", weight: 100 },
        ],
        responses_default: [
            { value: "I love me some classic rock.", weight: 100 },
            { value: "I like jazz.", weight: 100 },
            { value: "For me, nothing beats the blues.", weight: 100 },
            { value: "Hip-Hop is my favorite.", weight: 50 },
            { value: "I mostly listen to rap.", weight: 50 },
        ],
        responses_boring: [
            { value: "I don't really listen to music.", weight: 100 },
        ],
        responses_gamer: [
            { value: "I mostly listen to video game music", weight: 50 },
            { value: "I pretty much only listen to video game OST's", weight: 50 },
        ],
        responses_snob: [
            { value: "Certainly not the same kind you listen to.", weight: 50 },
        ],
        responses_pianist: [
            { value: "Probably Chopin. His work is simply beautiful.", weight: 100 },
            { value: "Rachmaninoff's work is my favorite by far.", weight: 100 },
        ],
        responses_trombone_player: [
            { value: "Probably the works of Arthur Pryor. Simply beautiful.", weight: 100 },
            { value: "J. J. Johnson's work is my favorite by far.", weight: 100 },
        ],
    },
    do_you_play: {
        level_required: 3,
        friendliness_required: 30,
        friendliness_qualities: ["all"],
        topic_relevance: {
            music: {
                required: 20,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "Do you play music?", weight: 100 },
            { value: "Are you a musician?", weight: 100 },
        ],
        responses_default: [
            { value: "No, I just listen.", weight: 100 },
            { value: "Nah, I don't have the chops for that.", weight: 100 },
            { value: "I wish, man.", weight: 90 },
            { value: "Nah, I don't have time to practice.", weight: 50 },
            { value: "I played a bit of piano when I was a kid. I don't remember any of it though.", weight: 5 },
        ],
        responses_boring: [
            { value: "I don't. Never had an interest.", weight: 100 },
        ],
        responses_snob: [
            { value: "I dabble in the theory, but I do not play an instrument.", weight: 50 },
        ],
        responses_multi_instrumentalist: [
            { value: "I play both piano and trombone.", weight: 100 },
            { value: "I play both trombone and piano.", weight: 100 },
        ],
        responses_pianist: [
            { value: "I play piano. Been playing since I was eight.", weight: 100 },
            { value: "I'm a piano player.", weight: 100 },
        ],
        responses_trombone_player: [
            { value: "I play trombone. Been playing since I was twelve.", weight: 100 },
            { value: "I'm a trombone player.", weight: 100 },
        ],
    },
    music_theory: {
        level_required: 3,
        friendliness_required: 40,
        friendliness_qualities: ["pianist", "trombone_player"],
        topic_relevance: {
            music: {
                required: 30,
                added: 30,
            },
        },
        follow_conditions: [],
        options: [
            { value: "What do you believe to be the best application of the Tritone?", weight: 100 },
            { value: "What is your opinion on isomorphic note layouts when compared to more traditional layouts?", weight: 100 },
            { value: "Do you think just intonation still has any relevance in modern music?", weight: 100 },
            { value: "Do you think perfect pitch is a necessary skill as a musician?", weight: 100 },
            { value: "In what situations would an F Maj7add13 chord be applicable?", weight: 100 },
        ],
        responses_default: [
            { value: "What?", weight: 100 },
            { value: "I have no idea.", weight: 100 },
            { value: "I have no idea what you're talking about.", weight: 80 },
            { value: "You're asking the wrong guy.", weight: 10 },
            { value: "What the hell are you talking about?", weight: 10 },
            { value: "What the hell are you on about?", weight: 2 },
        ],
        responses_pianist: [
            { value: "That's a very interesting question. For starters, you have to consider...", weight: 100 },
            { value: "There is certainly a lot of room for debate on that, but in my opinion...", weight: 100 },
            { value: "I actually studied that for a while. It's actually quite simple if you...", weight: 100 },
        ],
        responses_trombonist: [
            { value: "That's a very interesting question. For starters, you have to consider...", weight: 100 },
            { value: "There is certainly a lot of room for debate on that, but in my opinion...", weight: 100 },
            { value: "I actually studied that for a while. It's actually quite simple if you...", weight: 100 },
        ],
    },

    // Medical Conditions
    alcohol_drown_sorrow: {
        level_required: 4,
        friendliness_required: 50,
        friendliness_qualities: ["all"],
        topic_relevance: {
            alcohol: {
                required: 30,
                added: 10,
            },
            medical: {
                required: 0,
                added: 10,
            },
        },
        follow_conditions: [],
        options: [
            { value: "I just found out I have cancer. I need something to numb the pain.", weight: 100 },
            { value: "I could use a drink for sure. I just found out I don't have long to live.", weight: 100 },
            { value: "A drink would sure do me some good. I was just diagnosed with cancer.", weight: 100 },
        ],
        responses_default: [
            { value: "Oh man, I'm really sorry to hear that.", weight: 100 },
            { value: "That sucks, dude.", weight: 100 },
            { value: "Oh wow, that sucks.", weight: 100 },
        ],
        responses_snob: [
            { value: "Best wishes.", weight: 100 },
        ],
    },
}