import React from 'react';
import PathConfigs from '../config/PathConfigs';
import RectConfigs from '../config/RectConfigs';
import CircleConfigs from '../config/CircleConfigs';
import { g } from '../../dist/assets/index-b4c8b000';

function RoadMarkingPreview({ markingType, g1Sign, g1Params }) {
  
  // ==========================================================
  // 1. СПІЛЬНІ КОНСТАНТИ ТА РОЗРАХУНКИ
  // ==========================================================
  
  // Отримуємо SVG з конфігурації
  const g1Scale = 0.05;
  const gBicycle1 = PathConfigs.gBicycle1;
  const gA = PathConfigs.gA;
  const gBicycle2 = PathConfigs.gBicycle2;
  const people = PathConfigs.people;
  const chevron = PathConfigs.chevron;
  const arrowStraight = PathConfigs.arrowStraight;

  // Розраховуємо параметри знака G1
  const { numberType = '', routeNumber = '' } = g1Params || {};
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

  switch (markingType) {
    
    case 'B.1': {
      return (
        <svg
          width={canvasWidth}
          height={canvasHeight}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />

          <g transform={`translate(30, 0)`}>

            <g transform={`translate(${0}, ${(canvasHeight - gBicycle1.height) / 2})`}>
              <path d={gBicycle1.d} fill={pathColor} fillRule="evenodd"/>
            </g>

            <g transform={`translate(${30 + finalRotatedG1Width + gBicycle1.width}, ${(canvasHeight - finalRotatedG1Height) / 2})`}>
              <g transform={`scale(${g1Scale}) rotate(90)`}>
                {g1Sign}
              </g>
            </g>

            <g transform={`translate(${60 + finalRotatedG1Width + gBicycle1.width}, ${(canvasHeight - gA.height) / 2})`}>
              <path d={gA.d} fill={pathColor} fillRule="evenodd"/>
            </g>

          </g>

        </svg>
      );
    }
      
    case 'B.2': {
      return (
        <svg
          width={canvasWidth}
          height={canvasHeight}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />

          <g transform={`translate(113.75, 0)`}>

            <g transform={`translate(${finalRotatedG1Width}, ${(canvasHeight - finalRotatedG1Height) / 2})`}>
              <g transform={`scale(${g1Scale}) rotate(90)`}>
                {g1Sign}
              </g>
            </g>

            <g transform={`translate(${finalRotatedG1Width+22.5}, ${(canvasHeight - gBicycle2.height) / 2})`}>
              <path d={gBicycle2.d} fill={pathColor} fillRule="evenodd"/>
            </g>

            <g transform={`translate(${finalRotatedG1Width+gBicycle2.width+37.5}, ${(canvasHeight - people.height) / 2})`}>
              <path d={people.d} fill={pathColor} fillRule="evenodd"/>
            </g>

          </g>

        </svg>
      );
    }

    case 'B.3': {

      return (
        <svg
          width={canvasWidth}
          height={canvasHeight}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />

          <g transform={`translate(72.5, 0)`}>

            <g transform={`translate(${0}, ${(canvasHeight - chevron.height) / 2})`}>
              <path d={chevron.d} fill={pathColor} fillRule="evenodd"/>
            </g>

            <g transform={`translate(${9 + chevron.width}, ${(canvasHeight - gBicycle1.height) / 2})`}>
              <path d={gBicycle1.d} fill={pathColor} fillRule="evenodd"/>
            </g>

            <g transform={`translate(${31.5 + chevron.width + gBicycle1.width + finalRotatedG1Width}, ${(canvasHeight - finalRotatedG1Height) / 2})`}>
              <g transform={`scale(${g1Scale}) rotate(90)`}>
                {g1Sign}
              </g>
            </g>

          </g>

        </svg>
      );

    }


    case 'B.4': {

      return (
        <svg
          width={canvasWidth}
          height={canvasHeight}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />

          <g transform={`translate(55, 0)`}>

            <g transform={`translate(${0}, ${(canvasHeight - chevron.height) / 2})`}>
              <path d={chevron.d} fill={pathColor} fillRule="evenodd"/>
            </g>

            <g transform={`translate(${9 + chevron.width}, ${(canvasHeight - gBicycle1.height) / 2})`}>
              <path d={gBicycle1.d} fill={pathColor} fillRule="evenodd"/>
            </g>

            <g transform={`translate(${31.5 + chevron.width + gBicycle1.width + finalRotatedG1Width}, ${(canvasHeight - finalRotatedG1Height) / 2})`}>
              <g transform={`scale(${g1Scale}) rotate(90)`}>
                {g1Sign}
              </g>
            </g>

            <g transform={`translate(${41.5 + chevron.width + gBicycle1.width + finalRotatedG1Width}, ${(canvasHeight - arrowStraight.height) / 2})`}>
              <path d={arrowStraight.d} fill={pathColor} fillRule="evenodd"/>
            </g>

          </g>

        </svg>
      );      

    }


    case 'B.5': {

      return (
        <svg
          width={canvasWidth}
          height={canvasHeight}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />

          <g transform={`translate(123.75, 0)`}>


            <g transform={`translate(${0}, ${(canvasHeight - gBicycle1.height) / 2})`}>
              <path d={gBicycle1.d} fill={pathColor} fillRule="evenodd"/>
            </g>

            <g transform={`translate(${22.5 + gBicycle1.width + finalRotatedG1Width}, ${(canvasHeight - finalRotatedG1Height) / 2})`}>
              <g transform={`scale(${g1Scale}) rotate(90)`}>
                {g1Sign}
              </g>
            </g>

          </g>

        </svg>
      );    

    }


    case 'B.6': {

      return (
        <svg
          width={canvasWidth}
          height={canvasHeight}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />

          <g transform={`translate(91.25, 0)`}>

            <g transform={`translate(${0}, ${(canvasHeight - gBicycle1.height) / 2})`}>
              <path d={gBicycle1.d} fill={pathColor} fillRule="evenodd"/>
            </g>

            <g transform={`translate(${22.5 + gBicycle1.width + finalRotatedG1Width}, ${(canvasHeight - finalRotatedG1Height) / 2})`}>
              <g transform={`scale(${g1Scale}) rotate(90)`}>
                {g1Sign}
              </g>
            </g>

            <g transform={`translate(${31.5 + gBicycle1.width + finalRotatedG1Width}, ${(canvasHeight - arrowStraight.height) / 2})`}>
              <path d={arrowStraight.d} fill={pathColor} fillRule="evenodd"/>
            </g>

          </g>

        </svg>
      );      

    }

    case 'B.7': {

      return (
        <svg
          width={canvasWidth}
          height={canvasHeight}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#808080" />

          <g transform={`translate(148.75, 0)`}>


            <g transform={`translate(${0}, ${(canvasHeight - gBicycle2.height) / 2})`}>
              <path d={gBicycle2.d} fill={pathColor} fillRule="evenodd"/>
            </g>

            <g transform={`translate(${22.5 + gBicycle2.width + finalRotatedG1Width}, ${(canvasHeight - finalRotatedG1Height) / 2})`}>
              <g transform={`scale(${g1Scale}) rotate(90)`}>
                {g1Sign}
              </g>
            </g>

          </g>

        </svg>
      );    

    }


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