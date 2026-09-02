/**
 * Where the camera currently is along the intro path, in seconds. Written by CameraRig every
 * frame and read by the scroll input when it takes over from auto-play. Deliberately not
 * React state: it changes every frame and nothing needs to re-render on it.
 */
export const flight = { time: 0 }
