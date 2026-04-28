window.UniverseDB = {
        GLOBAL_CONFIG: {
        nomeSite: "Projeto Universo",
        bannerHome: "assets/ui/hero-banner.png",
        corPrimaria: "#E32A73",
        statusCriador: "Expansão do universo em andamento..."
    },
    HOME_CONTENT: {
        heroTitle: "O Universo em Expansão",
        heroSubtitle: "Explore a lore, os personagens e os quadrinhos originais em um formato digital imersivo.",
        heroBannerPath: "assets/ui/hero-banner.png",
        latestReleaseId: "2", // Refers to a Season ID
        galleryPlaceholders: [
            "assets/ui/gallery1.jpg",
            "assets/ui/gallery2.jpg",
            "assets/ui/gallery3.jpg",
            "assets/ui/gallery4.jpg"
        ]
    },
    CREATOR_STATUS: {
        text: "Trabalhando no roteiro da Temporada 2 e finalizando concepts de Kris.",
        lastUpdated: "2024-05-15"
    },
    QUOTES: [
        {
            quoteText: "Às vezes, eu fecho os olhos e o silêncio é a coisa mais barulhenta do mundo.",
            characterName: "Aurora Whitlock",
            characterId: "aurora",
            chapterLink: "01"
        },
        {
            quoteText: "A névoa não esconde os monstros. Ela esconde a porta de saída.",
            characterName: "Aurora Whitlock",
            characterId: "aurora",
            chapterLink: "01"
        }
    ],
    CHARACTERS: [
        {
            id: 'aurora',
            name: 'Aurora Whitlock',
            age: 18,
            appearance: 'Pele leitosa, cabelos escuros e olhos azuis cristalinos. Quase sempre vista com um laço vermelho no cabelo.',
            personality: 'Introvertida, sonhadora e leal, mas assombrada por inseguranças profundas.',
            medos: ['Medo do abandono', 'Ficar sozinha no escuro'],
            relations: [
                {
                    name: 'Kris',
                    description: 'Pilar emocional de Aurora. Ela tem uma dependência profunda de Kris para se sentir segura.'
                }
            ],
            pfp: 'assets/characters/aurora/pfp.png', // Transparent PNG for Quote Pop-out
            portrait: 'assets/characters/aurora/portrait.png' // General portrait
        }
    ],
    SEASONS: [
        {
            id: '1',
            title: 'Temporada 1: O Despertar',
            synopsis: 'A jornada de Aurora começa quando a linha entre o sonho e a realidade se rompe. Conheça o início de MFYIS.',
            coverPath: 'assets/ui/season1-cover.jpg',
            chapterPaths: [
                'assets/mangas/01/01.jpg',
                'assets/mangas/01/02.jpg',
                'assets/mangas/01/03.jpg',
                'assets/mangas/01/04.jpg',
                'assets/mangas/01/05.jpg',
                'assets/mangas/01/06.jpg',
                'assets/mangas/01/07.jpg',
                'assets/mangas/01/08.jpg',
                'assets/mangas/01/09.jpg',
                'assets/mangas/01/10.jpg'
            ]
        },
        {
            id: '2',
            title: 'Temporada 2: A Névoa (Em Breve)',
            synopsis: 'Os mistérios se aprofundam enquanto Kris tenta resgatar Aurora das profundezas de sua própria mente.',
            coverPath: 'assets/ui/season2-cover.jpg',
            chapterPaths: []
        }
    ]
};
