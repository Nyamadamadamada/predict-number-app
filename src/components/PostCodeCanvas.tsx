import { Grid, GridItem, Box, Image } from '@chakra-ui/react';
import { useCallback } from 'react';
import { InferenceSession, Tensor } from 'onnxruntime-web';
import SignatureCanvas from 'react-signature-canvas';

import PostCodeDigit from './PostCodeDigit';
import { mathUtils, runModelUtils } from '@/utils';

type Props = {
  model: InferenceSession;
  digitRefs: React.RefObject<SignatureCanvas>[];
  setPostCode: React.Dispatch<React.SetStateAction<[number, number, number, number, number, number, number]>>;
};

const PostCodeCanvas = ({ model, digitRefs, setPostCode }: Props) => {
  //　ユーザーが筆を置くと発火
  const handlePredict = useCallback(
    async (digitIndex: number, canvasId: string, sctxCanvasId: string) => {
      const ctx = (document.getElementById(canvasId) as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
      // 28x28 の縮小キャンバス
      const scaledCanvas = document.getElementById(sctxCanvasId) as HTMLCanvasElement;
      const sctx = scaledCanvas.getContext('2d') as CanvasRenderingContext2D;

      const tensor = runModelUtils.preprocess(ctx, sctx);
      let feeds: Record<string, Tensor> = {};
      feeds[model.inputNames[0]] = tensor;
      // 推論実行
      const [res, _] = await runModelUtils.runModel(model, tensor);
      const output = mathUtils.postprocess(res);
      const predictedClass = runModelUtils.getPredictedClass(output);
      console.log('インデックス', canvasId);
      console.log('予測されたクラス', predictedClass);
      if (predictedClass === null) {
        console.log('予測に失敗しました');
        return;
      }
      setPostCode((prev) => {
        const newCode = [...prev] as [number, number, number, number, number, number, number];
        newCode[digitIndex] = predictedClass;
        return newCode;
      });
    },
    [model, setPostCode]
  );

  return (
    <Grid templateRows="auto auto auto" gap={4} height="100%">
      {/* 1段目: 郵便局画像＋3桁 */}
      <GridItem>
        <Box display="flex" alignItems="center" justifyContent="center" gap={10}>
          <Image src="/img/post_office_icon.png" alt="郵便局" boxSize="70px" />
          <Grid templateColumns="repeat(3, 1fr)" gap={2}>
            {digitRefs.slice(0, 3).map((ref, index) => (
              <PostCodeDigit key={index} index={index} ref={ref} handlePredict={handlePredict} />
            ))}
          </Grid>
        </Box>
      </GridItem>

      {/* 2段目: ハイフン */}
      <GridItem textAlign="center" fontSize="2xl" fontWeight="bold">
        -
      </GridItem>

      {/* 3段目: 4桁 */}
      <GridItem>
        <Grid templateColumns="repeat(4, 1fr)" gap={2}>
          {digitRefs.slice(3).map((ref, index) => (
            <PostCodeDigit key={index + 3} index={index + 3} ref={ref} handlePredict={handlePredict} />
          ))}
        </Grid>
      </GridItem>
    </Grid>
  );
};

export default PostCodeCanvas;
