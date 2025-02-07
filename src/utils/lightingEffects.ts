import { LightingEffect, AmbientLight, _SunLight as SunLight } from '@deck.gl/core';
import { DEFAULT_SUNLIGHT_TIME } from './constants';

const sky = new AmbientLight({
    color: [200, 206, 235],
    intensity: 2.2
});

const sun = new SunLight({
    timestamp: DEFAULT_SUNLIGHT_TIME,
    color: [255, 215, 130],
    intensity: 2.6,
    _shadow: true
});

const lightingEffect = new LightingEffect({ sky, sun });
lightingEffect.shadowColor = [0, 0, 0, 0.5];

export function generateLighting(date: Date) {
    const timestamp = date.getTime();
    sun.timestamp = timestamp;

    return new LightingEffect({
        sky,
        sun
    });
}

export { lightingEffect, sun };
