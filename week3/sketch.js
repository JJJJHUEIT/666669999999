/**
 * p5_audio_visualizer
 * 結合 p5.js 與 p5.sound，載入音樂並讓畫面上隨機移動的多邊形隨著音量大小即時縮放。
 */

// 外部定義的二維陣列，作為多邊形的基礎頂點座標 (這裡定義了一個六邊形)
let points = [[-3, 5], [3, 7], [1, 5], [2, 4], [4, 3], [5, 2], [6, 2], [8, 4], [8, -1], [6, 0], [0, -3], [2, -6], [-2, -3], [-4, -2], [-5, -1], [-6, 1], [-6, 2]];

// 變數宣告
let shapes = []; // 儲存多個多邊形狀態（位置、速度、顏色、頂點）的陣列
let song;        // 音樂檔案物件
let amplitude;   // p5.Amplitude 音量分析器
let bubbles = []; // 儲存水泡的陣列

function preload() {
  // 使用 loadSound() 預載入音樂檔案
  // 注意：請確保專案目錄下有名為 'sample.mp3' 的檔案，或在此修改為您的音樂路徑
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  // 建立符合視窗大小的畫布
  createCanvas(windowWidth, windowHeight);

  // 讓音樂循環播放（loop）
  // preload 會確保音樂載入完成後才執行 setup，所以這裡可以直接使用 song
  song.loop();

  // 初始化 amplitude
  amplitude = new p5.Amplitude();

  // 隨機產生 10 個具有不同起始座標、移動速度（dx, dy）、顏色與放大頂點的多邊形
  for (let i = 0; i < 10; i++) {
    let shapeVertices = [];
    // 隨機決定該多邊形的基礎大小比例 (10 ~ 20 倍)
    let baseScale = random(10, 20);

    // 根據 points 產生該多邊形專屬的縮放後頂點
    for (let j = 0; j < points.length; j++) {
      shapeVertices.push([
        points[j][0] * baseScale,
        points[j][1] * baseScale
      ]);
    }

    // 將屬性存入 shapes 陣列中
    shapes.push({
      x: random(width),
      y: random(height),
      dx: random(-3, 3),
      dy: random(-3, 3),
      color: color(random(255), random(255), random(255), 150), // 隨機半透明顏色
      vertices: shapeVertices
    });
  }
}

function draw() {
  // 設定背景色
  background(30);

  // 每幀隨機產生新的水泡
  if (random(1) < 0.03) {
    bubbles.push(new Bubble());
  }

  // 透過 amplitude.getLevel() 取得當前音量 (範圍 0.0 ~ 1.0)
  let level = amplitude.getLevel();

  // 將音量對應（map）為 0.5 到 2 倍的縮放比例
  let scaleFactor = map(level, 0, 1, 0.5, 2);

  // 更新並繪製每個多邊形
  for (let i = 0; i < shapes.length; i++) {
    let s = shapes[i];

    // 更新 shapes 陣列中每個圖形的位置
    s.x += s.dx;
    s.y += s.dy;

    // 碰到視窗邊緣需反彈
    if (s.x < 0 || s.x > width) s.dx *= -1;
    if (s.y < 0 || s.y > height) s.dy *= -1;

    // 繪製多邊形
    push();
    translate(s.x, s.y);
    
    // 配合音量縮放比例
    if (s.dx > 0) {
      scale(-scaleFactor, scaleFactor); // 往右移動時左右翻轉
    } else {
      scale(scaleFactor); // 往左移動時維持原狀
    }
    
    // 設定圖形自身顏色
    fill(s.color);
    noStroke();

    // 繪製頂點
    beginShape();
    for (let j = 0; j < s.vertices.length; j++) {
      vertex(s.vertices[j][0], s.vertices[j][1]);
    }
    endShape(CLOSE);
    pop();
  }

  // 更新並繪製所有水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.update();
    b.display();
    if (b.isFinished()) {
      bubbles.splice(i, 1);
    }
  }
}

// 當視窗大小改變時，調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  // 判斷是否按下滑鼠左鍵
  if (mouseButton === LEFT) {
    if (song.isPlaying()) {
      song.pause(); // 暫停音樂
    } else {
      song.loop();  // 播放音樂
    }
  }
}

// 水泡類別
class Bubble {
  constructor() {
    this.r = random(15, 50); // 水泡半徑
    this.x = random(this.r, width - this.r);
    this.y = height + this.r;
    this.vx = random(-0.5, 0.5); // 水平飄移速度
    this.vy = random(-3, -1);   // 垂直上升速度
    this.isPopped = false;
    this.popAnimationFrames = 20; // 破掉動畫的總幀數
    this.currentPopFrame = 0;
  }

  // 更新水泡位置或狀態
  update() {
    if (!this.isPopped) {
      this.x += this.vx;
      this.y += this.vy;
      // 增加左右搖擺效果
      this.x += sin(this.y * 0.05);

      // 如果水泡移出畫面頂端，或隨機發生，就標記為破掉
      if (this.y < this.r * 2 || random(1) < 0.005) {
        this.isPopped = true;
      }
    }
  }

  // 繪製水泡或其破掉效果
  display() {
    if (this.isPopped) {
      // 繪製破掉效果
      this.currentPopFrame++;
      let progress = this.currentPopFrame / this.popAnimationFrames;
      let alpha = map(progress, 0, 1, 200, 0);

      // 破裂時向外擴散的圓環
      stroke(255, alpha);
      strokeWeight(map(progress, 0, 1, 3, 0));
      noFill();
      ellipse(this.x, this.y, this.r * 2 * (1 + progress));

      // 產生一些小水珠粒子
      if (this.currentPopFrame < 10) {
        for (let i = 0; i < 3; i++) {
          let pRadius = this.r * progress * random(0.5, 1.2);
          let angle = random(TWO_PI);
          let px = this.x + cos(angle) * pRadius;
          let py = this.y + sin(angle) * pRadius;
          fill(255, alpha * 0.9);
          noStroke();
          ellipse(px, py, random(2, 5));
        }
      }
    } else {
      // 繪製正常的水泡
      stroke(255, 150); // 白色透明
      strokeWeight(2);
      noFill();
      ellipse(this.x, this.y, this.r * 2);
    }
  }

  // 判斷動畫是否結束
  isFinished() {
    return this.isPopped && this.currentPopFrame >= this.popAnimationFrames;
  }
}
