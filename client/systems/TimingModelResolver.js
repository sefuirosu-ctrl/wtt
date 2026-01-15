import timingModels from '../../data/timing/timing_model.json';

export function resolveTimingModel(difficultyLevel) {
    // Difficulty 1–3 → classic
    if (difficultyLevel >= 1 && difficultyLevel <= 3) {
        return timingModels.classic;
    }

    // Difficulty 4 → hardcore
    if (difficultyLevel === 4) {
        return timingModels.hardcore;
    }

    // Fallback (safety)
    return timingModels.classic;
}