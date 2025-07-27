// src/config/defaultParams.js

export const defaultB1B3Params = {
  tableType: "permanent",
  numberType: "national",
  routeNumber: "",
  direction: "straight",
};

export const defaultB4Params = {
  tableType: "permanent",
  numberType: "none",
  routeNumber: "",
  direction: "straight",
  forceUniformTextSize: false,
  objectCount: 1,
  b4Items: [
    {
      mainText: "",
      subText: "",
      direction: "straight",
      routeNumber: "",
      icon: "",
      isTemporaryRoute: false,
      isUrbanCenter: false,
      forcedFontSize1: null,
      alignedTextX: null,
    },
  ],
};

export const defaultB7Params = {
  tableType: "permanent",
  numberType: "none",
  routeNumber: "",
  direction: "straight",
  forceUniformTextSize: false,
  objectCount: 4,
  b4Items: Array.from({ length: 4 }, () => ({
    mainText: "",
    subText: "",
    direction: "straight",
    routeNumber: "",
    icon: "",
    isTemporaryRoute: false,
    isUrbanCenter: false,
    forcedFontSize1: null,
    alignedTextX: null,
    distance: "",
    warningSignType: null
  })),
};
