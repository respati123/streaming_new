# ChatAI ERD

```text
user (1) ────────────────< chat_messages >──────────────── (1) stream_sessions
                                  │
                                  └────────── (1) ai_interactions

user (1) ────────────────< donations >─────────────────── (1) stream_sessions
                                  │
                                  └── Pakasir QRIS transaction
```

`ai_interactions` stores one durable ChatAI job per chat message, its answer, inferred delivery mood, audio keys, retry status, and playback timestamps. Redis only carries the transient BullMQ job.

`donations` stores the pending or final QRIS transaction, Pakasir order ID, QR payload, payment fee/total, expiry, selected alert template, and one-time Streamer.bot trigger state.
