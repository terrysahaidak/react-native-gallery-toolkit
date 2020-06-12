type IUserConfig = {
  deceleration?: number;
  velocity: number;
  clamp?: [number, number];
};

type IAnimation = {
  current: number;
  lastTimestamp: number;
  initialVelocity: number;
  velocity: number;
};

export default function withDecay(
  userConfig: IUserConfig,
  callback?: () => void,
): number {
  'worklet';

  // TODO: not sure what should I return here
  // if (!_WORKLET) {
  //   return toValue;
  // }

  const config: IUserConfig = {
    deceleration: 0.998,
    velocity: userConfig.velocity,
  };

  if (userConfig.clamp) {
    config.clamp = userConfig.clamp;
  }

  const VELOCITY_EPS = 5;

  function decay(animation: IAnimation, now: number) {
    const {
      lastTimestamp,
      initialVelocity,
      current,
      velocity,
    } = animation;

    const deltaTime = Math.min(now - lastTimestamp, 64);
    animation.lastTimestamp = now;

    const kv = Math.pow(config.deceleration!, deltaTime);
    const kx =
      (config.deceleration! * (1 - kv)) / (1 - config.deceleration!);

    const v0 = velocity / 1000;
    const v = v0 * kv * 1000;
    const x = current + v0 * kx;

    animation.current = x;
    animation.velocity = v;

    let toValueIsReached = null;

    if (Array.isArray(config.clamp)) {
      if (
        initialVelocity < 0 &&
        animation.current <= config.clamp[0]
      ) {
        toValueIsReached = config.clamp[0];
      } else if (
        initialVelocity > 0 &&
        animation.current >= config.clamp[1]
      ) {
        toValueIsReached = config.clamp[1];
      }
    }

    if (Math.abs(v) < VELOCITY_EPS || toValueIsReached !== null) {
      if (toValueIsReached !== null) {
        animation.current = toValueIsReached;
      }

      return true;
    }

    return false;
  }

  function start(animation: IAnimation, value: number, now: number) {
    animation.current = value;
    animation.lastTimestamp = now;
    animation.initialVelocity = config.velocity;
  }

  const animationObj: unknown = {
    animation: decay,
    start,
    velocity: config.velocity || 0,
    callback,
  };

  return animationObj as number;
}
