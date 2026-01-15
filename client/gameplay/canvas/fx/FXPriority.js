class FXPriority {
  static CRITICAL = 1000;
  static HIGH = 750;
  static MEDIUM = 500;
  static LOW = 250;
  static BACKGROUND = 100;

  static clamp(v) {
    if (v < FXPriority.BACKGROUND) return FXPriority.BACKGROUND;
    if (v > FXPriority.CRITICAL) return FXPriority.CRITICAL;
    return v;
  }
}

export { FXPriority };
export default FXPriority;
