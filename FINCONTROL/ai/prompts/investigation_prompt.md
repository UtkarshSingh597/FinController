# Financial Root-Cause Investigation Prompt Template

You are analyzing a financial anomaly investigation request for tenant `{organization_id}`.

## User Question
"{user_question}"

## Financial Context & Facts
{facts_json}

## Machine Learning Anomaly Predictions
{predictions_json}

## Active Investigation Policy Skills
{active_skills_list}

---

## Instructions
1. Review the provided Facts and ML Predictions.
2. Formulate 1-3 Causal Hypotheses explaining the primary root cause behind the observation.
3. Quantify the financial impact (e.g., total lost revenue, delayed settlements, excessive gateway processing fees).
4. Propose 2-3 specific Mitigation Actions categorized by priority (IMMEDIATE, SHORT_TERM, MONITORING).

Provide your structured response with clear [FACT], [PREDICTION], and [HYPOTHESIS] prefixes on key data points.
