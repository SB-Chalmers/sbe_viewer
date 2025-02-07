import { LightingEffect, AmbientLight, _SunLight as SunLight } from '@deck.gl/core';
import { DEFAULT_SUNLIGHT_TIME } from './constants';



const sky = new AmbientLight({
    color: [200, 206, 235], // Slightly deeper blue for realistic sky reflection
    intensity: 2.2 // Stronger ambient light presence
});

const sun = new SunLight({
    timestamp: DEFAULT_SUNLIGHT_TIME, // Set default timestamp to March 14:00
    color: [255, 215, 130], // Warmer and more saturated yellow sunlight
    intensity: 2.6, // Slightly stronger for a glowing effect
    _shadow: true
    
});

const lightingEffect = new LightingEffect({ sky, sun });
lightingEffect.shadowColor = [0, 0, 0, 0.5] ;

export function generateLighting(date: Date) {
    const timestamp = date.getTime();
    
    sun.timestamp = timestamp;

    // Create new effect with new sun instance
    return new LightingEffect({
        sky,
        sun
    });
    
}

export { lightingEffect, sun };
