let capture;

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏預設的 HTML 影片元件，只在畫布上繪製
  capture.hide();
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
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
