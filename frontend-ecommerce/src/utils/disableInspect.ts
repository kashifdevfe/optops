/**
 * Aggressively disables browser inspect mode and developer tools
 * Stops app functionality when DevTools is detected (production only)
 * Note: This is not 100% secure - determined users can still bypass these restrictions
 */

export const disableInspect = () => {
  // Only enable aggressive blocking in production
  const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
  
  let devtoolsOpen = false;
  let appBlocked = false;

  // Function to block the app completely (only in production)
  const blockApp = () => {
    if (!isProduction) return; // Don't block in development
    if (appBlocked) return;
    appBlocked = true;
    
    // Stop all JavaScript execution and clear the page
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin: 0; padding: 0; width: 100vw; height: 100vh; background: #000; display: flex; align-items: center; justify-content: center; color: #fff; font-family: Arial, sans-serif; position: fixed; top: 0; left: 0; z-index: 999999;';
    document.body.innerHTML = '<div style="text-align: center;"><h1 style="font-size: 48px; margin-bottom: 20px;">Access Denied</h1><p style="font-size: 24px;">Developer tools are not allowed.</p><p style="font-size: 16px; margin-top: 20px; opacity: 0.7;">Please close developer tools and refresh the page.</p></div>';
    
    // Continuously check and block
    const _blockLoop = setInterval(() => {
      debugger; // This will pause execution if DevTools is open
      // Redirect after a delay if DevTools remains open
      setTimeout(() => {
        window.location.href = 'about:blank';
      }, 1000);
    }, 100);
    
    // Prevent any scripts from running
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      scripts[i].remove();
    }
  };

  // Disable right-click context menu (only in production)
  if (isProduction) {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);
  }

  // Disable all inspect-related keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Only block shortcuts in production
    if (isProduction) {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        blockApp();
        return false;
      }

      // Ctrl+Shift+I (Chrome DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        blockApp();
        return false;
      }

      // Ctrl+Shift+J (Chrome Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        blockApp();
        return false;
      }

      // Ctrl+Shift+C (Chrome Element Inspector)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        blockApp();
        return false;
      }

      // Ctrl+Shift+K (Firefox Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        blockApp();
        return false;
      }
    }

    // Ctrl+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    // Ctrl+S (Save Page)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+P (Print - can be used to view source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+Del (Clear browsing data)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'Delete' || e.keyCode === 46)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // Disable text selection, drag, copy, cut (only in production)
  if (isProduction) {
    document.addEventListener('selectstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);

    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);

    document.addEventListener('copy', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);

    document.addEventListener('cut', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);
  }

  // Clear console and override methods (only in production)
  if (isProduction) {
    const clearConsole = () => {
      if (typeof console !== 'undefined') {
        console.clear();
        console.log('%c', 'font-size: 0px;');
        console.log('%c ', 'font-size: 0px;');
      }
    };

    // Clear console every 100ms (less aggressive)
    setInterval(clearConsole, 100);

    // Override all console methods
    if (typeof console !== 'undefined') {
      const noop = () => {};
      console.log = noop;
      console.warn = noop;
      console.error = noop;
      console.info = noop;
      console.debug = noop;
      console.table = noop;
      console.trace = noop;
      console.dir = noop;
      console.dirxml = noop;
      console.group = noop;
      console.groupEnd = noop;
      console.time = noop;
      console.timeEnd = noop;
      console.count = noop;
      console.assert = noop;
      if ('profile' in console) (console as any).profile = noop;
      if ('profileEnd' in console) (console as any).profileEnd = noop;
      
      // Make console.log trigger blocking
      Object.defineProperty(console, 'log', {
        get: () => {
          blockApp();
          return noop;
        }
      });
    }
  }

  // Multiple DevTools detection methods (only in production)
  // Made less aggressive - only block when DevTools is actually opened, not on page load
  if (isProduction) {
    let detectionCount = 0;
    const REQUIRED_DETECTIONS = 3; // Require multiple detections before blocking
    
    const detectDevTools = () => {
      // Method 1: Window size difference (very lenient threshold)
      const threshold = 300; // Increased threshold to avoid false positives
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      if (heightDiff > threshold || widthDiff > threshold) {
        detectionCount++;
        if (detectionCount >= REQUIRED_DETECTIONS && !devtoolsOpen) {
          devtoolsOpen = true;
          blockApp();
        }
        return true;
      }

      // Method 2: Debugger detection (only check occasionally)
      const start = performance.now();
      debugger; // This will pause if DevTools is open
      const end = performance.now();
      if (end - start > 500) { // Increased threshold significantly
        detectionCount++;
        if (detectionCount >= REQUIRED_DETECTIONS && !devtoolsOpen) {
          devtoolsOpen = true;
          blockApp();
        }
        return true;
      }

      // Method 3: Console detection (less aggressive)
      let devtools = false;
      const element = new Image();
      Object.defineProperty(element, 'id', {
        get: () => {
          devtools = true;
        }
      });
      console.log('%c', element);
      
      if (devtools) {
        detectionCount++;
        if (detectionCount >= REQUIRED_DETECTIONS && !devtoolsOpen) {
          devtoolsOpen = true;
          blockApp();
        }
        return true;
      }

      // Reset counter if no detection
      if (detectionCount > 0) {
        detectionCount = Math.max(0, detectionCount - 1);
      }
      devtoolsOpen = false;
      return false;
    };

    // Disabled automatic detection to avoid false positives
    // Only block when keyboard shortcuts are used
    // setInterval(detectDevTools, 500);
    // window.addEventListener('resize', detectDevTools);
    
    // Disabled iframe detection to avoid false positives
    // const iframe = document.createElement('iframe');
    // iframe.style.display = 'none';
    // document.body.appendChild(iframe);
    // setInterval(() => {
    //   try {
    //     if (iframe.contentWindow && iframe.contentWindow.outerHeight !== iframe.contentWindow.innerHeight) {
    //       blockApp();
    //     }
    //   } catch (e) {
    //     blockApp();
    //   }
    // }, 1000);
  }

  // Prevent DevTools from being opened via menu (only in production)
  if (isProduction) {
    document.addEventListener('keydown', (e) => {
      // Alt key combinations
      if (e.altKey) {
        if (e.key === 'F4' || e.keyCode === 115) {
          e.preventDefault();
          e.stopPropagation();
          blockApp();
          return false;
        }
      }
    }, true);

    // Disable all mouse right-click variations (prevent but don't block app)
    (['mousedown', 'mouseup', 'contextmenu'] as const).forEach(event => {
      document.addEventListener(event, (e: Event) => {
        const mouseEvent = e as MouseEvent;
        if (mouseEvent.button === 2) {
          e.preventDefault();
          e.stopPropagation();
          // Don't block app on right-click, just prevent context menu
          return false;
        }
      }, true);
    });
  }
};


