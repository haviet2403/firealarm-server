const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Phục vụ các file tĩnh (HTML, CSS, JS) từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware để kiểm tra JSON hợp lệ
app.use(express.json({ strict: false }), (err, req, res, next) => {
  if (err) {
    console.error('Invalid JSON received:', err.message);
    res.status(400).send('Invalid JSON');
    return;
  }
  next();
});

// Lưu trữ dữ liệu cảm biến
let sensorData = {
  temperature: 0,
  gas: 0,
  smoke: 0,
  flame: 0
};

// Route để nhận dữ liệu từ ESP32
app.post('/update', (req, res) => {
  // Kiểm tra dữ liệu trước khi gán
  sensorData = {
    temperature: isNaN(req.body.temperature) ? 0 : req.body.temperature,
    gas: req.body.gas || 0,
    smoke: req.body.smoke || 0,
    flame: req.body.flame || 0
  };

  // Ghi log chi tiết giá trị cảm biến
  console.log('--- Sensor Data Received ---');
  console.log(`Temperature: ${sensorData.temperature} °C`);
  console.log(`Gas (MQ-5): ${sensorData.gas}`);
  console.log(`Smoke (MQ-2): ${sensorData.smoke}`);
  console.log(`Flame: ${sensorData.flame}`);
  console.log('----------------------------');

  res.status(200).send('Data received');

  // Gửi dữ liệu đến tất cả client WebSocket
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(sensorData));
    }
  });
});

// Khởi động server HTTP
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Tạo WebSocket server
const wss = new WebSocket.Server({ server });