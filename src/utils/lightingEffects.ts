import { LightingEffect, AmbientLight, _SunLight as SunLight } from '@deck.gl/core';
import { DEFAULT_SUNLIGHT_TIME } from './constants';


const sky = new AmbientLight({
    color: [193, 218, 224],
    intensity: 2

});

const sun = new SunLight({
    timestamp: DEFAULT_SUNLIGHT_TIME,
    color: [224, 187, 135],
    intensity: 2.2,
    _shadow: true
});

const lightingEffect = new LightingEffect({ sky, sun });
lightingEffect.shadowColor = [0, 0, 0, 250 / 255];

export function generateLighting(date: Date) {
    const timestamp = date.getTime();
    sun.timestamp = timestamp;

    return new LightingEffect({
        sky,
        sun
    });
}

export { lightingEffect, sun };
