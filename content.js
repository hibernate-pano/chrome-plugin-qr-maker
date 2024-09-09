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
  return favicon ? favicon.href : 'https://www.google.com/s2/favicons?domain=' + window.location.hostname;
}

// 显示二维码
function showQRCode() {
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
    </div>
  `;
  document.body.appendChild(qrContainer);

  qrContainer.addEventListener('click', (e) => {
    if (e.target === qrContainer) {
      qrContainer.remove();
    }
  });
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

createLogoIcon();