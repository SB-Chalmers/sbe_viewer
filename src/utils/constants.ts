import { DateTime } from 'luxon';

// Summer solstice 2025 at noon
export const DEFAULT_SUNLIGHT_TIME = DateTime.fromObject({ 
    year: 2025,
    month: 6,
    day: 21,
    hour: 19,
    minute: 0
}, { zone: 'Europe/Stockholm' }).toMillis();

export{}