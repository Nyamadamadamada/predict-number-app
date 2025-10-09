import { useEffect, useRef, useState, useCallback } from 'react';
import { InferenceSession, Tensor } from 'onnxruntime-web';

import SignatureCanvas from 'react-signature-canvas';
import { Button, Heading, Stack } from '@chakra-ui/react';
import './App.css';
import { mathUtils, runModelUtils, textUtils } from './utils';
import * as ort from 'onnxruntime-web';

const MODEL_FILEPATH_DEV = '/mnist.onnx';
// URL.createObjectURLの抑制のためにシングルスレッドの設定が必須．
// ref: https://github.com/microsoft/onnxruntime/issues/14445
ort.env.wasm.numThreads = 1;

const App = () => {
  const [model, setModel] = useState<InferenceSession | null>(null);
  const [maxNumber, setMaxNumber] = useState(null);
  const [maxScore, setMaxScore] = useState(null);

  const signaturePadRef = useRef(null);

  // MNISTモデルの読み込み
  async function loadModel() {
    try {
      console.log('モデルをロード中...');
      const session = await ort.InferenceSession.create(MODEL_FILEPATH_DEV, {
        executionProviders: ['webgpu', 'webgl', 'wasm'],
      });
      console.log('OK...');
      setModel(session);
    } catch (error) {
      console.error('読み込みエラー', error);
      throw error;
    }
  }

  useEffect(() => {
    (async () => {
      await loadModel();
    })();
  }, []);

  // 画像の前処理
  // 28x28のグレースケールに変換（MNISTは1x28x28、NCHW）
  const preprocess = (ctx: CanvasRenderingContext2D): Tensor => {
    const srcCanvas = ctx.canvas as HTMLCanvasElement;

    // 28x28 の縮小キャンバス
    const scaledCanvas = document.getElementById('input-canvas-scaled') as HTMLCanvasElement;
    const sctx = scaledCanvas.getContext('2d') as CanvasRenderingContext2D;

    // 白でクリアしてから元キャンバスを 28x28 に縮小描画
    sctx.save();
    sctx.clearRect(0, 0, 28, 28);
    sctx.drawImage(srcCanvas, 0, 0, srcCanvas.width, srcCanvas.height, 0, 0, 28, 28);
    sctx.restore();

    // 画素を取得
    const imageData = sctx.getImageData(0, 0, 28, 28);
    const { data } = imageData; // RGBA RGBA ...

    // MNIST: 1x28x28 (NCHW)
    const input = new Float32Array(28 * 28);

    for (let i = 0, j = 0; i < data.length; i += 4, j += 1) {
      // グレースケール（単純平均でもOKだが一応加重平均にしておく）
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b; // 0..255

      // 0..1 正規化 & 反転（白背景/黒文字 → 黒背景/白文字）
      input[j] = 1 - gray / 255;
    }

    return new Tensor('float32', input, [1, 1, 28, 28]);
  };

  const postprocess = (rawOutput: Tensor): Float32Array => {
    return mathUtils.softmax(Array.prototype.slice.call(rawOutput.data));
  };

  const getPredictedClass = (output: Float32Array) => {
    if (output.reduce((a, b) => a + b, 0) === 0) {
      return -1;
    }
    return output.reduce((argmax, n, i) => (n > output[argmax] ? i : argmax), 0);
  };

  //　ユーザーが筆を置くと発火
  const predict = useCallback(async () => {
    if (!model) {
      console.log('モデルがロードされていません');
      return;
    }
    const ctx = (document.getElementById('input-canvas') as HTMLCanvasElement).getContext(
      '2d'
    ) as CanvasRenderingContext2D;
    const tensor = preprocess(ctx);
    let feeds: Record<string, Tensor> = {};
    feeds[model.inputNames[0]] = tensor;
    console.log('イメージデータの中身');
    console.log(tensor);
    // 推論実行
    const [res, time] = await runModelUtils.runModel(model, tensor);
    const output = postprocess(res);
    const predictedClass = getPredictedClass(output);
    console.log('結果');
    console.log(output);
    console.log('推論時間', time);
    console.log('予測されたクラス');
    console.log(predictedClass);
  }, [model]);

  const reset = useCallback(() => {
    setMaxNumber(null);
    setMaxScore(null);
    signaturePadRef.current?.clear();
  }, []);

  const predictText = textUtils.getPredictionText(maxNumber, maxScore);

  return (
    <>
      <div className={`container stack `}>
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
              penColor="black"
              backgroundColor="white"
              canvasProps={{
                width: 420,
                height: 420,
                className: 'sigCanvas',
                id: 'input-canvas',
              }}
              onEnd={predict}
            />
            <canvas id="input-canvas-scaled" width="28" height="28" className="none"></canvas>
          </div>
          <div className="button">
            <Button onClick={reset}>reset</Button>
          </div>
        </Stack>
      </div>
    </>
  );
};

export default App;
