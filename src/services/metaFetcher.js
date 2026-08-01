/**
 * Utility to extract domain, favicon, and clean metadata for a given URL
 */
export async function fetchUrlMetadata(inputUrl) {
  let formattedUrl = inputUrl.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }

  try {
    const parsedUrl = new URL(formattedUrl);
    const domain = parsedUrl.hostname;

    // Use Google Favicon Service for reliable favicon extraction
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    // Format fallback title based on domain and path
    let autoTitle = domain.replace(/^www\./, '');
    if (parsedUrl.pathname && parsedUrl.pathname !== '/') {
      const cleanPath = parsedUrl.pathname.split('/').filter(Boolean).pop();
      if (cleanPath) {
        autoTitle += ` - ${decodeURIComponent(cleanPath).replace(/[-_]/g, ' ')}`;
      }
    }

    // Capitalize title
    autoTitle = autoTitle.charAt(0).toUpperCase() + autoTitle.slice(1);

    return {
      url: formattedUrl,
      domain: domain,
      title: autoTitle,
      favicon: faviconUrl,
      description: `網址連結：${domain}`
    };
  } catch (err) {
    console.error("Invalid URL format:", err);
    return {
      url: formattedUrl,
      domain: 'unknown',
      title: formattedUrl,
      favicon: '',
      description: ''
    };
  }
}
