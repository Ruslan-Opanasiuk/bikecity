const locationTerms = {
  "cityCentre": {
    "Центр громади": { "ua": "Центр громади", "en": "Hromada centre", "shortEn": "" },
    "Центр міста": { "ua": "Центр міста", "en": "City centre", "shortEn": "" },
    "Центр села": { "ua": "Центр села", "en": "Village centre", "shortEn": "" },
    "Центр селища": { "ua": "Центр селища", "en": "Hamlet centre", "shortEn": "" }
  },
  "interchange": {
    "Естакада": { "ua": "ест.", "en": "Flyover", "shortEn": "" },
    "Майдан": { "ua": "майд.", "en": "Square", "shortEn": "sq." },
    "Площа": { "ua": "пл.", "en": "Square", "shortEn": "sq." },
    "Шляхопровід": { "ua": "ш-д.", "en": "Overpass", "shortEn": "" }
  },
  "bridge": {
    "Акведук": { "ua": "акв.", "en": "Aqueduct", "shortEn": "" },
    "Віадук": { "ua": "віадук", "en": "Viaduct", "shortEn": "" },
    "Дамба": { "ua": "дамб.", "en": "Dam", "shortEn": "" },
    "Міст": { "ua": "м.", "en": "Bridge", "shortEn": "br." },
    "Мостовий перехід": { "ua": "м-п.", "en": "Overpass", "shortEn": "" },
    "Підземний перехід": { "ua": "перехід", "en": "Underpass", "shortEn": "" },
    "Тунель": { "ua": "тнл.", "en": "Tunnel", "shortEn": "" }
  },
  "port": {
    "Водна станція": { "ua": "вод.ст.", "en": "Boat station", "shortEn": "boat stat." },
    "Морський порт": { "ua": "мор.порт", "en": "Port", "shortEn": "" },
    "Причал": { "ua": "прич.", "en": "Berth", "shortEn": "" },
    "Пристань": { "ua": "прист.", "en": "Pier", "shortEn": "" },
    "Поромна переправа": { "ua": "пором.", "en": "Ferry", "shortEn": "" },
    "Річковий вокзал/станція": { "ua": "р.ст.", "en": "River station", "shortEn": "riv. stat." },
    "Річковий порт": { "ua": "річ.порт", "en": "River port", "shortEn": "" },
    "Човникова станція": { "ua": "човн.ст.", "en": "Boat station", "shortEn": "boat stat." }
  },
  "airport": {
    "Аеродром (Летовище)": { "ua": "аерод.", "en": "Airfield", "shortEn": "" },
    "Аеропорт": { "ua": "аерп.", "en": "Airport", "shortEn": "" }
  },
  "settlement": {
    "Місто": { "ua": "", "en": "City", "shortEn": "" },
    "Село": { "ua": "", "en": "Village", "shortEn": "vlg." },
    "Селище": { "ua": "", "en": "Hamlet", "shortEn": "ham." },
    "Хутір": { "ua": "хут.", "en": "Khutor", "shortEn": "" }
  },
  "railStation": {
    "Залізнична станція": { "ua": "зал.ст.", "en": "Train station", "shortEn": "T.S." },
    "Залізничний вокзал": { "ua": "зал.вкз.", "en": "Railway station", "shortEn": "rail.stat." },
    "Станція метро": { "ua": "ст.м.", "en": "Metro station", "shortEn": "metro stat." }
  },
  "busStation": {
    "Автостанція": { "ua": "авт.ст.", "en": "Bus station", "shortEn": "bus stat." },
    "Автовокзал": { "ua": "авт.вкз.", "en": "Bus station", "shortEn": "bus stat." }
  },
  "water": {
    "Бухта": { "ua": "бух.", "en": "Bay", "shortEn": "" },
    "Гавань": { "ua": "гав.", "en": "Harbor", "shortEn": "" },
    "Гребля": { "ua": "гр.", "en": "Levee", "shortEn": "" },
    "Джерело": { "ua": "джер.", "en": "Spring water", "shortEn": "spr. wtr." },
    "Залив": { "ua": "зал.", "en": "Bay", "shortEn": "" },
    "Затока": { "ua": "зат.", "en": "Gulf", "shortEn": "" },
    "Канал": { "ua": "кан.", "en": "Canal", "shortEn": "" },
    "Лиман": { "ua": "лим.", "en": "Firth", "shortEn": "" },
    "Озеро": { "ua": "оз.", "en": "Lake", "shortEn": "" },
    "Пляж": { "ua": "пляж", "en": "Beach", "shortEn": "" },
    "Протока": { "ua": "прот.", "en": "Strait", "shortEn": "" },
    "Річка": { "ua": "р.", "en": "River", "shortEn": "riv." },
    "Ставок": { "ua": "став.", "en": "Pond", "shortEn": "" },
    "Струмок": { "ua": "струм.", "en": "Creek", "shortEn": "" },
    "Водосховище": { "ua": "в/сх.", "en": "Reservoir", "shortEn": "" }
  },
  "bicycleRoute": {
    "Національний": { "ua": "Веломаршрут", "en": "Cycle road", "shortEn": "" },
    "Регіональний": { "ua": "Веломаршрут", "en": "Cycle road", "shortEn": "" },
    "Локальний": { "ua": "Веломаршрут", "en": "Cycle road", "shortEn": "" }
  },
  "streetNetwork": {
    "Автомагістраль (автосрада)": { "ua": "АМ", "en": "Highroad", "shortEn": "hrd." },
    "Алея": { "ua": "ал.", "en": "Alley", "shortEn": "" },
    "Бульвар": { "ua": "бульв.", "en": "Boulevard", "shortEn": "blvd." },
    "Вулиця": { "ua": "вул.", "en": "Street", "shortEn": "str." },
    "Дорога": { "ua": "дорога", "en": "Road", "shortEn": "" },
    "Лінія": { "ua": "лінія", "en": "Line", "shortEn": "ln." },
    "Майдан": { "ua": "майд.", "en": "Square", "shortEn": "sq." },
    "Набережна": { "ua": "наб.", "en": "Embankment", "shortEn": "emb." },
    "Пасаж": { "ua": "пасаж", "en": "Passage", "shortEn": "pass." },
    "Площа": { "ua": "пл.", "en": "Square", "shortEn": "sq." },
    "Провулок": { "ua": "пров.", "en": "Lane", "shortEn": "ln." },
    "Проїзд": { "ua": "пр.", "en": "Passage", "shortEn": "pass." },
    "Проспект": { "ua": "просп.", "en": "Avenue", "shortEn": "ave." },
    "Тупик": { "ua": "туп.", "en": "Dead end", "shortEn": "" },
    "Узвіз": { "ua": "уз.", "en": "Descent", "shortEn": "desc." },
    "Шлях": { "ua": "шлях", "en": "Road", "shortEn": "rd." },
    "Шосе": { "ua": "ш.", "en": "Highway", "shortEn": "hwy." }
  },
  "district": {
    "Житловий квартал (комплекс)": { "ua": "ЖК", "en": "Residential complex", "shortEn": "" },
    "Житловий масив": { "ua": "ж/м", "en": "Housing estate", "shortEn": "" },
    "Житловий район": { "ua": "р-н", "en": "District", "shortEn": "dist." },
    "Сади (садові ділянки)": { "ua": "сад.діл.", "en": "Allotment", "shortEn": "" }
  },
  "other": {}
};

export default locationTerms;