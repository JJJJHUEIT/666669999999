let seaweeds = [];
let bubbles = [];
let popSound;
let soundEnabled = true;

function preload() {
  popSound = loadSound('pop.mp3');
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('pointer-events', 'none'); // 讓滑鼠事件穿透 Canvas，以便操作 iframe

  let iframe = createElement('iframe');
  iframe.position(0, 0);
  iframe.size(windowWidth, windowHeight);
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('border', 'none');
  iframe.style('z-index', '-1'); // 設定 iframe 在 Canvas 後面

  // 定義顏色陣列
  let colors = ['#03045e', '#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'];
  
  // 產生 80 條水草，從左到右隨機分佈
  for (let i = 0; i < 80; i++) {
    // 產生每一條水草的屬性：位置、高度、顏色、粗細、搖晃頻率
    let x = random(width);
    let h = random(height * 0.2, height * 0.45);
    let c = random(colors);
    let w = random(40, 50);
    let speed = random(0.002, 0.01);
    seaweeds.push(new Seaweed(x, h, c, w, speed));
  }
}

function draw() {
  clear();
  background(2, 62, 138, 76); // 背景顏色 #023e8a (2, 62, 138)，透明度 0.3 (76/255)
  blendMode(BLEND);

  for (let s of seaweeds) {
    s.display();
  }

  // 隨機產生氣泡
  if (random(1) < 0.2) {
    bubbles.push(new Bubble());
  }
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isDead()) {
      bubbles.splice(i, 1);
    }
  }
}

function mousePressed() {
  soundEnabled = !soundEnabled;
}

class Seaweed {
  constructor(x, h, c, w, speed) {
    this.x = x;
    this.h = h;
    this.c = color(c); // 轉換為顏色物件
    this.c.setAlpha(150); // 加入透明度 (0-255)
    this.w = w;
    this.speed = speed;
    this.noiseOffset = random(1000); // 每個水草獨立的噪聲偏移
  }

  display() {
    stroke(this.c);
    strokeWeight(this.w);
    noFill();
    beginShape();
    curveVertex(this.x, height);
    curveVertex(this.x, height);
    for (let y = height; y > height - this.h; y -= 10) {
      let progress = map(y, height, height - this.h, 0, 1);
      let xOffset = map(noise(frameCount * this.speed + y * 0.002 + this.noiseOffset), 0, 1, -60, 60) * progress;
      curveVertex(this.x + xOffset, y);
    }
    let tipY = height - this.h;
    let tipXOffset = map(noise(frameCount * this.speed + tipY * 0.002 + this.noiseOffset), 0, 1, -60, 60);
    curveVertex(this.x + tipXOffset, tipY);
    curveVertex(this.x + tipXOffset, tipY);
    endShape();
  }
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + 10;
    this.d = random(10, 30); // 氣泡大小
    this.speed = random(1, 4); // 上升速度
    this.popY = random(height * 0.2, height * 0.8); // 隨機設定破裂高度
    this.popping = false;
    this.popTimer = 0;
  }

  update() {
    if (this.popping) {
      this.popTimer++;
    } else {
      this.y -= this.speed;
      this.x += sin(frameCount * 0.05 + this.y * 0.05) * 0.5; // 輕微左右搖晃
      if (this.y < this.popY) {
        this.popping = true;
        if (soundEnabled) {
          popSound.play();
        }
      }
    }
  }

  display() {
    if (this.popping) {
      // 破掉的效果：擴散的圓圈
      noFill();
      stroke(255, map(this.popTimer, 0, 10, 255, 0));
      strokeWeight(2);
      circle(this.x, this.y, this.d + this.popTimer * 3);
    } else {
      noStroke();
      fill(255, 127); // 白色，透明度 0.5 (127/255)
      circle(this.x, this.y, this.d);
      fill(255, 204); // 左上角高光，透明度 0.8 (204/255)
      circle(this.x - this.d * 0.25, this.y - this.d * 0.25, this.d * 0.3);
    }
  }

  isDead() {
    return (this.popping && this.popTimer > 10) || this.y < -20;
  }
}
