const locationTerms = {
  cityCentre: {
    "Центр громади": { ua: "Центр громади", en: "hromada centre", shortEn: "" },
    "Центр міста": { ua: "Центр міста", en: "city centre", shortEn: "" },
    "Центр села": { ua: "Центр села", en: "village centre", shortEn: "" },
    "Центр селища": { ua: "Центр селища", en: "hamlet centre", shortEn: "" }
  },
  interchange: {
    "Естакада": { ua: "ест.", en: "flyover", shortEn: "" },
    "Майдан": { ua: "майд.", en: "square", shortEn: "sq." },
    "Площа": { ua: "пл.", en: "square", shortEn: "sq." },
    "Шляхопровід": { ua: "ш-д.", en: "overpass", shortEn: "" }
  },
  bridge: {
    "Акведук": { ua: "акв.", en: "aqueduct", shortEn: "" },
    "Віадук": { ua: "віадук", en: "viaduct", shortEn: "" },
    "Дамба": { ua: "дамб.", en: "dam", shortEn: "" },
    "Міст": { ua: "м.", en: "bridge", shortEn: "br." },
    "Мостовий перехід": { ua: "м-п.", en: "overpass", shortEn: "" },
    "Підземний перехід": { ua: "перехід", en: "underpass", shortEn: "" },
    "Тунель": { ua: "тнл.", en: "tunnel", shortEn: "" }
  },
  port: {
    "Водна станція": { ua: "вод.ст.", en: "boat station", shortEn: "boat stat." },
    "Морський порт": { ua: "мор.порт", en: "port", shortEn: "" },
    "Причал": { ua: "прич.", en: "berth", shortEn: "" },
    "Пристань": { ua: "прист.", en: "pier", shortEn: "" },
    "Поромна переправа": { ua: "пором.", en: "ferry", shortEn: "" },
    "Річковий вокзал/станція": { ua: "р.ст.", en: "river station", shortEn: "riv. stat." },
    "Річковий порт": { ua: "річ.порт", en: "river port", shortEn: "" },
    "Човникова станція": { ua: "човн.ст.", en: "boat station", shortEn: "boat stat." }
  },
  airport: {
    "Аеродром (Летовище)": { ua: "аерод.", en: "airfield", shortEn: "" },
    "Аеропорт": { ua: "аерп.", en: "airport", shortEn: "" }
  },
  settlement: {
    "Місто": { ua: "", en: "city", shortEn: "" },
    "Село": { ua: "", en: "village", shortEn: "vlg." },
    "Селище": { ua: "", en: "hamlet", shortEn: "ham." },
    "Хутір": { ua: "хут.", en: "khutor", shortEn: "" }
  },
  railStation: {
    "Залізнична станція": { ua: "зал.ст.", en: "train station", shortEn: "t.s." },
    "Залізничний вокзал": { ua: "зал.вкз.", en: "railway station", shortEn: "rail.stat." },
    "Станція метро": { ua: "ст.м.", en: "metro station", shortEn: "metro stat." }
  },
  busStation: {
    "Автостанція": { ua: "авт.ст.", en: "bus station", shortEn: "bus stat." },
    "Автовокзал": { ua: "авт.вкз.", en: "bus station", shortEn: "bus stat." }
  },
  water: {
    "Бухта": { ua: "бух.", en: "bay", shortEn: "" },
    "Гавань": { ua: "гав.", en: "harbor", shortEn: "" },
    "Гребля": { ua: "гр.", en: "levee", shortEn: "" },
    "Джерело": { ua: "джер.", en: "spring water", shortEn: "spr. wtr." },
    "Залив": { ua: "зал.", en: "bay", shortEn: "" },
    "Затока": { ua: "зат.", en: "gulf", shortEn: "" },
    "Канал": { ua: "кан.", en: "canal", shortEn: "" },
    "Лиман": { ua: "лим.", en: "firth", shortEn: "" },
    "Озеро": { ua: "оз.", en: "lake", shortEn: "" },
    "Пляж": { ua: "пляж", en: "beach", shortEn: "" },
    "Протока": { ua: "прот.", en: "strait", shortEn: "" },
    "Річка": { ua: "р.", en: "river", shortEn: "riv." },
    "Ставок": { ua: "став.", en: "pond", shortEn: "" },
    "Струмок": { ua: "струм.", en: "creek", shortEn: "" },
    "Водосховище": { ua: "в/сх.", en: "reservoir", shortEn: "" }
  },
  bicycleRoute: {
    "Національний": { ua: "Веломаршрут", en: "cycle road", shortEn: "" },
    "Регіональний": { ua: "Веломаршрут", en: "cycle road", shortEn: "" },
    "Локальний": { ua: "Веломаршрут", en: "cycle road", shortEn: "" }
  },
  streetNetwork: {
    "Автомагістраль (автосрада)": { ua: "АМ", en: "highroad", shortEn: "hrd." },
    "Алея": { ua: "ал.", en: "alley", shortEn: "" },
    "Бульвар": { ua: "бульв.", en: "boulevard", shortEn: "blvd." },
    "Вулиця": { ua: "вул.", en: "street", shortEn: "str." },
    "Дорога": { ua: "дорога", en: "road", shortEn: "" },
    "Лінія": { ua: "лінія", en: "line", shortEn: "ln." },
    "Майдан": { ua: "майд.", en: "square", shortEn: "sq." },
    "Набережна": { ua: "наб.", en: "embankment", shortEn: "emb." },
    "Пасаж": { ua: "пасаж", en: "passage", shortEn: "pass." },
    "Площа": { ua: "пл.", en: "square", shortEn: "sq." },
    "Провулок": { ua: "пров.", en: "lane", shortEn: "ln." },
    "Проїзд": { ua: "пр.", en: "passage", shortEn: "pass." },
    "Проспект": { ua: "просп.", en: "avenue", shortEn: "ave." },
    "Тупик": { ua: "туп.", en: "dead end", shortEn: "" },
    "Узвіз": { ua: "уз.", en: "descent", shortEn: "desc." },
    "Шлях": { ua: "шлях", en: "road", shortEn: "rd." },
    "Шосе": { ua: "ш.", en: "highway", shortEn: "hwy." }
  },
  district: {
    "Житловий квартал (комплекс)": { ua: "ЖК", en: "residential complex", shortEn: "" },
    "Житловий масив": { ua: "ж/м", en: "housing estate", shortEn: "" },
    "Житловий район": { ua: "р-н", en: "district", shortEn: "dist." },
    "Сади (садові ділянки)": { ua: "сад.діл.", en: "allotment", shortEn: "" }
  },
  other: {}
};

export default locationTerms;
