/**
 * Microphone Permission Utility
 * 
 * Handles microphone access with proper error detection and user guidance
 * Works for both HTTP and HTTPS environments with appropriate fallbacks
 */

export interface MicrophonePermissionStatus {
  isHTTPS: boolean;
  isLocalhost: boolean;
  isSecureContext: boolean;
  getUserMediaSupported: boolean;
  speechRecognitionSupported: boolean;
  error?: string;
  errorType?: 'not-allowed' | 'not-supported' | 'not-secure' | 'unknown';
  userGuidance?: string;
}

/**
 * Check if the current context is secure (HTTPS or localhost)
 */
export function isSecureContext(): boolean {
  return window.isSecureContext || 
         location.protocol === 'https:' || 
         location.hostname === 'localhost' || 
         location.hostname === '127.0.0.1' ||
         location.hostname.endsWith('.localhost');
}

/**
 * Get comprehensive microphone permission status
 */
export function getMicrophonePermissionStatus(): MicrophonePermissionStatus {
  const isHTTPS = location.protocol === 'https:';
  const isLocalhost = location.hostname === 'localhost' || 
                      location.hostname === '127.0.0.1' ||
                      location.hostname.endsWith('.localhost');
  const isSecure = isSecureContext();
  
  const getUserMediaSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const speechRecognitionSupported = !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
  
  let error: string | undefined;
  let errorType: MicrophonePermissionStatus['errorType'];
  let userGuidance: string | undefined;
  
  // Check for secure context requirement
  if (!isSecure && !isLocalhost) {
    error = 'Microphone access requires a secure connection (HTTPS).';
    errorType = 'not-secure';
    userGuidance = `
      <div style="padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 16px 0;">
        <strong>🔒 Secure Connection Required</strong>
        <p style="margin: 8px 0;">Your browser requires HTTPS (secure connection) to access the microphone.</p>
        <p style="margin: 8px 0;"><strong>Options:</strong></p>
        <ul style="margin: 8px 0; padding-left: 20px;">
          <li>Visit the site using <strong>https://</strong> instead of http://</li>
          <li>Contact your administrator to enable HTTPS for this site</li>
          <li>On mobile devices, some browsers may work with special permissions</li>
        </ul>
        <p style="margin: 8px 0; font-size: 12px; color: #666;">
          <strong>Current URL:</strong> ${location.protocol}//${location.host}
        </p>
      </div>
    `;
  }
  
  // Check for API support
  if (!getUserMediaSupported && !speechRecognitionSupported) {
    error = 'Your browser does not support microphone access.';
    errorType = 'not-supported';
    userGuidance = `
      <div style="padding: 16px; background: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px; margin: 16px 0;">
        <strong>❌ Browser Not Supported</strong>
        <p style="margin: 8px 0;">Your browser does not support microphone access.</p>
        <p style="margin: 8px 0;"><strong>Please try:</strong></p>
        <ul style="margin: 8px 0; padding-left: 20px;">
          <li>Chrome, Edge, or Safari (latest versions)</li>
          <li>Firefox (may have limited support)</li>
          <li>Update your browser to the latest version</li>
        </ul>
      </div>
    `;
  }
  
  return {
    isHTTPS,
    isLocalhost,
    isSecureContext: isSecure,
    getUserMediaSupported,
    speechRecognitionSupported,
    error,
    errorType,
    userGuidance
  };
}

/**
 * Request microphone permission with enhanced error handling
 */
export async function requestMicrophonePermission(constraints: MediaStreamConstraints = { audio: true }): Promise<{
  success: boolean;
  stream?: MediaStream;
  error?: string;
  errorType?: MicrophonePermissionStatus['errorType'];
  userGuidance?: string;
}> {
  // Check permission status first
  const status = getMicrophonePermissionStatus();
  
  if (status.error) {
    return {
      success: false,
      error: status.error,
      errorType: status.errorType,
      userGuidance: status.userGuidance
    };
  }
  
  // Check if getUserMedia is supported
  if (!status.getUserMediaSupported) {
    return {
      success: false,
      error: 'Microphone access is not supported in your browser.',
      errorType: 'not-supported',
      userGuidance: status.userGuidance
    };
  }
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return {
      success: true,
      stream
    };
  } catch (err: any) {
    console.error('Microphone permission error:', err);
    
    let errorMessage = 'Failed to access microphone.';
    let errorType: MicrophonePermissionStatus['errorType'] = 'unknown';
    let userGuidance: string | undefined;
    
    // Handle different error types
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      errorMessage = 'Microphone access was denied.';
      errorType = 'not-allowed';
      userGuidance = `
        <div style="padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 16px 0;">
          <strong>🎤 Microphone Permission Denied</strong>
          <p style="margin: 8px 0;">Please allow microphone access in your browser settings.</p>
          <p style="margin: 8px 0;"><strong>How to enable:</strong></p>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li><strong>Desktop:</strong> Click the lock icon in the address bar → Site settings → Allow microphone</li>
            <li><strong>Chrome Mobile:</strong> Settings → Site Settings → Microphone → Allow</li>
            <li><strong>Safari iOS:</strong> Settings → Safari → Camera & Microphone → Allow</li>
            <li><strong>Firefox:</strong> Click the lock icon → Permissions → Allow microphone</li>
          </ul>
          <p style="margin: 8px 0; font-size: 12px;">
            After enabling, refresh the page and try again.
          </p>
        </div>
      `;
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      errorMessage = 'No microphone found. Please connect a microphone.';
      errorType = 'not-supported';
      userGuidance = `
        <div style="padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 16px 0;">
          <strong>🎤 No Microphone Found</strong>
          <p style="margin: 8px 0;">Please connect a microphone to your device and try again.</p>
        </div>
      `;
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      errorMessage = 'Microphone is being used by another application.';
      errorType = 'not-allowed';
      userGuidance = `
        <div style="padding: 16px; background: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px; margin: 16px 0;">
          <strong>🎤 Microphone in Use</strong>
          <p style="margin: 8px 0;">Your microphone is currently being used by another application.</p>
          <p style="margin: 8px 0;">Please close other apps using the microphone and try again.</p>
        </div>
      `;
    } else if (!status.isSecureContext && !status.isLocalhost) {
      errorMessage = 'Microphone access requires HTTPS (secure connection).';
      errorType = 'not-secure';
      userGuidance = status.userGuidance;
    } else {
      errorMessage = err.message || 'Unknown error accessing microphone.';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorType,
      userGuidance
    };
  }
}

/**
 * Check Speech Recognition support with error handling
 */
export function checkSpeechRecognitionSupport(): {
  supported: boolean;
  error?: string;
  errorType?: MicrophonePermissionStatus['errorType'];
  userGuidance?: string;
} {
  const status = getMicrophonePermissionStatus();
  
  if (!status.speechRecognitionSupported) {
    return {
      supported: false,
      error: 'Speech recognition is not supported in your browser.',
      errorType: 'not-supported',
      userGuidance: `
        <div style="padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 16px 0;">
          <strong>🎤 Speech Recognition Not Supported</strong>
          <p style="margin: 8px 0;">Your browser does not support speech recognition.</p>
          <p style="margin: 8px 0;"><strong>Supported browsers:</strong></p>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>Chrome/Edge (desktop & mobile)</li>
            <li>Safari (iOS 14.5+, macOS)</li>
            <li>Firefox (limited support)</li>
          </ul>
        </div>
      `
    };
  }
  
  if (!status.isSecureContext && !status.isLocalhost) {
    return {
      supported: false,
      error: 'Speech recognition requires HTTPS (secure connection).',
      errorType: 'not-secure',
      userGuidance: status.userGuidance
    };
  }
  
  return {
    supported: true
  };
}

/**
 * Get Safari-specific guidance
 */
export function getSafariGuidance(): string {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMacSafari = /Macintosh/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  
  if (isIOS) {
    return `
      <div style="padding: 16px; background: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 16px 0;">
        <strong>📱 Safari iOS Instructions</strong>
        <p style="margin: 8px 0;">To enable microphone access on Safari (iOS):</p>
        <ol style="margin: 8px 0; padding-left: 20px;">
          <li>Go to <strong>Settings</strong> on your iPhone/iPad</li>
          <li>Scroll down and tap <strong>Safari</strong></li>
          <li>Find <strong>Camera & Microphone</strong> section</li>
          <li>Enable microphone access</li>
          <li>Return to Safari and refresh this page</li>
        </ol>
        <p style="margin: 8px 0; font-size: 12px; color: #666;">
          <strong>Note:</strong> You may also need to allow microphone access when prompted by Safari.
        </p>
      </div>
    `;
  } else if (isMacSafari) {
    return `
      <div style="padding: 16px; background: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 16px 0;">
        <strong>🖥️ Safari macOS Instructions</strong>
        <p style="margin: 8px 0;">To enable microphone access on Safari (macOS):</p>
        <ol style="margin: 8px 0; padding-left: 20px;">
          <li>Click <strong>Safari</strong> in the menu bar</li>
          <li>Select <strong>Settings</strong> (or Preferences)</li>
          <li>Go to <strong>Websites</strong> tab</li>
          <li>Select <strong>Microphone</strong> from the left sidebar</li>
          <li>Set this website to <strong>Allow</strong></li>
        </ol>
      </div>
    `;
  }
  
  return '';
}

