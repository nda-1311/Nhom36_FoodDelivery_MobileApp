/**
 * Event Emitter for Cart Changes
 *
 * React Native doesn't have window.dispatchEvent, so we create a custom emitter
 */

type EventCallback = () => void;

class CartEventEmitter {
  private listeners: EventCallback[] = [];

  subscribe(callback: EventCallback): () => void {
    console.log(
      "📝 Subscribed to cart events. Total listeners:",
      this.listeners.length + 1
    );
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
      console.log(
        "🗑️ Unsubscribed from cart events. Remaining listeners:",
        this.listeners.length
      );
    };
  }

  emit() {
    console.log(
      "📢 Emitting cart change event to",
      this.listeners.length,
      "listeners"
    );
    this.listeners.forEach((callback, index) => {
      try {
        console.log(`🔔 Calling listener #${index + 1}`);
        callback();
      } catch (error) {
        console.error("Error in cart event listener:", error);
      }
    });
  }

  clear() {
    this.listeners = [];
  }
}

export const cartEvents = new CartEventEmitter();
