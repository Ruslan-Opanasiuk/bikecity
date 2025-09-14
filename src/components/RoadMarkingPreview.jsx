import React from 'react';
import PathConfigs from '../config/PathConfigs';
import RectConfigs from '../config/RectConfigs';
import CircleConfigs from '../config/CircleConfigs';

function RoadMarkingPreview({ markingType, g1Sign, g1Params }) {
  
  // ==========================================================
  // 1. СПІЛЬНІ КОНСТАНТИ ТА РОЗРАХУНКИ
  // ==========================================================
  
  // Отримуємо SVG з конфігурації
  const gBicycle1Svg = PathConfigs.gBicycle1;
  const gASvg = PathConfigs.gA;
  const gBicycle2Svg = PathConfigs.gBicycle2;
  const peopleSvg = PathConfigs.people;

  // Розраховуємо параметри знака G1
  const { numberType = '', routeNumber = '' } = g1Params || {};
  const isNational = numberType === 'national';
  const isDoubleDigit = String(routeNumber).length > 1;
  const mainConfig = isNational ? CircleConfigs.G1 : isDoubleDigit ? RectConfigs.longG1 : RectConfigs.shortG1;
  
  const g1OriginalWidth = mainConfig ? (isNational ? mainConfig.outerRadius * 2 : mainConfig.outerWidth) : 0;
  const g1OriginalHeight = mainConfig ? (isNational ? mainConfig.outerRadius * 2 : mainConfig.outerHeight) : 0;
  const g1Scale = 0.05;

  // Визначаємо колір для тимчасової розмітки
  const pathColor = g1Params?.numberType === 'temporary' ? '#fec100' : '#FFFFFF';

  // --- РОЗРАХУНОК ФІНАЛЬНИХ РОЗМІРІВ УСІХ ЕЛЕМЕНТІВ ---
  const gBicycle1ScaledWidth = gBicycle1Svg.width * gBicycle1Svg.scale;
  const gBicycle1ScaledHeight = gBicycle1Svg.height * gBicycle1Svg.scale;
  
  const gAScaledHeight = gASvg.height * gASvg.scale;
  
  const finalRotatedG1Width = g1OriginalHeight * g1Scale;
  const finalRotatedG1Height = g1OriginalWidth * g1Scale;

  const gBicycle2ScaledWidth = gBicycle2Svg.width * gBicycle2Svg.scale;
  const gBicycle2ScaledHeight = gBicycle2Svg.height * gBicycle2Svg.scale;

  const peopleScaledWidth = peopleSvg.width * peopleSvg.scale;
  const peopleScaledHeight = peopleSvg.height * peopleSvg.scale;

  const g1TranslateY = (100 - finalRotatedG1Height) / 2;


  switch (markingType) {
    
    case 'B.1': {
      // --- Розрахунки, специфічні для розмітки B.1 ---
      const canvasWidth = 400;
      const canvasHeight = 100;

      const gBicycle1TranslateX = 35;
      const gBicycle1TranslateY = (canvasHeight - gBicycle1ScaledHeight) / 2;

      const gATranslateX = 125 + gBicycle1ScaledWidth;
      const gATranslateY = (canvasHeight - gAScaledHeight) / 2;
    

      // === РЕНДЕР ===
      return (
        <svg width={canvasWidth} height={canvasHeight} viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />
          {gBicycle1Svg && <g transform={`translate(${gBicycle1TranslateX}, ${gBicycle1TranslateY}) scale(${gBicycle1Svg.scale})`}><path d={gBicycle1Svg.d} fill={pathColor} fillRule="evenodd"/></g>}
          {gASvg && <g transform={`translate(${gATranslateX}, ${gATranslateY}) scale(${gASvg.scale})`}><path d={gASvg.d} fill={pathColor} fillRule="evenodd"/></g>}
          {g1Sign && <g transform={`translate(${finalRotatedG1Width + 35 + gBicycle1ScaledWidth + 30}, ${g1TranslateY})`}><g transform={`scale(${g1Scale}) rotate(90)`}>{g1Sign}</g></g>}
        </svg>
      );
    }
      
    case 'B.2': {
      // --- Розрахунки, специфічні для розмітки B.2 ---
      const canvasWidth = 250;
      const canvasHeight = 100;

      const gBicycle2TranslateX = -28.5+40+30+22.5;
      const gBicycle2TranslateY = (canvasHeight - gBicycle2ScaledHeight) / 2;

      const peopleTranslateX = 40+30+22.5+53+15;
      const peopleTranslateY = (canvasHeight - peopleScaledHeight) / 2;
      
      return (
        <svg width={canvasWidth} height={canvasHeight} viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />
          {gBicycle2Svg && <g transform={`translate(${gBicycle2TranslateX}, ${gBicycle2TranslateY}) scale(${gBicycle2Svg.scale})`}><path d={gBicycle2Svg.d} fill={pathColor} fillRule="evenodd"/></g>}
          {peopleSvg && <g transform={`translate(${peopleTranslateX}, ${peopleTranslateY}) scale(${peopleSvg.scale})`}><path d={peopleSvg.d} fill={pathColor} fillRule="evenodd"/></g>}
          {g1Sign && <g transform={`translate(${finalRotatedG1Width+40}, ${g1TranslateY})`}><g transform={`scale(${g1Scale}) rotate(90)`}>{g1Sign}</g></g>}
        </svg>
      );
    }

    // --- Заглушки для майбутніх розміток ---
    case 'B.3':
    case 'B.4':
    case 'B.5':
    case 'B.6':
    case 'B.7':
    case 'B.8':
      return (
        <div style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}>
          <p>Візуалізація для розмітки типу "{markingType}" в розробці.</p>
        </div>
      );

    default:
      return (
        <div style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}>
          <p>Оберіть тип розмітки для візуалізації.</p>
        </div>
      );
  }
}

export default RoadMarkingPreview;