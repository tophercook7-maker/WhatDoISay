# Reply Quality Test Set

This test set keeps the temporary local mock reply engine useful while the app waits for real OpenAI integration in Phase 3. These examples should also be reused later to evaluate the production system prompt and backend reply function.

## Rules

- Output only the sendable message.
- Do not say "Here's a response" or explain the answer.
- Keep replies natural, calm, human, and usually 1-4 sentences.
- Avoid robotic, overly formal, or corporate filler.
- Preserve boundaries without making the user sound rude.

## Test Cases

1. `my pastor left me on read in messenger`
   - Intent: respectful, patient spiritual follow-up.
   - Expected ideas: `Pastor`, `follow up`, `when you have a chance`, `No rush`.

2. `my pastor left me on read and I feel ignored`
   - Intent: respectful check-in that does not accuse the pastor.
   - Expected ideas: checking in, hearing back, patient wording.

3. `client keeps asking for free changes`
   - Intent: professional scope boundary.
   - Expected ideas: outside original scope, separate quote or billing.

4. `my sister keeps asking to borrow money`
   - Intent: kind but firm family money boundary.
   - Expected ideas: love/care, not able to lend money.

5. `I forgot to reply to my friend for a week`
   - Intent: natural apology for late reply.
   - Expected ideas: sorry, did not reply sooner, should have gotten back.

6. `my customer is mad the website is late`
   - Intent: business delay response with accountability.
   - Expected ideas: apology, delay, update.

7. `tell my boss I can't work extra this week`
   - Intent: clear work boundary.
   - Expected ideas: not available, this week.

8. `someone replied to my Facebook ad asking how much a website costs`
   - Intent: sales lead response.
   - Expected ideas: pricing depends on needs, ask a couple quick questions.

9. `I'm pissed because they keep changing the plan`
   - Intent: clean up anger without losing the point.
   - Expected ideas: frustrated, plan keeps changing, clarity.

10. `I need to say no but not sound mean`
    - Intent: simple kind refusal.
    - Expected ideas: sorry, not able.

## Bad Patterns

The reply checks reject:

- `Here's`
- `Here is`
- `you could say`
- `as an AI`
- `Dear valued`
- empty output
- assistant-style framing

## Run

```bash
npm run check:replies
```
