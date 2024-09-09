// 确保 html2canvas 已加载
if (typeof html2canvas === 'undefined') {
  console.error('html2canvas is not loaded');
}

// 创建logo图标
function createLogoIcon() {
  const icon = document.createElement('div');
  icon.id = 'qr-icon';
  icon.style.backgroundImage = `url(${getFavicon()})`;
  document.body.appendChild(icon);
  icon.addEventListener('click', showQRCode);
}

// 获取网站favicon
function getFavicon() {
  const favicon = document.querySelector('link[rel*="icon"]');
  if (favicon && favicon.href) {
    return favicon.href;
  }
  // 使用 Google 的 favicon 服务作为备选，这个 URL 应该是允许跨域的
  return `https://www.google.com/s2/favicons?domain=${window.location.hostname}&sz=64`;
}

// 显示二维码
async function showQRCode() {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(window.location.href)}`;
  const siteName = getSiteName();
  const pageTitle = getPageTitle();

  const qrContainer = document.createElement('div');
  qrContainer.id = 'qr-container';
  qrContainer.innerHTML = `
    <div id="qr-content">
      <div id="qr-header">
        <img src="${getFavicon()}" alt="Site Icon" class="site-icon">
        <div class="site-info">
          <p class="site-name">${siteName}</p>
          <p class="page-title">${pageTitle}</p>
        </div>
      </div>
      <img src="${qrUrl}" alt="QR Code" width="256" height="256" class="qr-code">
      <p class="qr-instruction">扫描二维码以访问此页面</p>
      <div class="qr-actions">
        <button id="copy-card-btn">复制卡片</button>
        <button id="download-card-btn">下载卡片</button>
      </div>
    </div>
  `;
  document.body.appendChild(qrContainer);

  qrContainer.addEventListener('click', (e) => {
    if (e.target === qrContainer) {
      qrContainer.remove();
    }
  });

  // 等待图片加载完成
  const qrImage = qrContainer.querySelector('.qr-code');
  const siteIcon = qrContainer.querySelector('.site-icon');
  await Promise.all([
    new Promise(resolve => qrImage.complete ? resolve() : qrImage.onload = resolve),
    new Promise(resolve => siteIcon.complete ? resolve() : siteIcon.onload = resolve)
  ]);

  // 复制卡片
  document.getElementById('copy-card-btn').addEventListener('click', () => copyCard(qrContainer));

  // 下载卡片
  document.getElementById('download-card-btn').addEventListener('click', () => downloadCard(qrContainer));
}

// 使用 Canvas API 创建图片
async function createCardImage(element) {
  const content = element.querySelector('#qr-content');
  const header = content.querySelector('#qr-header');
  const qrCode = content.querySelector('.qr-code');
  const siteIcon = header.querySelector('.site-icon');
  const siteName = header.querySelector('.site-name').textContent;
  const pageTitle = header.querySelector('.page-title').textContent;

  // 创建新的图像对象并设置 crossOrigin
  const qrCodeImg = new Image();
  qrCodeImg.crossOrigin = 'anonymous';
  qrCodeImg.src = qrCode.src;

  const siteIconImg = new Image();
  siteIconImg.crossOrigin = 'anonymous';
  siteIconImg.src = siteIcon.src;

  // 等待图片加载完成
  await Promise.all([
    new Promise(resolve => qrCodeImg.complete ? resolve() : qrCodeImg.onload = resolve),
    new Promise(resolve => siteIconImg.complete ? resolve() : siteIconImg.onload = resolve)
  ]);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 340;
  canvas.height = 400;

  // 绘制背景
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制网站图标
  ctx.drawImage(siteIconImg, 20, 20, 40, 40);

  // 绘制网站名称和页面标题
  ctx.fillStyle = 'black';
  ctx.font = 'bold 18px Arial';
  ctx.fillText(siteName, 70, 35);
  ctx.font = '14px Arial';
  ctx.fillText(pageTitle, 70, 55);

  // 绘制二维码
  ctx.drawImage(qrCodeImg, 42, 80, 256, 256);

  return canvas;
}

// 复制卡片为图片
async function copyCard(element) {
  const canvas = await createCardImage(element);
  canvas.toBlob(blob => {
    if (navigator.clipboard && navigator.clipboard.write) {
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).then(() => {
        alert('卡片已复制到剪贴板');
      }).catch(err => {
        console.error('复制失败: ', err);
        fallbackCopy(canvas);
      });
    } else {
      fallbackCopy(canvas);
    }
  });
}

// 下载卡片为图片
async function downloadCard(element) {
  const canvas = await createCardImage(element);
  const link = document.createElement('a');
  link.download = 'qr-card.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// 获取网站名称
function getSiteName() {
  let siteName = document.domain;
  // 移除 www. 前缀和顶级域名
  siteName = siteName.replace(/^www\./i, '').split('.')[0];
  // 首字母大写
  return siteName.charAt(0).toUpperCase() + siteName.slice(1);
}

// 获取页面标题
function getPageTitle() {
  let pageTitle = document.title;
  // 如果标题太长，截断并添加省略号
  if (pageTitle.length > 15) {
    pageTitle = pageTitle.substring(0, 15) + '...';
  }
  return pageTitle;
}

// 初始化
function init() {
  createLogoIcon();
}

init();

// 添加这个回退函数
function fallbackCopy(canvas) {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    const div = document.createElement('div');
    div.contentEditable = true;
    div.appendChild(img);
    document.body.appendChild(div);
    const range = document.createRange();
    range.selectNodeContents(div);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    document.body.removeChild(div);
    URL.revokeObjectURL(url);
    alert('卡片已复制到剪贴板（如果没有成功，请尝试手动复制）');
  });
}