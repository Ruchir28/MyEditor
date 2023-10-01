export function formatTime() {
    const now = new Date();
  
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");
  
    return `[${hours}]-[${minutes}]-[${seconds}]-[${milliseconds}]`;
  }
  
  export function debug(msg: String) {
    console.log(`[DEBUG] [SERVER] ${formatTime()} + ${msg}`);
  }
