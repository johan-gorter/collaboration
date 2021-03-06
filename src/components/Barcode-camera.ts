/*
this component returns a videoview,
and optionally an additional canvas and textview in which the code of a barcode can be shown.
This component uses the Quagga.js Library for scanning the barcodes.
*/

import {h, Projector} from 'maquette';
require('../styles/Barcode-camera.scss');

const Quagga = <any>require('quagga'); // library for scanning barcodes

export interface BarcodeCameraConfig {
  projector: Projector;
}

export interface BarcodeCameraBindings { }

export let createBarcodeCamera = (config: BarcodeCameraConfig, bindings: BarcodeCameraBindings) => {
  let {projector} = config;

  let detectedCode = 'nothing detected yet...';
  let barcodeReaders = ['ean_reader', 'code_128_reader', 'code_39_reader', 'codabar_reader', 'upc_reader', 'i2of5_reader'];
  let cameraIsNotSupported = false;

  let startCamera = () => {

    Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: '#barcodeScanViewHolder'
      },
      decoder: {
        readers: barcodeReaders
      }
    }, function (err: any) {
      if (err) {
        console.log(err);
        cameraIsNotSupported = true;
        projector.scheduleRender();
        return;
      }

      console.log('Initialization finished. Ready to start');
      Quagga.start();
    });

    Quagga.onProcessed(function (result: any) {
      let drawingCtx = Quagga.canvas.ctx.overlay,
      drawingCanvas = Quagga.canvas.dom.overlay;

      if (result) {
        if (result.boxes) {
          drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width'), 10), parseInt(drawingCanvas.getAttribute('height'), 10));
          result.boxes.filter(function (box: any) {
            return box !== result.box;
          }).forEach(function (box: any) {
            Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: 'green', lineWidth: 2 });
          });
        }

        if (result.box) {
          Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: '#00F', lineWidth: 2 });
        }

        if (result.codeResult && result.codeResult.code) {
          Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
        }
      }
    });

    Quagga.onDetected(function (result: any) {
      let code = result.codeResult.code;
      detectedCode = code;
      projector.scheduleRender();
    });
  };

  let temp_image = new Image();
  let decodeImage = (event: any) => {

    let parent = <any>document.getElementById('barcodeScanViewHolder');
    let imageCanvas = <HTMLCanvasElement>document.getElementById('uploadedImageCanvas');
    let drawBoxCanvas = <HTMLCanvasElement>parent.getElementsByClassName('drawingBuffer')[0];
    let imageContext = imageCanvas.getContext('2d');
    let boxContext = drawBoxCanvas.getContext('2d');

    if (event.target.files.length === 1 &&
      event.target.files[0].type.indexOf('image/') === 0) {
        temp_image.src = URL.createObjectURL(event.target.files[0]);

        Quagga.decodeSingle({
          decoder: {
            readers: barcodeReaders
          },
          locate: true, // try to locate the barcode in the image
          src: temp_image.src
        },
        function (result: any) {
          imageContext.canvas.height = boxContext.canvas.height;
          imageContext.canvas.width = boxContext.canvas.width;
          imageContext.drawImage(temp_image, 0, 0, drawBoxCanvas.width, drawBoxCanvas.height);
          if (result) {
            if (result.codeResult) {
              console.log('result', result.codeResult.code);
              detectedCode = result.codeResult.code;
              projector.scheduleRender();
            } else {
              console.log('a box was detected, but no code detected');
            }
          } else {
            console.log('nothing detected');
          }
        });
      }
    };

    return {
      renderMaquette: () => {
        return h('div', { class: 'camera-container' }, [
          cameraIsNotSupported ? [
             h('h1', [`Your browser does not support the camera :'( `]),
             h('i', [`Use google Chrome, Mozilla Firefox or Microsoft Edge to use this functionality`])
             ] : [
             h('h1', [`Show a barcode to scan it`]),
             h('i', [`...or upload a picture from your computer`]),

            h('button', {class: 'button'}, [
              h('span', {class: 'upload-button-text'}, ['Choose a file...']),
              h('input', {
                type: 'file',
                capture: 'camera',
                accept: 'image/*',
                id: 'takePictureField',
                onchange: decodeImage
              })
            ]),        
            // after the DOM is loaded we will try to load the video in it
            h('div', { id: 'barcodeScanViewHolder', class: 'viewport', afterCreate: startCamera }, [
              // for barcode scanning we need an extra canvas in here
              h('canvas', { id: 'uploadedImageCanvas', class: 'overlayCanvas' }, []) 
            ]),
            h('h2', [detectedCode])
            ]
        ]);
      }
    };
  };

export let destroyBarcodeCamera = () => {
    Quagga.stop();
};
