import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import SignatureCanvas from 'react-signature-canvas';
import { Button, Heading, Stack } from '@chakra-ui/react';
import "./App.css";
import { textUtils } from './utils';
import * as ort from 'onnxruntime-web/webgpu';

const MODEL_FILEPATH_DEV = "/mnist.onnx";


const App = () => {
  const [isLoading, setIsLoading] = useState('is-loading');
  const [model, setModel] = useState(null);
  const [maxNumber, setMaxNumber] = useState(null);
  const [maxScore, setMaxScore] = useState(null);

  const signaturePadRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      const loaded = await tf.loadLayersModel(
        'https://raw.githubusercontent.com/tsu-nera/tfjs-mnist-study/master/model/model.json'
      );
      if (isMounted) {
        setModel(loaded);
        setIsLoading('');
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // テンソル化と正規化・推論
  const getAccuracyScores = useCallback(
    (imageData) => {
      if (!model) return [];
      const scores = tf.tidy(() => {
        const channels = 1;
        let input = tf.browser.fromPixels(imageData, channels);
        input = tf.cast(input, 'float32').div(tf.scalar(255));
        input = input.expandDims();
        return model.predict(input).dataSync();
      });
      return scores;
    },
    [model]
  );

  // 画像の前処理
  // 28x28のグレースケールに変換
  const getImageData = useCallback(() => {
    return new Promise((resolve) => {
      const context = document.createElement('canvas').getContext('2d');
      const image = new Image();
      const width = 28;
      const height = 28;

      image.onload = () => {
        context.drawImage(image, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height);

        // to grayscale
        for (let i = 0; i < imageData.data.length; i += 4) {
          const avg =
            (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
          imageData.data[i] = avg;
          imageData.data[i + 1] = avg;
          imageData.data[i + 2] = avg;
        }
        resolve(imageData);
      };

      image.src = signaturePadRef?.current?.toDataURL();
    });
  }, []);

  //　ユーザーが筆を置くと発火
  const predict = useCallback(() => {
    getImageData()
      .then((imageData) => getAccuracyScores(imageData))
      .then((accuracyScores) => {
        if (!accuracyScores || accuracyScores.length === 0) return;

        const maxAccuracy = accuracyScores.indexOf(
          Math.max.apply(null, accuracyScores)
        );

        setMaxNumber(maxAccuracy);
        setMaxScore(accuracyScores[maxAccuracy]);
        console.log(accuracyScores);
      });
  }, [getImageData, getAccuracyScores]);

  const reset = useCallback(() => {
    setMaxNumber(null);
    setMaxScore(null);
    signaturePadRef.current?.clear();
  }, []);

  const predictText = textUtils.getPredictionText(maxNumber, maxScore);

  return (
    <div className={`container stack ${isLoading}`}>
      <Stack>
        <Stack>
          <Heading size="3xl" letterSpacing="tight">
            {predictText}
          </Heading>
        </Stack>
        <div className="canbas">
          <SignatureCanvas
            ref={signaturePadRef}
            minWidth={15}
            maxWidth={15}
            penColor="white"
            backgroundColor="black"
            canvasProps={{
              width: 420,
              height: 420,
              className: 'sigCanvas',
            }}
            onEnd={predict}
          />
        </div>
        <div className="button">
          <Button onClick={reset}>reset</Button>
        </div>
      </Stack>
    </div>
  );
};

export default App;
