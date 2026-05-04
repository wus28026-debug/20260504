let capture;
let faceMesh;
let faces = [];
// 您指定的特徵點編號序列
let faceIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
// 第二組指定的特徵點編號序列 (內嘴唇輪廓)
let faceIndices2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
// 左眼外圈編號序列 (包含 247)
let eyeOuterIndices = [130, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
// 左眼內圈編號序列 (包含 246)
let eyeInnerIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
// 右眼外圈編號序列 (畫面右側)
let eyeOuterIndices2 = [359, 467, 260, 259, 257, 258, 286, 414, 463, 341, 256, 252, 253, 254, 339, 255];
// 右眼內圈編號序列 (畫面右側)
let eyeInnerIndices2 = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  capture.size(640, 480); // 設定攝影機解析度
  // 隱藏預設的 HTML 影片元件，只在畫布上繪製
  capture.hide();

  // 初始化 FaceMesh 模型
  faceMesh = ml5.faceMesh(capture, { maxFaces: 1, refineLandmarks: false, flipHorizontal: false }, () => {
    console.log("FaceMesh Model Loaded!");
    // 開始持續偵測
    faceMesh.detectStart(capture, (results) => {
      faces = results;
    });
  });
}

function draw() {
  background('#e7c6ff');

  let w = width * 0.5; // 寬度為全螢幕的 50%
  let h = height * 0.5; // 高度為全螢幕的 50%
  let x = (width - w) / 2; // 置中 X 座標
  let y = (height - h) / 2; // 置中 Y 座標

  push();
  // 移至影像顯示區域的右側邊界，然後水平翻轉以達到鏡像效果
  translate(x + w, y);
  scale(-1, 1);
  image(capture, 0, 0, w, h);

  // 如果有偵測到臉部，則繪製指定編號的串接線條
  if (faces.length > 0) {
    let face = faces[0];
    noFill();

    // 第一組線條：紅色，粗細 2 (使其更像口紅的輪廓)
    stroke('red');
    strokeWeight(2);
    for (let i = 0; i < faceIndices.length; i++) {
      let p1 = face.keypoints[faceIndices[i]];
      let p2 = face.keypoints[faceIndices[(i + 1) % faceIndices.length]];

      if (p1 && p2) {
        // 將座標從原始攝影機尺寸縮放到畫布上的 50% 顯示尺寸
        let x1 = p1.x * (w / capture.width);
        let y1 = p1.y * (h / capture.height);
        let x2 = p2.x * (w / capture.width);
        let y2 = p2.y * (h / capture.height);
        line(x1, y1, x2, y2);
      }
    }

    // 第二組線條：紅色，粗細 1 (您要求的編號序列)
    stroke('red');
    strokeWeight(1);
    for (let i = 0; i < faceIndices2.length; i++) {
      let p1 = face.keypoints[faceIndices2[i]];
      let p2 = face.keypoints[faceIndices2[(i + 1) % faceIndices2.length]];

      if (p1 && p2) {
        // 座標縮放比例需與影像顯示尺寸 (50%) 一致
        let x1 = p1.x * (w / capture.width);
        let y1 = p1.y * (h / capture.height);
        let x2 = p2.x * (w / capture.width);
        let y2 = p2.y * (h / capture.height);
        line(x1, y1, x2, y2);
      }
    }

    // 左眼外圈 (包含 247)：紅色，粗細 2
    stroke('red');
    strokeWeight(2);
    for (let i = 0; i < eyeOuterIndices.length; i++) {
      let p1 = face.keypoints[eyeOuterIndices[i]];
      let p2 = face.keypoints[eyeOuterIndices[(i + 1) % eyeOuterIndices.length]];

      if (p1 && p2) {
        let x1 = p1.x * (w / capture.width);
        let y1 = p1.y * (h / capture.height);
        let x2 = p2.x * (w / capture.width);
        let y2 = p2.y * (h / capture.height);
        line(x1, y1, x2, y2);
      }
    }

    // 左眼內圈 (包含 246)：紅色，粗細 1
    strokeWeight(1);
    for (let i = 0; i < eyeInnerIndices.length; i++) {
      let p1 = face.keypoints[eyeInnerIndices[i]];
      let p2 = face.keypoints[eyeInnerIndices[(i + 1) % eyeInnerIndices.length]];

      if (p1 && p2) {
        let x1 = p1.x * (w / capture.width);
        let y1 = p1.y * (h / capture.height);
        let x2 = p2.x * (w / capture.width);
        let y2 = p2.y * (h / capture.height);
        line(x1, y1, x2, y2);
      }
    }

    // 右眼外圈：紅色，粗細 2
    stroke('red');
    strokeWeight(2);
    for (let i = 0; i < eyeOuterIndices2.length; i++) {
      let p1 = face.keypoints[eyeOuterIndices2[i]];
      let p2 = face.keypoints[eyeOuterIndices2[(i + 1) % eyeOuterIndices2.length]];

      if (p1 && p2) {
        let x1 = p1.x * (w / capture.width);
        let y1 = p1.y * (h / capture.height);
        let x2 = p2.x * (w / capture.width);
        let y2 = p2.y * (h / capture.height);
        line(x1, y1, x2, y2);
      }
    }

    // 右眼內圈：紅色，粗細 1
    strokeWeight(1);
    for (let i = 0; i < eyeInnerIndices2.length; i++) {
      let p1 = face.keypoints[eyeInnerIndices2[i]];
      let p2 = face.keypoints[eyeInnerIndices2[(i + 1) % eyeInnerIndices2.length]];

      if (p1 && p2) {
        let x1 = p1.x * (w / capture.width);
        let y1 = p1.y * (h / capture.height);
        let x2 = p2.x * (w / capture.width);
        let y2 = p2.y * (h / capture.height);
        line(x1, y1, x2, y2);
      }
    }
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
