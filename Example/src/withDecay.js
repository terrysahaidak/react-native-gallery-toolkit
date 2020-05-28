export default function withDecay(toValue, userConfig, callback) {
  'worklet';

  if (!_WORKLET) {
    return toValue;
  }

  const config = Object.assign(
    {
      deceleration: 0.998,
    },
    userConfig,
  );

  const VELOCITY_EPS = 5;

  function decay(animation, now) {
    const {
      toValue,
      lastTimestamp,
      initialVelocity,
      current,
      velocity,
    } = animation;

    const deltaTime = Math.min(now - lastTimestamp, 64);
    animation.lastTimestamp = now;

    const kv = Math.pow(config.deceleration, deltaTime);
    const kx =
      (config.deceleration * (1 - kv)) / (1 - config.deceleration);

    const v0 = velocity / 1000;
    const v = v0 * kv * 1000;
    const x = current + v0 * kx;

    animation.current = x;
    animation.velocity = v;

    const toValueIsReached =
      initialVelocity > 0
        ? animation.current >= toValue
        : animation.current <= toValue;

    if (Math.abs(v) < VELOCITY_EPS || toValueIsReached) {
      if (toValueIsReached) {
        animation.current = toValue;
      }

      return true;
    }
  }

  function start(animation, value, now, previousAnimation) {
    animation.current = value;
    animation.lastTimestamp = now;
    animation.initialVelocity = config.velocity;
  }

  return {
    animation: decay,
    start,
    toValue,
    velocity: config.velocity || 0,
    current: toValue,
    callback,
  };
}
