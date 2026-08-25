const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
  { url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/5000_Cambodian_Riels_2015_-_Front.jpg', name: 'khr_5000.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/10_000_Cambodian_Riels_-_Front.jpg', name: 'khr_10000.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/20_000_Cambodian_Riels_-_Front.jpg', name: 'khr_20000.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/50_000_Cambodian_Riels_-_Front.jpg', name: 'khr_50000.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/100_000_Cambodian_Riels_-_Front.jpg', name: 'khr_100000.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/US_%245_Series_2006_obverse.jpg', name: 'usd_5.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/6/63/US_%2410_Series_2004A_obverse.jpg', name: 'usd_10.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/7/79/US_%2420_Series_2004_obverse.jpg', name: 'usd_20.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/6/62/US_%2450_Series_2004_obverse.jpg', name: 'usd_50.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Usdollar100front.jpg', name: 'usd_100.jpg' }
];

const dir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

images.forEach(({url, name}) => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
    if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
      let finalUrl = url;
      if (res.statusCode === 301 || res.statusCode === 302) finalUrl = res.headers.location;
      https.get(finalUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
          const file = fs.createWriteStream(path.join(dir, name));
          res2.pipe(file);
      });
    } else {
        console.error(`Failed to download ${name}: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`Error downloading ${name}:`, err.message);
  });
});
