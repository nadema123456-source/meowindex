"""Shelter sources to scrape — URLs, locations and pagination patterns."""

SOURCES = [
    {
        "name": "Fousky z.s.",
        "website": "https://www.fousky.cz",
        "scrape_urls": [
            "https://www.fousky.cz/kocky/hledaji-domov",
            "https://www.fousky.cz/kocky/hledaji-domov?page=2",
        ],
        "location": "Plzeň",
    },
    {
        "name": "Šanta kočičí",
        "website": "https://www.santakocici.cz",
        "scrape_urls": [
            "https://www.santakocici.cz/kategorie/kocky-k-umisteni/",
        ],
        "location": "Praha",
    },
    {
        "name": "Chlupaví v nouzi",
        "website": "https://www.utulek-kocky-chlupacivnouzi.cz",
        "scrape_urls": [
            "https://www.utulek-kocky-chlupacivnouzi.cz/clanky/nabidkaKocek.html",
        ],
        "location": "Středočeský kraj",
    },
    {
        "name": "Lucky Cats",
        "website": "https://www.luckycats.cz",
        "scrape_urls": [
            "https://www.luckycats.cz/adopce/",
        ],
        "location": "",
    },
    {
        "name": "Catky z.s.",
        "website": "https://www.catky.cz",
        "scrape_urls": [
            "https://www.catky.cz/nase-kocky/adopce-podebrady/",
            "https://www.catky.cz/nase-kocky/adopce-praha/",
        ],
        "location": "Poděbrady / Praha",
    },
    {
        "name": "Pesweb",
        "website": "https://www.pesweb.cz",
        "scrape_urls": [
            "https://www.pesweb.cz/kocky-k-adopci",
        ],
        "location": "Czech Republic",
        "note": (
            "Largest source, ~763 cats. SSR Next.js, pagination via URL params. "
            "Scrape first 5-10 pages."
        ),
    },
]
