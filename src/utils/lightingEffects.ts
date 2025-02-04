import { LightingEffect, AmbientLight, _SunLight as SunLight } from '@deck.gl/core';

const ambientLight = new AmbientLight({
    color: [160, 190, 255], // Slightly deeper blue for realistic sky reflection
    intensity: 2.2 // Stronger ambient light presence
});

const dirLight = new SunLight({
    timestamp: Date.UTC(2019, 2, 1, 14), // Set default timestamp to March 14:00
    color: [255, 215, 130], // Warmer and more saturated yellow sunlight
    intensity: 2.5, // Slightly stronger for a glowing effect
    _shadow: true
});

const lightingEffect = new LightingEffect({ ambientLight, dirLight });
lightingEffect.shadowColor = [0, 0, 0, 0.3]; // Softer and slightly lighter shadows

export function generateLighting(date: Date) {
    const hours = date.getUTCHours();
    const isDaytime = hours >= 6 && hours <= 18;

    const sunlightColor: [number, number, number] = isDaytime
        ? [255, 215, 130] // Daytime sunlight: Warm yellow
        : [150, 150, 200]; // Nighttime: Cooler blue tones

    const sunlightIntensity = isDaytime ? 2.8 : 0.5;

    dirLight.timestamp = date.getTime();
    dirLight.color = sunlightColor;
    dirLight.intensity = sunlightIntensity;

    return new LightingEffect({
        ambientLight,
        dirLight
    });
}

export { lightingEffect, dirLight };
