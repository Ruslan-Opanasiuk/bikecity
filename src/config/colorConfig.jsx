// Типи для зручності
export const Statuses = ['permanent', 'seasonal', 'temporary'];
export const RouteTypes = ['national', 'regional', 'local'];

// Кольори за статусом маршруту
export const statusColors = {
  permanent: {
    frame: '#FFFFFF',        // біла рамка навколо всього знака
    background: '#005187',   // синій фон знака
    symbol: '#FFFFFF',       // білі стрілки, велосипед
  },
  seasonal: {
    frame: '#FFFFFF',        // жовта рамка (змінюється у винятку)
    background: '#005187',   // синій фон
    symbol: '#F5C30D',       // жовті стрілки, велосипед
  },
  temporary: {
    frame: '#000000',        // чорна рамка
    background: '#F5C30D',   // жовтий фон
    symbol: '#000000',       // чорні стрілки, велосипед
  },
};

// Кольори за типом маршруту
export const routeTypeColors = {
  national: {
    background: '#F5C30D',   // жовтий фон номера маршруту
    text: '#000000',         // чорний текст
  },
  regional: {
    background: '#CC0000',   // червоний фон
    text: '#FFFFFF',         // білий текст
  },
  local: {
    background: '#005187',   // синій фон
    text: '#FFFFFF',         // білий текст
  },
  eurovelo: {
    background: "#F5C30D",   // фона нема
    text: '#FFFFFF',         // білий текст
  }
};

// Функція для отримання всіх потрібних кольорів для SVG або стилів
function getColors(status, routeType, isTerminus = false, isTemporary = false) {
  const effectiveStatus = isTemporary ? 'temporary' : status;
  const statusCfg = statusColors[effectiveStatus];

  const typeCfg = routeTypeColors[routeType] || { background: '#C4C4C4', text: '#000000' };

  const isSeasonal = status === 'seasonal';

  const routeBoxBg = isTerminus ? '#C4C4C4' : typeCfg.background;
  const routeBoxText = isTerminus
    ? statusCfg.symbol// текст = колір рамки типу маршруту
    : (isSeasonal ? '#F5C30D' : typeCfg.text);


  return {
    frameColor: statusCfg.frame,
    backgroundColor: statusCfg.background,
    symbolColor: statusCfg.symbol,
    routeBox: {
      background: routeBoxBg,
      frame: isSeasonal ? '#F5C30D' : statusCfg.frame,
      text: routeBoxText,
    },
  };
}

export default getColors;