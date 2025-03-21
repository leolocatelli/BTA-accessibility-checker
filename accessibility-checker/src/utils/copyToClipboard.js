export async function copyToClipboard(text) {
    if (!navigator.clipboard) {
      alert("Clipboard API not available. Please copy manually.");
      return;
    }
  
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("❌ Failed to copy:", error);
      alert("Failed to copy. Please try manually.");
    }
  }
  