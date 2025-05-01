const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Phục vụ các file tĩnh (HTML, CSS, JS) từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Phân tích JSON từ request
app.use(express.json());

// Lưu trữ dữ liệu cảm biến
let sensorData = {
  temperature: 0,
  gas: 0,
  smoke: 0,
  flame: 0
};

// Route để nhận dữ liệu từ ESP32
app.post('/update', (req, res) => {
  sensorData = {
    temperature: req.body.temperature,
    gas: req.body.gas,
    smoke: req.body.smoke,
    flame: req.body.flame
  };
  console.log('Received sensor data:', sensorData);
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