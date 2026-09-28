import fs from "fs";

const labels = {
  enekesek: "Énekesek",
  szineszek: "Színészek",
  targyak: "Tárgyak",
  epuletek: "Épületek",
  rajzfilm_figurak: "Rajzfigurák",
  allatok: "Állatok",
  novenyek: "Növények",
  jarmuvek: "Járművek",
  jatekok: "Játékok",
};

/** @type {Record<string, string[]>} */
const data = {
  enekesek: [
    "Freddie Mercury","Michael Jackson","Elvis Presley","Madonna","Beyoncé","Adele","Ed Sheeran","Taylor Swift","Bruno Mars","Rihanna",
    "Lady Gaga","Justin Bieber","The Weeknd","Drake","Eminem","Kanye West","Billie Eilish","Ariana Grande","Shakira","Jennifer Lopez",
    "Céline Dion","Whitney Houston","Mariah Carey","Prince","David Bowie","Elton John","John Lennon","Paul McCartney","Bob Dylan","Bruce Springsteen",
    "Bob Marley","Stevie Wonder","Aretha Franklin","Tina Turner","Cher","Britney Spears","Christina Aguilera","Katy Perry","Miley Cyrus","Harry Styles",
    "Dua Lipa","Olivia Rodrigo","Sabrina Carpenter","Post Malone","Travis Scott","Snoop Dogg","Jay-Z","Kendrick Lamar","Coldplay","U2",
    "Queen","The Beatles","Rolling Stones","Nirvana","Metallica","Linkin Park","Green Day","Red Hot Chili Peppers","Imagine Dragons","Maroon 5",
    "Ákos","Presser Gábor","Zorán","Koncz Zsuzsa","Kovács Kati","Cserháti Zsuzsa","Demjén Ferenc","Edda","Pokolgép","Tankcsapda",
    "Quimby","Republic","Kispál és a Borz","Bagoss","Halott Pénz","Wellhello","Magashegyi Underground","Irie Maffia","Majka","T. Danny",
    "Ajsa Luna","Carson Coma","Blahalouisiana","Margaret Island","Honeybeast","Follow The Flow","Punnany Massif","Azahriah","Desh","Binhon",
    "L.L. Junior","Ganxsta Zolee","Sub Bass Monster","Animal Cannibals","Dopeman","Fluor","Pixa","Rácz Gergő","Rúzsa Magdi","Király Viktor",
  ],
  szineszek: [
    "Brad Pitt","Leonardo DiCaprio","Tom Hanks","Tom Cruise","Johnny Depp","Robert Downey Jr.","Chris Hemsworth","Chris Evans","Scarlett Johansson","Jennifer Lawrence",
    "Meryl Streep","Angelina Jolie","Natalie Portman","Emma Stone","Emma Watson","Anne Hathaway","Margot Robbie","Zendaya","Timothée Chalamet","Ryan Gosling",
    "Ryan Reynolds","Hugh Jackman","Will Smith","Denzel Washington","Morgan Freeman","Al Pacino","Robert De Niro","Jack Nicholson","Anthony Hopkins","Ian McKellen",
    "Keanu Reeves","Matt Damon","Ben Affleck","George Clooney","Matthew McConaughey","Christian Bale","Heath Ledger","Joaquin Phoenix","Jared Leto","Jake Gyllenhaal",
    "Samuel L. Jackson","Dwayne Johnson","Vin Diesel","Jason Statham","Idris Elba","Michael B. Jordan","Chadwick Boseman","Gal Gadot","Zoe Saldana","Chris Pratt",
    "Julia Roberts","Sandra Bullock","Nicole Kidman","Charlize Theron","Cate Blanchett","Kate Winslet","Keira Knightley","Reese Witherspoon","Amy Adams","Viola Davis",
    "Cillian Murphy","Benedict Cumberbatch","Tom Holland","Andrew Garfield","Tobey Maguire","Mark Ruffalo","Jeremy Renner","Paul Rudd","Sebastian Stan","Tom Hiddleston",
    "Ewan McGregor","Orlando Bloom","Viggo Mortensen","Sean Bean","Hugo Weaving","Daniel Radcliffe","Rupert Grint","Emma Thompson","Helena Bonham Carter","Ralph Fiennes",
    "Cserhalmi György","Eperjes Károly","Kern András","Garas Dezső","Törőcsik Mari","Eszenyi Enikő","Pogány Judit","Udvaros Dorottya","Schell Judit","Molnár Piroska",
    "Nagy Ervin","Szabó Győző","Kaszás Attila","Stohl András","László Zsolt","Hevér Gábor","Vecsei H. Miklós","Petrik Andrea","Balsai Móni","Tenki Réka",
  ],
  targyak: [
    "óra","kulcs","szék","asztal","lámpa","telefon","laptop","könyv","ceruza","toll",
    "olló","kalapács","esernyő","hátizsák","szemüveg","kalap","cipő","labda","táska","pénztárca",
    "kulcstartó","fésű","kefe","tükör","párna","takaró","pohár","tányér","kanál","villa",
    "kés","serpenyő","fazék","teáskanna","kávéfőző","mikrohullámú sütő","hűtőszekrény","mosógép","porszívó","vasaló",
    "távirányító","televízió","rádió","hangszóró","fejhallgató","egér","billentyűzet","monitor","nyomtató","pendrive",
    "papír","jegyzettömb","ragasztó","gemkapocs","lyukasztó","tűzőgép","vonalzó","körző","radír","hegyező",
    "lámpaernyő","gyertya","gyufa","öngyújtó","palack","üveg","doboz","kosár","vödör","seprű",
    "lapát","gereblye","kanna","locsolótömlő","csavarhúzó","fogó","fűrész","mérőszalag","szintmérő","létra",
    "szőnyeg","függöny","képkeret","falióra","hőmérő","naptár","törölköző","szappan","fogkefe","fogkrém",
    "sampon","borotva","körömolló","tű","cérna","gomb","cipzáras zacskó","ragasztószalag","kötél","lánc",
  ],
  epuletek: [
    "Eiffel-torony","Szabadság-szobor","Colosseum","Parthenon","Taj Mahal","Kínai Nagy Fal","Big Ben","Buckingham-palota","Louvre","Notre-Dame",
    "Sagrada Família","Pantheon","Kreml","Vörös tér","Szent Bazil-székesegyház","Empire State Building","Chrysler Building","Burj Khalifa","Sydney Opera House","Golden Gate Bridge",
    "Tower Bridge","Brooklyn Bridge","Petronas Twin Towers","CN Tower","Space Needle","Gateway Arch","Lincoln Memorial","Washington Monument","Fehér Ház","Capitolium",
    "Pentagon","Szent Péter-bazilika","Vatikán","Arena di Verona","Alhambra","Neuschwanstein","Brandenburgi kapu","Reichstag","Kölni dóm","Milánói dóm",
    "Firenzei dóm","Pisai ferde torony","Akropolisz","Gízai piramisok","Szfinx","Abu Szimbel","Angkor Vat","Borobudur","Tokiói torony","Tokiói Skytree",
    "Marina Bay Sands","Petra","Machu Picchu","Chichén Itzá","Stonehenge","Edinburgh Castle","Tower of London","Westminster Abbey","Hagia Sophia","Kék Mecset",
    "Parlament","Budai Vár","Halászbástya","Mátyás-templom","Szent István-bazilika","Lánchíd","Széchenyi fürdő","Magyar Állami Operaház","Nemzeti Múzeum","Vajdahunyad vára",
    "Debreceni Nagytemplom","Pécsi székesegyház","Esztergomi bazilika","Egri vár","Sümegi vár","Hollókő","Fertőd","Gödöllői kastély","Tihanyi apátság","Pannonhalma",
    "London Eye","Atomium","Hearst Tower","Guggenheim Bilbao","One World Trade Center","Willis Tower","Sydney Harbour Bridge","Rialto Bridge","Ponte Vecchio","Charles Bridge",
    "Sagrada Familia torony","La Pedrera","Casa Batlló","Versailles","Schönbrunn","Windsor Castle","Mont Saint-Michel","Dubai Mall","Marina Towers","Lotus Temple",
  ],
  rajzfilm_figurak: [
    "Mickey egér","Minnie egér","Donald kacsa","Daisy kacsa","Goofy","Plútó","Chip és Dale","Dagobert bácsi","Bugs Bunny","Daffy Duck",
    "Csőrike","Cicus","Porky Pig","Wile E. Coyote","Útmentő","Tom","Jerry","Scooby-Doo","Shaggy","Frédi",
    "Béni","Gyurka","Macska Jancsi","Popeye","Olivias","Betty Boop","Felix a macska","Garfield","Snoopy","Charlie Brown",
    "Woodstock","Pikachu","Ash Ketchum","Mario","Luigi","Peach hercegnő","Bowser","Yoshi","Sonic","Tails",
    "Knuckles","Crash Bandicoot","Spyro","Kirby","Link","Zelda","Samus","Mega Man","Hello Kitty","My Melody",
    "Micimackó","Tigris","Malacka","Füles","Elza","Anna","Olaf","Simba","Nala","Timon",
    "Pumbaa","Mufasa","Shrek","Szamár","Fiona","Csizmás kandúr","Nemo","Dory","Marlin","Woody",
    "Buzz Lightyear","Jessie","Rex","Krumplifej úr","Sulley","Mike Wazowski","Boo","Pókember","Batman","Superman",
    "Csodanő","Vasember","Amerika Kapitány","Hulk","Thor","Fekete Párduc","Vuk","Mézga Aladár","Mekk Elek","Süsü",
    "Pom Pom","Frakk","Kukori","Kotkoda","A nagy ho-ho-ho-horgász","Vizipók","Maci Laci","Bolondos dallamok","Peppa malac","Bluey",
  ],
  allatok: [
    "kutya","macska","ló","tehén","disznó","tyúk","kacsa","liba","nyúl","egér",
    "patkány","hörcsög","tengerimalac","papagáj","kanári","galamb","veréb","feketerigó","cinege","harkály",
    "sas","sólyom","bagoly","holló","varjú","gólya","daru","hattyú","pelikán","pingvin",
    "oroszlán","tigris","leopárd","jaguár","párduc","gepárd","hiéna","farkas","róka","sakál",
    "medve","jegesmedve","panda","koala","kenguru","vombat","oposszum","mosómedve","borz","vidra",
    "hód","mókus","sün","vakond","denevér","majom","csimpánz","gorilla","orangután","pávián",
    "elefánt","orrszarvú","víziló","zsiráf","zebra","antilop","gazella","bölény","bivaly","jávorszarvas",
    "szarvas","őz","muflon","kecske","juh","teve","láma","alpaka","rénszarvas","pézsmatulok",
    "delfin","bálna","cápa","rája","tonhal","lazac","pisztráng","ponty","harcsa","angolna",
    "teknős","krokodil","aligátor","gyík","kaméleon","kígyó","vipera","béka","varangy","szalamandra",
  ],
  novenyek: [
    "rózsa","tulipán","nárcisz","liliom","orchidea","ibolya","nefelejcs","margaréta","napraforgó","pipacs",
    "százszorszép","krizantém","gerbera","hortenzia","jázmin","levendula","menta","bazsalikom","oregánó","kakukkfű",
    "rozmaring","petrezselyem","kapor","snidling","zsálya","majoránna","koriander","gyömbér","kurkuma","fahéjfa",
    "tölgy","bükk","nyír","nyár","fűz","fenyő","lucfenyő","erdei fenyő","cédrus","ciprus",
    "juhar","gesztenye","diófa","mogyoró","almafa","körtefa","szilvafa","cseresznyefa","meggyfa","barackfa",
    "szőlő","málna","szeder","egres","ribizli","áfonya","eper","dinnye","uborka","paradicsom",
    "paprika","padlizsán","cukkini","tök","sütőtök","káposzta","karfiol","brokkoli","spenót","saláta",
    "retek","répa","cékla","burgonya","hagyma","fokhagyma","póréhagyma","zeller","pasztinák","karalábé",
    "kaktusz","aloé","agávé","bambusz","páfrány","moha","zuzmó","gomba","szarvasgomba","csiperke",
    "lótusz","tavirózsa","nád","sás","kender","len","gyapot","rizs","búza","kukorica",
  ],
  jarmuvek: [
    "autó","kerékpár","motorkerékpár","robogó","roller","elektromos roller","segway","hoverboard","tricikli","quad",
    "teherautó","kamion","busz","trolibusz","villamos","metró","vonat","nagysebességű vonat","mozdony","vagon",
    "hajó","csónak","vitorlás","yacht","katamarán","komp","uszály","tengeralattjáró","repülőgép","helikopter",
    "vadászgép","bombázó","vitorlázórepülő","hőlégballon","léghajó","rakéta","űrrepülőgép","űrállomás","marsjáró","drone",
    "taxi","mentőautó","tűzoltóautó","rendőrautó","páncélozott autó","limuzin","sportautó","Formula–1","rallyautó","gokart",
    "targonca","kotrógép","buldózer","daru","betonkeverő","markoló","úthenger","hókotró","takarítógép","szemetesautó",
    "lakókocsi","lakóautó","utánfutó","pótkocsi","traktor","kombájn","szántógép","permetező","erdei gépszállító","autóbusz",
    "lovaskocsi","szán","szekér","riksa","tuk-tuk","libegő","fogaskerekű","sikló","sífelvonó","kábelvasút",
    "jet ski","vízisí","kajak","kenu","evezős csónak","szörfdeszka","windsurf","kitesurf","hydrofoil","hovercraft",
    "mágneses vonat","hyperloop","repülő autó","eVTOL","robottaxi","önvezető autó","elektromos autó","hibrid autó","hidrogén autó","napenergia autó",
  ],
  jatekok: [
    "Minecraft","Fortnite","Roblox","Among Us","GTA V","GTA San Andreas","The Sims","The Sims 4","Call of Duty","Counter-Strike",
    "Valorant","League of Legends","Dota 2","World of Warcraft","Diablo","Overwatch","Apex Legends","PUBG","Warzone","Rocket League",
    "FIFA","EA FC","NBA 2K","NHL","Madden","Mario Kart","Super Mario Bros","Super Mario Odyssey","Zelda BOTW","Zelda TOTK",
    "Pokémon","Animal Crossing","Splatoon","Metroid","Donkey Kong","Kirby","Sonic the Hedgehog","Pac-Man","Tetris","Snake",
    "Candy Crush","Angry Birds","Clash of Clans","Clash Royale","Brawl Stars","Hay Day","Pokémon GO","Genshin Impact","Honkai Star Rail","Mobile Legends",
    "Resident Evil","Silent Hill","Dead Space","Outlast","Phasmophobia","Left 4 Dead","Doom","Quake","Half-Life","Portal",
    "Skyrim","Fallout","Cyberpunk 2077","Witcher 3","Red Dead Redemption 2","Assassin's Creed","Far Cry","Watch Dogs","Hitman","Metal Gear Solid",
    "God of War","Horizon Zero Dawn","Spider-Man PS4","Uncharted","The Last of Us","Ghost of Tsushima","Bloodborne","Elden Ring","Dark Souls","Sekiro",
    "Street Fighter","Tekken","Mortal Kombat","Super Smash Bros","Sakk","Go","Monopoly","Scrabble","Uno","Activity",
    "Catan","Ticket to Ride","Azul","Dixit","Exploding Kittens","Jenga","Rubik-kocka","Game Boy","PlayStation","Nintendo Switch",
  ],
};

// Normalize to exactly 100 unique items per category
const ids = Object.keys(labels);
for (const id of ids) {
  const seen = new Set();
  const unique = [];
  for (const w of data[id]) {
    const t = String(w).trim();
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    unique.push(t);
  }
  let n = 1;
  while (unique.length < 100) {
    const cand = `${labels[id]} elem ${n}`;
    if (!seen.has(cand.toLowerCase())) {
      unique.push(cand);
      seen.add(cand.toLowerCase());
    }
    n += 1;
  }
  data[id] = unique.slice(0, 100);
}

let out = `/** Pre-defined Hungarian draw prompts — ~100 items per category. */

export type ThemeCategoryId =
${ids.map((id) => `  | "${id}"`).join("\n")};

export type ThemeCategory = ThemeCategoryId;

export const THEME_CATEGORY_IDS: ThemeCategoryId[] = [
${ids.map((id) => `  "${id}",`).join("\n")}
];

export const THEME_CATEGORY_LABELS: Record<ThemeCategoryId, string> = {
${ids.map((id) => `  ${id}: "${labels[id]}",`).join("\n")}
};

/** Short badge labels for the draw-page category picker. */
export const THEME_CATEGORY_BADGE_LABELS: Record<ThemeCategoryId, string> = {
${ids.map((id) => `  ${id}: "${labels[id]}",`).join("\n")}
};

export const THEMES_BY_CATEGORY: Record<ThemeCategoryId, readonly string[]> = {
`;

for (const id of ids) {
  out += `  ${id}: [\n`;
  for (let i = 0; i < data[id].length; i += 5) {
    const chunk = data[id]
      .slice(i, i + 5)
      .map((w) => JSON.stringify(w))
      .join(", ");
    out += `    ${chunk},\n`;
  }
  out += `  ],\n`;
}

out += `};

export type ThemeEntry = {
  category: ThemeCategoryId;
  word: string;
  label: string;
};

export const THEME_DATABASE: ThemeEntry[] = THEME_CATEGORY_IDS.flatMap(
  (category) =>
    THEMES_BY_CATEGORY[category].map((word) => ({
      category,
      word,
      label: THEME_CATEGORY_LABELS[category],
    }))
);

export const THEME_COUNT = THEME_DATABASE.length;

export function listThemeCategories(): ThemeCategoryId[] {
  return [...THEME_CATEGORY_IDS];
}

export function pickRandomTheme(category?: ThemeCategoryId): ThemeEntry {
  const cat =
    category ??
    THEME_CATEGORY_IDS[Math.floor(Math.random() * THEME_CATEGORY_IDS.length)]!;
  const words = THEMES_BY_CATEGORY[cat];
  const word = words[Math.floor(Math.random() * words.length)]!;
  return { category: cat, word, label: THEME_CATEGORY_LABELS[cat] };
}

export function pickRandomFromCategory(category: ThemeCategoryId): ThemeEntry {
  return pickRandomTheme(category);
}
`;

fs.writeFileSync("packages/shared/src/themes.ts", out);
const counts = Object.fromEntries(ids.map((id) => [id, data[id].length]));
console.log("THEME_COUNT", ids.reduce((a, id) => a + data[id].length, 0), counts);
