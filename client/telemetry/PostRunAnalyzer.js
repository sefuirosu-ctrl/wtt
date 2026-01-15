// client/telemetry/PostRunAnalyzer.js

/**
 * PostRunAnalyzer
 *
 * RESPONSIBILITY:
 * - Analyze telemetry data
 * - Produce human-readable insights
 *
 * Canon:
 * - Stage 6.1.C — QA & balance support
 */

export class PostRunAnalyzer {

    analyze(summary) {
        const insights = [];

        if (summary.maxPressure > 0.85) {
            insights.push('High pressure reached — difficulty spike detected.');
        }

        if (summary.actsReached < 3) {
            insights.push('Early defeat — onboarding or early pressure may be too harsh.');
        }

        if (summary.combosTriggered === 0) {
            insights.push('No combos — player may struggle with flow or timing.');
        }

        return insights;
    }
}
