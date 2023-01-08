export const data = {
    start: {
        responses: [
            { text: "Howdy", weight: 30 },
            { text: "Heya", weight: 30 },
            { text: "Hello", weight: 100 },
            { text: "Who are you?", weight: 10 },
            { text: "Hi", weight: 100 },
            { text: "Yo", weight: 3 },
            { text: "Hola", weight: 3 },
            { text: "Nice to meet you.", weight: 9 },
        ],
        question1: {
            next: "weather",
            options: [
                { text: "Nice weather tonight, huh?", weight: 100 },
                { text: "Sure looks like rain", weight: 10 },
                { text: "It sure is nice out tonight", weight: 100 },
                { text: "What a beautiful starry night", weight: 100 },
                { text: "Gotta love city weather", weight: 10 },
                { text: "Great organ-harvesting weather, isn't it?", weight: 1 },
            ],
        },
    },
    weather: {
        responses: [
            { text: "I suppose so", weight: 100 },
            { text: "Yeah, I guess", weight: 100 },
            { text: "Definitely", weight: 100 },
            { text: "Sure", weight: 10 },
            { text: "I agree", weight: 100 },
            { text: "Yeah, it sure looks like rain", weight: 3 },
        ],
    },
}