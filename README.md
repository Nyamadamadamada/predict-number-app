# 手書き郵便番号 あなたの数字は認識できるかな...?

<img src="./output.gif" width="40%" />

##　概要

郵便番号を手入力し、該当地域を表示します。

## 環境構築

```terminal
git clone https://github.com/Nyamadamadamada/predict-number-app.git
cd predict-number-app
npm install
```

## デプロイの方法

1. `master`ブランチに最新のコードをまーじ
2. `npm run build`を実行
3. push 後にタグをつける
4. GitHub Workflows が発火し、GitHubPages にデプロイされる

※ タグは`v0.0.1`など始めに`v`をつけること。

```bash
# タグの例
git tag -a v0.0.2 -m "画像を表示されるように" HEAD
git push origin --tags
```

## ⭐️Special Thanks！！

Fork させていただいた Alesion30 さんの記事

[React + TensorFlow.js で手書き数字認識アプリを作ってみた](https://qiita.com/Alesion30/items/27713d7a65dc2d12b259)

## 参考リンク

### React 側で参考にした記事

React,Vite での onnxruntime-web の使い方参考

https://mooyeon.com/blog/onnx-on-web

Microsoft の onnxruntime-web を使ったデモサイト（Vue）

https://microsoft.github.io/onnxruntime-web-demo/#/mnist
https://github.com/Microsoft/onnxruntime-web-demo

### モデル構築で参考にした記事

https://qiita.com/TaigaMasuda/items/24d85860ffcd724de9eb
https://pystyle.info/pytorch-cnn-based-classification-model-with-fashion-mnist/

### デプロイの参考

https://zenn.dev/otaki0413/articles/react-deploy-github-pages
