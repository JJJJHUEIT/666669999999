let input;
let slider;
let button;
let isBouncing = false; // 用來控制是否跳動的開關變數
let iframe;
let selectElement;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 建立文字輸入框
  input = createInput('輸入文字');
  input.position(20, 20);
  input.style('font-size', '16px');
  input.style('background-color', '#003566');
  input.style('color', '#2c7da0');
  input.size(200);

  // 建立滑桿：範圍 15 到 80，預設值 30
  slider = createSlider(15, 80, 30);
  // 設定滑桿位置：在輸入框右邊 (20+200+20=240)，高度置中 (微調 y+5)
  slider.position(input.x + input.width + 20, input.y + 5);

  // 建立按鈕：位於滑桿右邊 20px
  button = createButton('跳動開關');
  button.position(slider.x + slider.width + 20, input.y);
  button.style('width', '90px'); // 將按鈕加寬，讓後方的選單也有足夠空間
  button.mousePressed(() => isBouncing = !isBouncing); // 按下按鈕切換狀態

  // 建立下拉式選單：位於按鈕右邊 20px
  selectElement = createSelect();
  selectElement.position(button.x + button.width + 20, input.y);
  selectElement.option('教科系');
  selectElement.option('淡江大學');
  selectElement.selected('教科系'); // 預設選擇教科系
  
  // 讓下拉式選單與「跳動開關」按鈕一樣大
  selectElement.size(button.width, button.height);

  // 當選單改變時，更新 iframe 網址
  selectElement.changed(() => {
    let val = selectElement.value();
    if (val === '淡江大學') iframe.attribute('src', 'https://www.tku.edu.tw/');
    if (val === '教科系') iframe.attribute('src', 'https://www.et.tku.edu.tw/');
  });

  // 建立 iframe 嵌入網頁
  iframe = createElement('iframe');
  iframe.position(200, 200); // 設定左上角位置 (距離左邊與上面各 200px)
  iframe.size(windowWidth - 400, windowHeight - 400); // 計算寬高 (總寬高減去左右上下的 200px)
  iframe.attribute('src', 'https://www.et.tku.edu.tw/'); // 設定網址
}

function draw() {
  background('#000814');
  
  let txt = input.value();
  let s = slider.value(); // 取得滑桿數值
  textSize(s);            // 設定文字大小
  textAlign(LEFT, CENTER); // 設定垂直置中
  
  // 定義色票陣列
  let colors = ["#880d1e", "#dd2d4a", "#f26a8d", "#f49cbb", "#cbeef3"];

  // 確保有文字才執行迴圈
  if (txt.length > 0) {
    let w = textWidth(txt); // 計算文字寬度
    let y = 80 + s; // 初始 y 座標 (往下移動，避開上方的輸入框與滑桿)

    // 外層迴圈：控制垂直方向 (多排)
    while (y < height) {
      let x = 0;
      let i = 0; // 用來計算目前是該行的第幾個文字
      // 內層迴圈：控制水平方向 (一整排)
      while (x < width) {
        fill(colors[i % colors.length]); // 依序取用顏色，若超過陣列長度則從頭循環
        
        // 計算跳動偏移量 (包含 X 與 Y 軸)
        let xOffset = 0;
        let yOffset = 0;
        
        if (isBouncing) {
          // 定義波浪的角度：放慢速度 (0.05) 並拉長波長 (0.01)
          // 加入 x 與 y 的影響，讓整片文字像海面一樣起伏
          let angle = frameCount * 0.05 + x * 0.01 + y * 0.01;

          // 結合 cos(左右) 與 sin(上下) 產生橢圓形的滾動效果，更像真實海浪
          xOffset = cos(angle) * 10; // 水平擺動幅度
          yOffset = sin(angle) * 20; // 垂直起伏幅度
        }
        
        text(txt, x + xOffset, y + yOffset);
        x += w + 20; // x 座標向右移動一個文字寬度加上間距
        i++;
      }
      y += s + 20; // y 座標向下移動 (文字大小 + 固定行距)
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  iframe.size(windowWidth - 400, windowHeight - 400); // 視窗縮放時，同步調整 iframe 大小
}