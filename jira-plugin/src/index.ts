const fs = require('fs');
const path = require('path');

interface WebTriggerEvent {
  path: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

exports.handler = async (event: WebTriggerEvent) => {
  const baseDir = path.join(__dirname, 'static');
  
  let filename = 'index.html';
  
  if (event.path && event.path.includes('/ui/')) {
    const parts = event.path.split('/ui/');
    if (parts[1]) {
      filename = parts[1] || 'index.html';
    }
  }
  
  if (filename.includes('..') || filename.includes(':') || filename.includes('/')) {
    return { status: 400, body: 'Invalid path' };
  }
  
  const filePath = path.join(baseDir, filename);
  
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath);
      const ext = path.extname(filename).toLowerCase();
      
      const contentTypes: Record<string, string> = {
        '.html': 'text/html',
        '.js': 'application/javascript', 
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
      };
      
      return {
        status: 200,
        headers: {
          'Content-Type': contentTypes[ext] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=3600'
        },
        body: content.toString('base64')
      };
    }
    return { status: 404, body: 'File not found' };
  } catch (error) {
    return { status: 500, body: `Error: ${error instanceof Error ? error.message : 'Unknown'}` };
  }
};
