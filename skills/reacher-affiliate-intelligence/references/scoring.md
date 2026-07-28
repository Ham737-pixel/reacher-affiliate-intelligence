# Health score

Use this model only for the Affiliate Program Health report. Keep the underlying numbers visible so a reader can understand every score.

## Periods

- Build seven consecutive, non-overlapping 30-day periods.
- The selected period is the current period.
- Compare each current number with the mean of the three immediately preceding periods.
- Show four score snapshots when enough history is available.
- Do not mix partial and complete periods without saying so.

## Parts and weights

| Part | Internal key | Weight | Inputs |
| --- | --- | ---: | --- |
| Finding creators | `acquisition` | 20% | Active creators; first-time posters |
| Getting creators to post | `activation` | 25% | Samples shipped; sample requests |
| Turning activity into sales | `efficiency` | 20% | Sales per video; videos that made sales; sales per shipped sample |
| Getting repeat content | `retention` | 20% | Videos per creator |
| Spreading sales | `concentration` | 15% | Sales from the top product; sales from the top 10 creators |

## Input score

For an input where more is better:

```text
ratio = current value / mean of previous 3 periods
```

For concentration inputs where less dependence is better:

```text
ratio = mean of previous 3 periods / current value
```

Convert the ratio to a 0–100 score:

```text
input score = clamp((ratio - 0.5) × 140, 0, 100)
```

If both the current value and baseline are zero, do not treat the result as proven strength. Mark the input as unavailable or add a clear data warning.

## Part and overall score

- A part score is the simple mean of its available input scores.
- The overall score is the weighted mean of the five available part scores.
- Healthy: 70–100.
- Needs work: 40–69.
- At risk: below 40.
- If any part is below 40, label the whole program `At risk` even when the weighted score is 40 or higher.

## Recommendation order

For each input, calculate how much the weighted overall score would rise if only that input reached 100.

Sort recommendations by that possible point gain, highest first. Describe it as “possible points gained,” not predicted sales, revenue, or guaranteed impact.

Tie every recommendation to:

- the weak input;
- the current value;
- its normal value;
- one short action the brand can take.

Do not claim causation. The dashboard shows where results changed and what to check next.
