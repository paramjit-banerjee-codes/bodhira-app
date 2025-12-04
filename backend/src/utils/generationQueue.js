/**
 * Simple in-memory queue for test generation
 * Processes tasks sequentially to avoid concurrent LLM calls
 */

class GenerationQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.currentTask = null;
  }

  enqueue(task) {
    return new Promise((resolve, reject) => {
      if (typeof task !== 'function') {
        console.error('❌ Queue error: task is not a function');
        reject(new Error('Task must be a function'));
        return;
      }

      this.queue.push({
        task,
        resolve,
        reject,
        addedAt: Date.now(),
      });
      
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const item = this.queue.shift();
    this.currentTask = item;

    try {
      const result = await item.task();
      item.resolve(result);
    } catch (error) {
      console.error(`❌ Queue task failed: ${error.message}`);
      item.reject(error);
    } finally {
      this.processing = false;
      this.currentTask = null;
      if (this.queue.length > 0) {
        this.process();
      }
    }
  }

  getSize() {
    return this.queue.length;
  }

  isProcessing() {
    return this.processing;
  }
}

export default new GenerationQueue();
