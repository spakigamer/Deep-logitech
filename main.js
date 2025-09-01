const http = require("http");

async function fetchHTML(url) {

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  
  return response.text();
}

function getStories(html) {
  const stories = [];
  const regex = /<h3.*?<a.*?href="([^"]+)".*?>.*?<span>(.*?)<\/span>.*?<\/h3>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const link = match[1];
    const title = match[2].trim();

    if (title && link && !stories.some(story => story.link === link)) {
      stories.push({ title, link });
    }

    if (stories.length >= 6) {
      break;
    }
  }
  return stories;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/getTimeStories') {
    try {
      const html = await fetchHTML("https://time.com");
      const stories = getStories(html);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stories, null, 2));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to retrieve stories.' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Endpoint not found. Please use /getTimeStories');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Call API: http://localhost:${PORT}/getTimeStories`);
});