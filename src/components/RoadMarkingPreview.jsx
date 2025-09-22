import React from 'react';
import PathConfigs from '../config/PathConfigs';
import RectConfigs from '../config/RectConfigs';
import CircleConfigs from '../config/CircleConfigs';
import G1 from '../utils/G1';
import DimensionRuler from './svg/DimensionRuler';

function RoadMarkingPreview({ markingType, g1Sign, g1Params }) {
  
  // ==========================================================
  // 1. СПІЛЬНІ КОНСТАНТИ ТА РОЗРАХУНКИ
  // ==========================================================
  
  const g1Scale = 0.05;
  const gBicycle1 = PathConfigs.gBicycle1;
  const gA = PathConfigs.gA;
  const gBicycle2 = PathConfigs.gBicycle2;
  const people = PathConfigs.people;
  const chevron = PathConfigs.chevron;

  const { 
    numberType = '', routeNumber = '', arrowType = 'none',
    isTwoDirections, secondNumberType, secondRouteNumber, secondArrowType,
    showDimensions = false // Отримуємо статус повзунка, за замовчуванням true
  } = g1Params || {};

  const showSecondArrow = isTwoDirections && secondArrowType && secondArrowType !== 'none';
  const secondArrowToRender = showSecondArrow ? PathConfigs[secondArrowType] : null;

  const isNational = numberType === 'national';
  const isDoubleDigit = String(routeNumber).length > 1;
  const mainConfig = isNational ? CircleConfigs.G1 : isDoubleDigit ? RectConfigs.longG1 : RectConfigs.shortG1;
  const pathColor = g1Params?.numberType === 'temporary' ? '#fec100' : '#FFFFFF';

  const g1OriginalWidth = mainConfig ? (isNational ? mainConfig.outerRadius * 2 : mainConfig.outerWidth) : 0;
  const g1OriginalHeight = mainConfig ? (isNational ? mainConfig.outerRadius * 2 : mainConfig.outerHeight) : 0;
  const finalRotatedG1Width = g1OriginalHeight * g1Scale;
  const finalRotatedG1Height = g1OriginalWidth * g1Scale;
  
  const canvasWidth = 400;
  const canvasHeight = 100;

  
  // Логіка для визначення, яку стрілку малювати
  const showArrow = arrowType && arrowType !== 'none';
  const arrowToRender = showArrow ? PathConfigs[arrowType] : null;

  const arrowYOffsets = {
    arrowStraight: 40,
    arrowSide: 28,
    arrowStraightSide: 27.5,
    arrowSideR: 47,
    arrowStraightSideR: 40,
  };
  const lst1 = {
    arrowStraight: 42.5-finalRotatedG1Height/2-10,
    arrowSide: 42.5-finalRotatedG1Height/2-22,
    arrowStraightSide: 42-finalRotatedG1Height/2-22,
  };


  // 1. Визначаємо, чи є другий номер національним та двозначним
  const isSecondNational = secondNumberType === 'national';
  const isSecondDoubleDigit = String(secondRouteNumber || '').length > 1;

  // 2. Обираємо правильну конфігурацію (коло або прямокутник)
  const secondMainConfig = isSecondNational
    ? CircleConfigs.G1
    : isSecondDoubleDigit
    ? RectConfigs.longG1
    : RectConfigs.shortG1;

  // 3. Отримуємо його оригінальну ширину
  const secondG1OriginalWidth = secondMainConfig 
    ? (isSecondNational ? secondMainConfig.outerRadius * 2 : secondMainConfig.outerWidth) 
    : 0;
    
  // 4. Ось фінальний розрахунок висоти повернутого знака
  const finalRotatedSecondG1Height = secondG1OriginalWidth * g1Scale;


  const lst2 = {
    arrowStraight: 56.5+finalRotatedSecondG1Height/2-10,
    arrowSideR: 56.5+finalRotatedSecondG1Height/2-3,
    arrowStraightSideR: 56.5+finalRotatedSecondG1Height/2-9.5,
  };



  switch (markingType) {
    
    case 'Спільна смуга вело та маршрутного транспорту': {

      const xCoords = [0, 100, 130, 130+finalRotatedG1Width, 160+finalRotatedG1Width,  310+finalRotatedG1Width]; 
      const calculationResult = finalRotatedG1Width * 2 / 100;
      const dimensionLabels = ['2.00', '0.60', calculationResult.toFixed(2), '0.60', '3.00'];

      return (
        <svg
          width="100%"
          height={125} // Враховуємо місце для лінійки
          viewBox={`0 0 ${canvasWidth} 125`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* --- Основне полотно розмітки --- */}
          <g>
            <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />
            <g transform="translate(30, 0)">
              
              {/* Велосипед */}
              <g transform={`translate(0, ${(canvasHeight - gBicycle1.height) / 2})`}>
                <path d={gBicycle1.d} fill={pathColor} fillRule="evenodd"/>
              </g>

              {/* Знак G1 */}
              <g transform={`translate(${30 + finalRotatedG1Width + gBicycle1.width}, ${(canvasHeight - finalRotatedG1Height) / 2})`}>
                <g transform={`scale(${g1Scale}) rotate(90)`}>
                  {g1Sign}
                </g>
              </g>

              {/* Стрілка */}
              <g transform={`translate(${60 + finalRotatedG1Width + gBicycle1.width}, ${(canvasHeight - gA.height) / 2})`}>
                <path d={gA.d} fill={pathColor} fillRule="evenodd"/>
              </g>

              {/* --- Лінійка з розмірами --- */}
              {showDimensions && (
                <g transform={`translate(0, ${canvasHeight+2})`}>
                  <DimensionRuler 
                    lines={xCoords} 
                    dimensions={dimensionLabels}
                  />
                </g>
              )}
            </g>
          </g>

        </svg>
      );
    }
      
    case 'Велопішохідна доріжка / зона': {
      const xCoords = [0, finalRotatedG1Width, finalRotatedG1Width+22.5, finalRotatedG1Width+142.5]; 
      const calculationResult = finalRotatedG1Width * 2 / 100;
      const dimensionLabels = [calculationResult.toFixed(2), '0.45', '2.40'];
      return (
        <svg width="100%" height={125} viewBox={`0 0 ${canvasWidth} ${125}`} xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />
          <g transform="translate(113.75, 0)">
            <g transform={`translate(${finalRotatedG1Width}, ${(canvasHeight - finalRotatedG1Height) / 2})`}>
              <g transform={`scale(${g1Scale}) rotate(90)`}>{g1Sign}</g>
            </g>
            <g transform={`translate(${finalRotatedG1Width+22.5}, ${(canvasHeight - gBicycle2.height) / 2})`}>
              <path d={gBicycle2.d} fill={pathColor} fillRule="evenodd"/>
            </g>
            <g transform={`translate(${finalRotatedG1Width+gBicycle2.width+37.5}, ${(canvasHeight - people.height) / 2})`}>
              <path d={people.d} fill={pathColor} fillRule="evenodd"/>
            </g>
            {showDimensions && (
              <g transform={`translate(0, ${canvasHeight+2})`}>
                <DimensionRuler 
                  lines={xCoords} 
                  dimensions={dimensionLabels}
                />
              </g>
            )}
          </g>
        </svg>
      );
    }

    case 'Велосипедний коридор': {
      const xCoords = [0, 172.5, 195, 195+finalRotatedG1Width]; 
      const calculationResult = finalRotatedG1Width * 2 / 100;
      const dimensionLabels = ['3.45', '0.45', calculationResult.toFixed(2)];

      const xCoords2 = [0, 172.5, 195, 195+finalRotatedG1Width, 208+finalRotatedG1Width, 257+finalRotatedG1Width]; 
      const dimensionLabels2 = ['3.45', '0.45', calculationResult.toFixed(2), '0.20', '1.10'];
      return showArrow ? (
        // Варіант зі стрілкою (старий B.4)
        <svg width="100%" height={125} viewBox={`0 0 ${canvasWidth} ${125}`} xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />
          <g transform="translate(55, 0)">
            <g transform={`translate(0, ${(canvasHeight - chevron.height) / 2})`}><path d={chevron.d} fill={pathColor} fillRule="evenodd"/></g>
            <g transform={`translate(${9 + chevron.width}, ${(canvasHeight - gBicycle1.height) / 2})`}><path d={gBicycle1.d} fill={pathColor} fillRule="evenodd"/></g>
            <g transform={`translate(${31.5 + chevron.width + gBicycle1.width + finalRotatedG1Width}, ${(canvasHeight - finalRotatedG1Height) / 2})`}><g transform={`scale(${g1Scale}) rotate(90)`}>{g1Sign}</g></g>
            {arrowToRender && (
              <g transform={`translate(${41.5 + chevron.width + gBicycle1.width + finalRotatedG1Width}, ${arrowYOffsets[arrowType] || 40})`}>
                <path d={arrowToRender.d} fill={pathColor} fillRule="evenodd"/>
              </g>
            )}
            {showDimensions && (
              <g transform={`translate(0, ${canvasHeight+2})`}>
                <DimensionRuler 
                  lines={xCoords2} 
                  dimensions={dimensionLabels2}
                />
              </g>
            )}
          </g>
        </svg>
      ) : (
        // Варіант без стрілки (старий B.3)
        <svg width="100%" height={125} viewBox={`0 0 ${canvasWidth} ${125}`} xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />
          <g transform="translate(72.5, 0)">
            <g transform={`translate(0, ${(canvasHeight - chevron.height) / 2})`}><path d={chevron.d} fill={pathColor} fillRule="evenodd"/></g>
            <g transform={`translate(${9 + chevron.width}, ${(canvasHeight - gBicycle1.height) / 2})`}><path d={gBicycle1.d} fill={pathColor} fillRule="evenodd"/></g>
            <g transform={`translate(${31.5 + chevron.width + gBicycle1.width + finalRotatedG1Width}, ${(canvasHeight - finalRotatedG1Height) / 2})`}><g transform={`scale(${g1Scale}) rotate(90)`}>{g1Sign}</g></g>
            {showDimensions && (
              <g transform={`translate(0, ${canvasHeight+2})`}>
                <DimensionRuler 
                  lines={xCoords} 
                  dimensions={dimensionLabels}
                />
              </g>
            )}
          </g>
        </svg>
      );
    }

    case 'Велосипедна смуга': {
      const xCoords = [0, 100, 122.5, 122.5+finalRotatedG1Width]; 
      const calculationResult = finalRotatedG1Width * 2 / 100;
      const dimensionLabels = ['2.00', '0.45', calculationResult.toFixed(2)];

      const xCoords2 = [0, 100, 122.5, 122.5+finalRotatedG1Width, 135.5+finalRotatedG1Width, 184.5+finalRotatedG1Width]; 
      const dimensionLabels2 = ['2.00', '0.45', calculationResult.toFixed(2), '0.20', '1.30'];
      return showArrow ? (
        // Варіант зі стрілкою (старий B.6)
        <svg width="100%" height={125} viewBox={`0 0 ${canvasWidth} ${125}`} xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />
          <g transform="translate(91.25, 0)">
            <g transform={`translate(0, ${(canvasHeight - gBicycle1.height) / 2})`}><path d={gBicycle1.d} fill={pathColor} fillRule="evenodd"/></g>
            <g transform={`translate(${22.5 + gBicycle1.width + finalRotatedG1Width}, ${(canvasHeight - finalRotatedG1Height) / 2})`}><g transform={`scale(${g1Scale}) rotate(90)`}>{g1Sign}</g></g>
            {arrowToRender && (
              <g transform={`translate(${31.5 + gBicycle1.width + finalRotatedG1Width}, ${arrowYOffsets[arrowType]})`}>
                <path d={arrowToRender.d} fill={pathColor} fillRule="evenodd"/>
              </g>
            )}
            {showDimensions && (
              <g transform={`translate(0, ${canvasHeight+2})`}>
                <DimensionRuler 
                  lines={xCoords2} 
                  dimensions={dimensionLabels2}
                />
              </g>
            )}
          </g>
        </svg>
      ) : (
        // Варіант без стрілки (старий B.5)
        <svg width="100%" height={125} viewBox={`0 0 ${canvasWidth} ${125}`} xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />
          <g transform="translate(123.75, 0)">
            <g transform={`translate(0, ${(canvasHeight - gBicycle1.height) / 2})`}><path d={gBicycle1.d} fill={pathColor} fillRule="evenodd"/></g>
            <g transform={`translate(${22.5 + gBicycle1.width + finalRotatedG1Width}, ${(canvasHeight - finalRotatedG1Height) / 2})`}><g transform={`scale(${g1Scale}) rotate(90)`}>{g1Sign}</g></g>
            {showDimensions && (
              <g transform={`translate(0, ${canvasHeight+2})`}>
                <DimensionRuler 
                  lines={xCoords} 
                  dimensions={dimensionLabels}
                />
              </g>
            )}
          </g>
        </svg>
      );    
    }

case 'Велосипедна доріжка': {
      // Створюємо другий знак G1, якщо потрібно
      const xCoords = [0, 50, 72.5, 72.5+finalRotatedG1Width]; 
      const calculationResult = finalRotatedG1Width * 2 / 100;
      const dimensionLabels = ['2.00', '0.45', calculationResult.toFixed(2)];

      const xCoords2 = [0, 50, 72.5, 72.5+finalRotatedG1Width, 85.5+finalRotatedG1Width, 134.5+finalRotatedG1Width]; 
      const dimensionLabels2 = ['2.00', '0.45', calculationResult.toFixed(2), '0.20', '1.10'];

      const secondG1Sign = isTwoDirections 
        ? <G1 params={{ numberType: secondNumberType, routeNumber: secondRouteNumber }} /> 
        : null;

      // --- ОСНОВНА ЛОГІКА РЕНДЕРУ ДЛЯ B.7 ---
      if (isTwoDirections) {
        // --- ВИПАДОК 3: ДВА НАПРЯМКИ ---
        return (
          <svg width="100%" height={125} viewBox={`0 0 ${canvasWidth} ${125}`} xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />
            <g transform="translate(126.25, 0)">
              <g transform={`translate(0, ${(canvasHeight - gBicycle2.height) / 2})`}><path d={gBicycle2.d} fill={pathColor} fillRule="evenodd"/></g>
              {/* Перший напрямок */}
              <g transform={`translate(${22.5 + gBicycle2.width + finalRotatedG1Width}, ${42.5-finalRotatedG1Height+3})`}><g transform={`scale(${g1Scale}) rotate(90)`}>{g1Sign}</g></g>
              {showArrow && arrowToRender && <g transform={`translate(${31.5 + gBicycle2.width + finalRotatedG1Width}, ${lst1[arrowType]+3})`}><path d={arrowToRender.d} fill={pathColor} /></g>}

              {/* Другий напрямок */}
              <g transform={`translate(${22.5 + gBicycle2.width + finalRotatedG1Width}, ${56.5-1})`}><g transform={`scale(${g1Scale}) rotate(90)`}>{secondG1Sign}</g></g>
              {showSecondArrow && secondArrowToRender && <g transform={`translate(${31.5 + gBicycle2.width + finalRotatedG1Width}, ${lst2[secondArrowType]-1})`}><path d={secondArrowToRender.d} fill={pathColor} /></g>}
              
              {showDimensions && (
                <g transform={`translate(0, ${canvasHeight+2})`}>
                  <DimensionRuler 
                    lines={xCoords2} 
                    dimensions={dimensionLabels2}
                  />
                </g>
              )}
            </g>
            {/* <rect x="0" y={55+finalRotatedSecondG1Height/2} width={400} height={1} fill="red" /> */}
          </svg>
        );
      } else if (showArrow) {
        // --- ВИПАДОК 2: ОДИН НАПРЯМОК ЗІ СТРІЛКОЮ ---
        return (
          <svg width="100%" height={125} viewBox={`0 0 ${canvasWidth} ${125}`} xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />
            <g transform="translate(126.25, 0)">
              <g transform={`translate(0, ${(canvasHeight - gBicycle2.height) / 2})`}><path d={gBicycle2.d} fill={pathColor} fillRule="evenodd"/></g>
              <g transform={`translate(${22.5 + gBicycle2.width + finalRotatedG1Width}, ${(canvasHeight - finalRotatedG1Height) / 2})`}><g transform={`scale(${g1Scale}) rotate(90)`}>{g1Sign}</g></g>
              {arrowToRender && <g transform={`translate(${31.5 + gBicycle2.width + finalRotatedG1Width}, ${arrowYOffsets[arrowType]})`}><path d={arrowToRender.d} fill={pathColor} fillRule="evenodd"/></g>}
              {showDimensions && (
                <g transform={`translate(0, ${canvasHeight+2})`}>
                  <DimensionRuler 
                    lines={xCoords2} 
                    dimensions={dimensionLabels2}
                  />
                </g>
              )}
            </g>
          </svg>
        );
      } else {
        // --- ВИПАДОК 1: ОДИН НАПРЯМОК БЕЗ СТРІЛКИ ---
        return (
          <svg width="100%" height={125} viewBox={`0 0 ${canvasWidth} ${125}`} xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />
            <g transform="translate(148.75, 0)">
              <g transform={`translate(0, ${(canvasHeight - gBicycle2.height) / 2})`}><path d={gBicycle2.d} fill={pathColor} fillRule="evenodd"/></g>
              <g transform={`translate(${22.5 + gBicycle2.width + finalRotatedG1Width}, ${(canvasHeight - finalRotatedG1Height) / 2})`}><g transform={`scale(${g1Scale}) rotate(90)`}>{g1Sign}</g></g>
              {showDimensions && (
                <g transform={`translate(0, ${canvasHeight+2})`}>
                  <DimensionRuler 
                    lines={xCoords} 
                    dimensions={dimensionLabels}
                  />
                </g>
              )}
            </g>
          </svg>
        );
      }
    }


    default:
      return (
        <div style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}>
          <p>Оберіть тип розмітки для візуалізації.</p>
        </div>
      );
  }
}

export default RoadMarkingPreview;