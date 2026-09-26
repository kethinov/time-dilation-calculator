# Time dilation calculator

Calculate how much extra time passes on Earth if you fly a spaceship at relativistic speeds.

Use the calculator [here](https://kethinov.github.io/time-dilation-calculator/).

## Mission profiles

- **Constant velocity** — the spacecraft travels the whole way at a fixed fraction of light speed. Earth time is the shipboard time multiplied by the Lorentz factor, γ = 1/√(1−β²).
- **Constant acceleration, burning the whole way** — the spacecraft holds a steady thrust (measured in Earth gravities) for the entire trip and is still accelerating when it arrives.
- **Constant acceleration, flip and burn** — the spacecraft accelerates for the first half of the trip, flips over, and decelerates for the second half, arriving at rest.

Both acceleration profiles use the relativistic rocket equations, where `a` is the proper acceleration felt aboard and `τ` is the proper time elapsed aboard:

```
t = (c / a) · sinh(a·τ / c)
d = (c² / a) · (cosh(a·τ / c) − 1)
v = c · tanh(a·τ / c)
```

Time entered is always time as measured aboard the spacecraft. Distances are reported in the Earth frame; the constant-velocity mode also reports the length-contracted distance measured aboard the ship.
