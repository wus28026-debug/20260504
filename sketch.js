let capture;
let faceMesh;
let faces = [];
let stars = [];
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
// 臉部最外層輪廓編號序列
let faceSilhouetteIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  capture.size(640, 480); // 設定攝影機解析度
  // 隱藏預設的 HTML 影片元件，只在畫布上繪製
  capture.hide();

  // 產生 400 顆隨機的星星
  for (let i = 0; i < 400; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      opacity: random(100, 255)
    });
  }

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
  background(0); // 背景設為黑色，以遮掉臉部以外的區域

  // 繪製全螢幕背景星星，營造外太空感
  noStroke();
  for (let i = 0; i < stars.length; i++) {
    let s = stars[i];
    fill(255, s.opacity);
    ellipse(s.x, s.y, s.size);
  }

  let w = width * 0.5; // 寬度為全螢幕的 50%
  let h = height * 0.5; // 高度為全螢幕的 50%
  let x = (width - w) / 2; // 置中 X 座標
  let y = (height - h) / 2; // 置中 Y 座標

  push();
  // 移至影像顯示區域的右側邊界，然後水平翻轉以達到鏡像效果
  translate(x + w, y);
  scale(-1, 1);

  // 如果有偵測到臉部，則繪製指定編號的串接線條
  if (faces.length > 0) {
    let face = faces[0];

    // --- 製作臉部遮罩 ---
    push();
    beginClip(); // 開始建立裁剪遮罩
    beginShape();
    for (let i = 0; i < faceSilhouetteIndices.length; i++) {
      let p = face.keypoints[faceSilhouetteIndices[i]];
      if (p) {
        vertex(p.x * (w / capture.width), p.y * (h / capture.height));
      }
    }
    endShape(CLOSE);
    endClip(); // 結束遮罩定義，之後繪製的內容只會出現在遮罩內

    // 在遮罩內繪製影像 (影像現在是疊加在背景星空之上的)
    // 移除之前的半透明效果 (tint)，讓臉部影像清晰顯示
    image(capture, 0, 0, w, h);
    pop();
    // --- 遮罩結束 ---

    noFill();

    // 計算隨時間變化的顏色 (紅 -> 紫 -> 藍)
    let neonColors = [color(255, 0, 0), color(160, 32, 240), color(0, 0, 255)];
    let cycleTime = millis() / 2000; // 每 2 秒切換到下一個目標顏色
    let colIdx = floor(cycleTime % neonColors.length);
    let nextColIdx = (colIdx + 1) % neonColors.length;
    let amt = cycleTime % 1; // 在 0 與 1 之間循環的插值比例
    let currentColor = lerpColor(neonColors[colIdx], neonColors[nextColIdx], amt);

    // 繪製最外層輪廓線：加上動態霓虹燈光暈效果
    drawingContext.shadowBlur = 15; // 設定光暈模糊程度
    drawingContext.shadowColor = currentColor.toString(); // 設定動態光暈顏色
    stroke(currentColor); // 設定動態線條顏色
    strokeWeight(2);
    for (let i = 0; i < faceSilhouetteIndices.length; i++) {
      let p1 = face.keypoints[faceSilhouetteIndices[i]];
      let p2 = face.keypoints[faceSilhouetteIndices[(i + 1) % faceSilhouetteIndices.length]];
      if (p1 && p2) {
        line(p1.x * (w / capture.width), p1.y * (h / capture.height), p2.x * (w / capture.width), p2.y * (h / capture.height));
      }
    }
    
    // 繪製完外圈後重設陰影，避免影響到內部的嘴唇與眼睛
    drawingContext.shadowBlur = 0;

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
  } else {
    // 如果沒偵測到臉部，可在此處理（目前背景已是黑色）
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
