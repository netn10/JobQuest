// Force all text to be white in dark mode
function forceWhiteTextEverywhere() {
  // Check if we're in dark mode
  if (!document.documentElement.classList.contains('dark')) {
    return;
  }
  
  console.log('Forcing white text in dark mode...');
  
  // Get ALL elements on the page
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    // Skip SVG elements
    if (element.tagName && element.tagName.toLowerCase().includes('svg')) {
      return;
    }
    if (element.tagName && ['path', 'circle', 'rect', 'line', 'polygon', 'polyline', 'ellipse', 'g', 'defs', 'clipPath', 'mask'].includes(element.tagName.toLowerCase())) {
      return;
    }
    
    // Force white text
    if (element.style) {
      element.style.setProperty('color', 'white', 'important');
    }
  });
  
  // Also add a global CSS rule
  const style = document.createElement('style');
  style.textContent = `
    html.dark * {
      color: white !important;
    }
    .dark * {
      color: white !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log('White text forced on', allElements.length, 'elements');
}

// Run immediately
forceWhiteTextEverywhere();

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', forceWhiteTextEverywhere);
} else {
  forceWhiteTextEverywhere();
}

// Run when page is fully loaded
window.addEventListener('load', forceWhiteTextEverywhere);

// Watch for changes
const observer = new MutationObserver(() => {
  setTimeout(forceWhiteTextEverywhere, 100);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class']
});

// Also run every 2 seconds as a failsafe
setInterval(forceWhiteTextEverywhere, 2000);