// 此js为cloudflared workers使用，复制整个代码到新建的workers里，修改需要访问的链接部署
// 在设置---触发事件 里设置访问频率，例如2分钟，保存即可，可开启日志查看，检查是否运行

// Telegram配置(不需要可忽略)
const TG_ID = '你的TG_ID';         // 替换为你的Telegram用户ID
const TG_TOKEN = '<你的TG_TOKEN>'; // 替换为你的Telegram Bot的Token

// 24小时不间断访问的URL数组
const urls = [            
  'https://www.google.com',   
  'https://www.google.com',  
  'https://www.google.com',  
  'https://www.google.com',  
  'https://www.google.com'  
];

// 指定时间访问的URL数组
const websites = [
  'https://www.baidu.com', 
  'https://www.baidu.com'   
];

// 检查是否在暂停时间内 (1:00-5:00)
function isInPauseTime(hour) {
  return hour >= 1 && hour < 5;
}

// 发送消息到Telegram
async function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`;
  const body = JSON.stringify({
    chat_id: TG_ID,
    text: message,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!response.ok) {
      console.error(`Telegram推送失败: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Telegram推送出错: ${error.message}`);
  }
}

async function visitUrl(url) {
  try {
    const response = await fetch(url);
    console.log(`${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Hong_Kong' })} 访问成功: ${url}`);
    return response.status;
  } catch (error) {
    const errorMessage = `访问出错: ${url}\n错误信息: ${error.message}`;
    console.error(errorMessage);

    // 推送到Telegram
    await sendToTelegram(errorMessage);

    return 500;
  }
}

async function handleScheduled() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }));
  const hour = now.getHours();

  // 24小时访问
  await Promise.all(urls.map(url => visitUrl(url)));

  // 检查是否在暂停时间
  if (!isInPauseTime(hour)) {
    await Promise.all(websites.map(url => visitUrl(url)));
  } else {
    console.log(`当前处于暂停时间 1:00-5:00 --- ${now.toLocaleString()}`);
  }
}

// 处理HTTP请求
async function handleRequest() {
  return new Response("Worker is running!", {
    headers: { 'content-type': 'text/plain' },
  });
}

// 监听请求
addEventListener('fetch', event => {
  event.respondWith(handleRequest());
});

// 监听定时任务
addEventListener('scheduled', event => {
  event.waitUntil(handleScheduled());
});
