let seeds = [];
let displayIframe;
let particles = []; // 背景裝飾浮游粒子

function setup() {
  // 建立畫布並放入指定的 HTML 容器中
  let canvasWidth = 400;
  let canvas = createCanvas(canvasWidth, windowHeight);
  canvas.parent('canvas-column'); // 這一行對應 HTML 裡的 id

  // 取得 HTML 中的 iframe 元件
  displayIframe = select('#display-iframe');

  // 初始化兩週的作品種子
  // 參數：y 座標, 週次名稱, 連結網址
  seeds.push(new MemorySeed(height - 150, "第一週", "week1/index.html"));
  seeds.push(new MemorySeed(height - 350, "第二週", "week2/index.html"));
  seeds.push(new MemorySeed(height - 550, "第三週", "week3/index.html"));

  // 初始化漂浮粒子背景
  for (let i = 0; i < 40; i++) {
    particles.push(new DecorativeParticle());
  }

  noFill();
}

function draw() {
  background(15, 25, 20); // 更深邃且帶點綠意的背景色

  // 1. 繪製背景裝飾粒子
  for (let p of particles) {
    p.update();
    p.display();
  }

  // 確保 baseX 隨畫布寬度更新
  for (let s of seeds) {
    s.baseX = width / 2;
  }

  // 2. 繪製時間軸（藤蔓脈絡）
  drawVine();

  // 3. 更新並顯示種子節點
  for (let s of seeds) {
    s.update();
    s.display();
  }
}

// 利用 Vertex 繪製有機波浪狀的藤蔓
function drawVine() {
  push(); 
  // 設定發光效果 (Glow Effect)
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(0, 255, 100, 0.5)';
  
  stroke(120, 255, 150, 180);
  strokeWeight(3);
  noFill();
  
  beginShape();
  // 使用 curveVertex 讓線條更平滑
  for (let y = height + 50; y > -50; y -= 10) {
    let xOffset = sin(y * 0.015 + frameCount * 0.02) * 25;
    curveVertex(width / 2 + xOffset, y);
  }
  endShape();
  pop();
}

// 背景裝飾粒子類別
class DecorativeParticle {
  constructor() {
    this.init();
  }
  init() {
    this.x = random(width);
    this.y = random(height);
    this.speed = random(0.3, 1.0);
    this.size = random(1, 4);
    this.alpha = random(40, 150);
  }
  update() {
    this.y -= this.speed;
    if (this.y < -10) this.y = height + 10;
  }
  display() {
    noStroke();
    fill(180, 255, 220, this.alpha);
    circle(this.x, this.y, this.size);
  }
}

// 種子節點類別
class MemorySeed {
  constructor(y, label, url) {
    this.baseX = width / 2;
    this.y = y;
    this.label = label;
    this.url = url;
    this.size = 20;
    this.targetSize = 20;
    this.isHovered = false;
    this.angle = 0;
  }

  update() {
    // 計算當前藤蔓波動後的正確 X 位置
    let xOffset = sin(this.y * 0.02 + frameCount * 0.02) * 20;
    this.currentX = this.baseX + xOffset;

    // 檢查滑鼠懸停
    let d = dist(mouseX, mouseY, this.currentX, this.y);
    if (d < this.size / 2 + 10) { // 統一判定範圍為半徑 + 緩衝
      this.isHovered = true;
      this.targetSize = 50; // 放大效果
    } else {
      this.isHovered = false;
      this.targetSize = 20;
    }
    
    // 尺寸平滑過渡 (Lerp)
    this.size = lerp(this.size, this.targetSize, 0.1);
  }

  display() {
    push();
    translate(this.currentX, this.y);
    
    // 節點發光效果
    drawingContext.shadowBlur = this.isHovered ? 25 : 10;
    drawingContext.shadowColor = this.isHovered ? 'rgba(255, 200, 0, 0.7)' : 'rgba(0, 255, 150, 0.3)';

    // 懸停時的跳動與開花效果
    if (this.isHovered) {
      fill(255, 240, 100);
      ellipse(0, 0, this.size, this.size);
      // 繪製放射狀光芒
      stroke(255, 200, 50, 150);
      for(let i=0; i<8; i++) {
        rotate(PI/4);
        line(0, 0, this.size * 0.7, 0);
      }
    } else {
      fill(120, 255, 180);
      noStroke();
      ellipse(0, 0, this.size, this.size);
    }

    // 文字標籤 (移除陰影避免模糊)
    drawingContext.shadowBlur = 0;
    textAlign(CENTER);
    fill(255, 250);
    textSize(14);
    text(this.label, 0, this.size + 20);
    pop();
  }
}

function mousePressed() {
  // 檢查是否點擊到種子
  for (let s of seeds) {
    let d = dist(mouseX, mouseY, s.currentX, s.y);
    // 點擊判定：只要滑鼠在種子放大後的範圍內
    if (d < 30) { 
      if (displayIframe) {
        displayIframe.attribute('src', s.url);
        console.log("正在載入: " + s.label + " 路徑: " + s.url);
      }
    }
  }
}

// 增加視窗大小改變時的自動調整
function windowResized() {
  resizeCanvas(400, windowHeight);
  // 重新定位 seeds 可能需要根據新高度計算，若需固定比例可再調整
}
