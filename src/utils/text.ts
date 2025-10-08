// 数字認識結果に応じたテキストを生成する関数
export function getPredictionText(maxNumber, maxScore) {
  if (maxNumber === null || maxNumber === undefined) {
    return '数字を入力してください';
  }

  if (maxScore > 0.999) {
    return `この数字は確実に${maxNumber}です。`;
  } else if (maxScore > 0.9) {
    return `この数字はほぼ間違いなく${maxNumber}です。`;
  } else if (maxScore > 0.5) {
    return `この数字は多分${maxNumber}です。`;
  } else {
    return `この数字は${maxNumber}かもしれないです。`;
  }
}

