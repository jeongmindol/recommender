const express = require('express');
const cors = require('cors');
const path = require('path');
const spawn = require('child_process').spawn;
require('dotenv').config();

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

const pythonExepath = isDevelopment()
  ? path.join('C:', 'conda', 'envs', 'recom_env', 'python.exe')
  : path.join('/home/ubuntu/miniconda', 'envs', 'myenv', 'bin', 'python3');

app.get('/', (req, res) => {
  res.send('Hello from Node server!!');
});

app.get('/random/:count', (req, res) => {
  const scriptPath = path.join(__dirname, 'resolver.py');

  const count = req.params.count;

  // C:\conda\envs\recom_env

  const result = spawn(pythonExepath, [scriptPath, 'random', count]);

  let responseData = '';

  result.stdout.on('data', function (data) {
    responseData += data.toString();
  });

  result.on('close', (code) => {
    if (code === 0) {
      const jsonResponse = JSON.parse(responseData);
      res.status(200).json(jsonResponse);
    } else {
      res.status(500).json({ error: `child process exited with code ${code}` });
    }
  });

  result.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
});

app.get('/latest/:count', (req, res) => {
  const scriptPath = path.join(__dirname, 'resolver.py');

  const count = req.params.count;

  const result = spawn(pythonExepath, [scriptPath, 'latest', count]);

  let responseData = '';

  result.stdout.on('data', function (data) {
    responseData += data.toString();
  });

  result.on('close', (code) => {
    if (code === 0) {
      const jsonResponse = JSON.parse(responseData);
      res.status(200).json(jsonResponse);
    } else {
      res.status(500).json({ error: `child process exited with code ${code}` });
    }
  });

  result.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
});

app.get('/genres/:genre/:count', (req, res) => {
  const scriptPath = path.join(__dirname, 'resolver.py');

  const genre = req.params.genre;
  const count = req.params.count;
  const result = spawn(pythonExepath, [scriptPath, 'genres', genre, count]);

  let responseData = '';

  result.stdout.on('data', function (data) {
    responseData += data.toString();
  });

  result.on('close', (code) => {
    if (code === 0) {
      const jsonResponse = JSON.parse(responseData);
      res.status(200).json(jsonResponse);
    } else {
      res.status(500).json({ error: `child process exited with code ${code}` });
    }
  });

  result.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
});

app.get('/item-based/:item', (req, res) => {
  const scriptPath = path.join(__dirname, 'recommender.py');

  const item = req.params.item;

  const result = spawn(pythonExepath, [scriptPath, 'item-based', item]);

  let responseData = '';

  result.stdout.on('data', function (data) {
    responseData += data.toString();
  });

  result.on('close', (code) => {
    if (code === 0) {
      const jsonResponse = JSON.parse(responseData);
      res.status(200).json(jsonResponse);
    } else {
      res.status(500).json({ error: `child process exited with code ${code}` });
    }
  });

  result.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
});

app.post('/user-based', (req, res) => {
  const scriptPath = path.join(__dirname, 'recommender.py');

  const inputRatingDict = req.body;

  const result = spawn(pythonExepath, [scriptPath, 'user-based']);

  let responseData = '';

  // 파이썬 스크립트로 JSON 데이터를 전달
  result.stdin.write(JSON.stringify(inputRatingDict));
  result.stdin.end(); // 더 이상 데이터가 없으면 전달 끝

  result.stdout.on('data', function (data) {
    responseData += data.toString();
  });

  result.on('close', (code) => {
    if (code === 0) {
      const jsonResponse = JSON.parse(responseData);
      res.status(200).json(jsonResponse);
    } else {
      res.status(500).json({ error: `child process exited with code ${code}` });
    }
  });

  result.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
