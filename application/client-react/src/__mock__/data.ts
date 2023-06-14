export const mockBundles: Array<Honk.Media.AssetBundle> = [
    {
        "_guid": "425876a5-5688-4de2-bebd-473023d4d770",
        "title": "example-title",
        "subTitle": undefined,
        "category": [
            "Lorem Ipsum",
            "Dolor Sit",
            "Amet",
            "Consectetor"
        ],
        "artist": [
            "Scrimbo"
        ],
        "length": 1,
        "type": "VU"
    },
    {
        "_guid": "89a7f986-21e4-4e38-9bf3-4e2c101636d2",
        "title": "Futurama",
        "subTitle": "Season 1",
        "category": [
            "Comedy",
            "Adventure",
            "Animated"
        ],
        "artist": [
            "Futurama"
        ],
        "length": 2,
        "type": "VS"
    },
    {
        "_guid": "36676967-be2a-4291-a05c-f4615980af6c",
        "title": "Futurama",
        "subTitle": "Season 2",
        "category": [
            "Comedy",
            "Adventure",
            "Animated"
        ],
        "artist": [
            "Futurama"
        ],
        "length": 2,
        "type": "VS"
    },
    {
        "_guid": "cbcfac22-7507-4b95-a48b-0fc4dc02a171",
        "title": "Single video",
        "subTitle": undefined,
        "category": [
            "Lorem Ipsum",
            "Dolor Sit",
            "Amet",
            "Consectetor",
            "Action",
            "Drama"
        ],
        "artist": [
            "Randy Doodoo",
            "Scrimbo"
        ],
        "length": 1,
        "type": "VU"
    },
    {
        "_guid": "2fdf1375-5ba6-41ff-8ce9-540e433f57c5",
        "title": "180 Hello world",
        "subTitle": undefined,
        "category": [
            "Lorem Ipsum",
            "Dolor Sit",
            "Amet",
            "Consectetor"
        ],
        "artist": [
            "Acress Name"
        ],
        "length": 1,
        "type": "VU"
    },
    {
        "_guid": "4caa29a6-388c-4f35-a467-93d73b47e74c",
        "title": "Audio singles 1",
        "subTitle": undefined,
        "category": [
            "Dubstep"
        ],
        "artist": [
            "Multiple"
        ],
        "length": 78,
        "type": "AU"
    },
    {
        "_guid": "4d9841ca-0e8e-4490-a9c4-582113f822e8",
        "title": "Anthology",
        "subTitle": undefined,
        "category": [
            "Alternative Rock",
            "Rock",
            "Black Metal"
        ],
        "artist": [
            "Alien Ant Farm"
        ],
        "length": 13,
        "type": "AS"
    },
    {
        "_guid": "993a7cad-cfda-49c9-9f7e-5779b797555a",
        "title": "Our Twilight EP",
        "subTitle": "EP",
        "category": [
            "Metal",
            "Black Metal"
        ],
        "artist": [
            "Barren Earth"
        ],
        "length": 4,
        "type": "AS"
    },
    {
        "_guid": "aab49aca-9d6e-46f8-a7d8-820f185c2a64",
        "title": "Curse of the Red River",
        "subTitle": undefined,
        "category": [
            "Metal",
            "Black Metal"
        ],
        "artist": [
            "Barren Earth"
        ],
        "length": 6,
        "type": "AS"
    },
    {
        "_guid": "7fe9ed00-be08-4bcb-a948-48d4d721586d",
        "title": "example-gallery",
        "subTitle": undefined,
        "category": [
            "Lorem Ipsum",
            "Dolor Sit",
            "Amet",
            "Consectetor"
        ],
        "artist": [
            "Scrimbo"
        ],
        "length": 9,
        "type": "IS"
    },
    {
        "_guid": "d4c8af7b-3822-4046-a1cc-7094167aa5b9",
        "title": "Gallery 2",
        "subTitle": undefined,
        "category": [],
        "artist": [],
        "length": 3,
        "type": "IS"
    }
];
export const mockMeta = mockBundles.reduce((metaAccumulator, { artist, category })=> {
    for (const art of artist) {
        if (!metaAccumulator.artist.includes(art)) metaAccumulator.artist.push(art);
    }
    for (const cat of category) {
        if (!metaAccumulator.category.includes(cat)) metaAccumulator.category.push(cat);
    }
    return metaAccumulator
}, { artist: [], category: [] } as Record<string, string[]>);
export const mockMediaTypes = mockBundles.reduce((typeAccumulator, {type})=> {
    if (!typeAccumulator.includes(type)) {
        typeAccumulator.push(type);
    }
    return typeAccumulator
}, [] as string[]);