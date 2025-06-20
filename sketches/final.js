const { Responsive } = P5Template;
let video;
let facemesh;
let predictions = [];

function setup() {
  new Responsive().createResponsiveCanvas(800, 600, 'contain', true);
  video = createCapture(VIDEO, { flipped: true });
  video.size(800, 600);
  video.hide();
  video = createCapture(VIDEO);
  facemesh = ml5.facemesh(video, () => {
    console.log();
  });

  facemesh.on('predict', (results) => {
    predictions = results;
  });
}

function draw() {
  background(0);
  // 웹캠 영상 표시
  image(video, 0, 0, width, height);

  if (mouseIsPressed) {
    // filter(THRESHOLD);
    filter(GRAY);
  }

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    const topLip = keypoints[13];
    const bottomLip = keypoints[14];

    const mouthX = (topLip[0] + bottomLip[0]) / 2;
    const mouthY = (topLip[1] + bottomLip[1]) / 2;

    const mouthOpen = dist(topLip[0], topLip[1], bottomLip[0], bottomLip[1]);

    // 입 크기 계산
    const mouthSize = map(mouthOpen, 5, 40, 30, 200, true);

    // 입벌리기
    let pizzaSize;
    if (mouthOpen > 40) {
      pizzaSize = 250;
    } else if (mouthOpen > 20) {
      pizzaSize = 150;
    } else {
      pizzaSize = 50;
    }

    drawPizza(mouseX, mouseY, pizzaSize);

    function drawPizza(x, y, size) {
      push();
      translate(x, y);

      // 피자 원 (치즈색)
      strokeWeight(10);
      stroke(0, 255, 100);
      fill(255, 100, 100); // 치즈색 노란색
      ellipse(0, 0, size, size);

      noStroke();
      fill('black');
      let slices = 6;
      let pepperoniRadius = size * 0.1; // 페퍼로니 크기
      let pepperoniDistance = size * 0.3; // 피자 중심에서 페퍼로니까지 거리

      for (let i = 0; i < slices; i++) {
        let angle = (TWO_PI / slices) * i;
        let px = cos(angle) * pepperoniDistance;
        let py = sin(angle) * pepperoniDistance;
        ellipse(px, py, pepperoniRadius, pepperoniRadius);
      }
      pop();
    }

    // 입술 외곽선
    beginShape();
    for (let i = 0; i < lipsExterior.length; i++) {
      let index = lipsExterior[i];
      let point = keypoints[index];

      let scaleX = width / video.width;
      let scaleY = height / video.height;

      let px = point[0] * scaleX;
      let py = point[1] * scaleY;

      stroke(255, 0, 255);
      strokeWeight(2);
      noFill();
      vertex(px, py);
    }
    endShape(CLOSE);

    beginShape();
    for (let i = 0; i < lipsInterior.length; i++) {
      let index = lipsInterior[i];
      let point = keypoints[index];

      let scaleX = width / video.width;
      let scaleY = height / video.height;

      let px = point[0] * scaleX;
      let py = point[1] * scaleY;

      stroke(255, 0, 255);
      strokeWeight(2);
      noFill();
      vertex(px, py);
    }
    endShape(CLOSE);
  }
}
let lipsExterior = [
  267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61, 185,
  40, 39, 37, 0,
];

// Define the interior lip landmark indices for drawing the inner lip contour
let lipsInterior = [
  13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 191,
  80, 81, 82,
];
