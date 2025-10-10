import { useEffect, useRef, useState, useCallback, createRef } from 'react';
import { InferenceSession } from 'onnxruntime-web';

import SignatureCanvas from 'react-signature-canvas';
import { Heading, Container, Stack, HStack } from '@chakra-ui/react';
import './App.css';
import { runModelUtils } from './utils';
import PostCodeCanvas from './components/PostCodeCanvas';
import CheckPostCodeButton from './components/CheckPostCodeButton';
import ContrrolBar from './components/ContrrolBar';
import { findAddressByZip } from './utils/postcode';
import { AddressRow } from './type/addresses';
import AddressResultCard from './components/AddressResultCard';
import NoAddressFound from './components/NoAddressFound';
import Futter from './components/Futter';

const App = () => {
  const [isCheced, setIsCheced] = useState(false);
  const [model, setModel] = useState<InferenceSession | null>(null);
  const [postCode, setPostCode] = useState<[number, number, number, number, number, number, number]>([
    0, 0, 0, 0, 0, 0, 0,
  ]);
  const [addressHit, setAddressHit] = useState<AddressRow | null>(null);

  // 郵便番号の桁の描画用
  const digitRefs = useRef(Array.from({ length: 7 }, () => createRef<SignatureCanvas>())).current;

  useEffect(() => {
    (async () => {
      // MNISTモデルの読み込み
      const session = await runModelUtils.createModel();
      setModel(session);
    })();
  }, []);

  // リセット
  const reset = useCallback(() => {
    digitRefs.forEach((ref) => ref.current?.clear());
    setPostCode([0, 0, 0, 0, 0, 0, 0]);
    setAddressHit(null);
    setIsCheced(false);
  }, [digitRefs]);

  // 郵便番号チェック
  const checkPostCode = useCallback(async () => {
    setIsCheced(false);
    try {
      const zip7 = postCode.join('');
      const hit = await findAddressByZip(zip7);
      setAddressHit(hit);
    } finally {
      setIsCheced(true);
    }
  }, [postCode]);

  return (
    <Container
      maxW={'3xl'}
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'space-between'}
      alignItems="center"
      minH={'calc(100vh - 100px)'}
      backgroundColor={'white'}
      marginY={10}
      paddingTop={10}
    >
      <Stack display={'flex'} flexDirection={'row'} alignItems="center" marginTop="20px" marginBottom="20px">
        <Heading size="3xl" letterSpacing="tight">
          手書き郵便番号
        </Heading>
        <Heading size="md" letterSpacing="tight">
          あなたの数字は認識できるかな...?
        </Heading>
      </Stack>
      <Stack>
        {model ? (
          <PostCodeCanvas model={model} digitRefs={digitRefs} setPostCode={setPostCode} />
        ) : (
          <p>モデル読み込み中...</p>
        )}
      </Stack>
      {/* 郵便番号チェックボタン */}
      <CheckPostCodeButton onClick={checkPostCode} />
      {/* コントロールバー（下：左にリセット、右に郵便番号表示） */}
      <ContrrolBar postCode={postCode} reset={reset} />
      {/* 検索結果カード */}
      {isCheced && addressHit && <AddressResultCard addressHit={addressHit} />}
      {isCheced && !addressHit && <NoAddressFound />}
      {/* フッター */}
      <Futter />
    </Container>
  );
};

export default App;
