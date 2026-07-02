# How the brain works — the simple version

No jargon. Just enough of the "how" that the brain stops feeling like magic and you can use it well. Five ideas, then a walk-through of what happens when you ask a question.

> **Prefer to *see* it?** Open **`../teaching/how-the-brain-works.html`** in your browser — an interactive version of this doc: a real map of meaning you can hover, an "embed a text → watch the pin drop" demo, and the query pipeline stepped through live. (Built from real embeddings; works offline.)

---

## 1. Why "a second brain"?

Your first brain forgets. It can't hold every meeting note, policy, and decision — and it can't instantly connect something you wrote in January to a question you ask in July.

A **second brain** is an outside memory that does three things your head can't:
- **Remembers everything** you feed it, exactly.
- **Connects** ideas across all of it, even things you'd forgotten were related.
- **Hands it back** the moment you (or your AI) ask.

It's not smarter than you. It's a filing assistant with a perfect memory and a great sense of what's related — sitting next to Claude and Hermes, whispering the relevant bits from *your* documents whenever they answer.

---

## 2. Embeddings — a "map of meaning"

This is the one idea that makes everything else work.

Imagine every sentence in your documents gets a pin dropped on a giant map. The map isn't about *place* — it's about *meaning*. Sentences that mean similar things land close together; unrelated ones land far apart. "Our refund window is 30 days" and "customers can return items within a month" land almost on top of each other, even though they share no words.

An **embedding** is just that pin's coordinates — a long list of numbers (1,536 of them, in our setup) that captures what a piece of text *means*. The computer can't read like you, but it can measure distance between pins. So "find me things about our return policy" becomes "find the pins nearest to this spot on the meaning map."

That's why the brain finds the right note even when you use different words than the document did. **It searches by meaning, not by matching words.**

> Building these pins is the one step that uses an outside service (OpenRouter, or a local model with Ollama). It's why setup asks for a key. After that, the map lives on your laptop.

---

## 3. Taxonomy — the shelving system

A map of meaning is powerful but messy. **Taxonomy** is the tidy structure on top: the folders and labels that say *what kind of thing* each note is.

Think of a library. Embeddings are "books about similar topics sit near each other." Taxonomy is "Fiction here, History there, Biography over there." gbrain suggests simple buckets like **people**, **companies**, **concepts**, **projects** — a place for everything, everything in one place.

Why bother? Because "summarize what we know about *the company* Acme" is a cleaner question when Acme has its own page under `companies/`, instead of being scattered across forty notes. Taxonomy turns a pile of text into **pages about things**.

You don't have to be strict about it — even loose folders help. The brain organizes; you just keep it roughly tidy.

---

## 4. The graph — the web of connections

Notes don't live alone. When one note mentions something that has its own page, the brain draws a **link** between them. Do that across everything and you get a **graph**: a web of "this relates to that."

Picture a mind map, or a city where every building (a page) is joined by roads (links) to the buildings it's connected to. Acme's page links to the deal you're negotiating, which links to the person who owns it, which links to last week's meeting notes.

Two everyday payoffs:
- **Backlinks** — from any page you can see *"what else points here?"* Open the "pricing" page and instantly see every decision, note, and deal that referenced it.
- **Better answers** — when the AI answers, it can walk a few roads out from the obvious match and pull in the connected context, so you get the *whole* picture, not one isolated sentence.

Embeddings find things by *meaning*; the graph finds things by *relationship*. You want both.

---

## 5. What actually happens when you ask a question

You type: *"What are our delivery terms for EU orders?"* Here's the assembly line, in plain steps:

1. **Understand & rephrase.** The brain reads your question and quietly writes a few alternative phrasings ("EU shipping policy," "delivery times Europe"). Casting a slightly wider net catches documents that worded it differently. *(This is "expansion.")*

2. **Search two ways at once.**
   - **By words** — a fast keyword search for the literal terms.
   - **By meaning** — it drops a pin for your question on the meaning map and grabs the nearest notes (the embeddings from idea #2).

3. **Merge the two lists.** Each search returns a ranked list; the brain fuses them into one, so a note that scores well on *both* rises to the top. *(The formal name is "reciprocal rank fusion" — you don't need it, but that's the trick.)*

4. **Pick the best, within a budget.** It keeps the strongest handful, walks a few graph links for context, and fits them into a size limit so the answer stays fast and cheap.

5. **Answer with receipts.** Claude or Hermes reads those top notes and writes your answer — and can tell you **which document** each part came from. That's the whole point: an answer you can trust and trace.

All of that happens in a second or two, every time you ask — and you never see any of it. You just ask in plain language.

---

## The one dial you can turn: depth vs cost

Step 4 above keeps things "within a budget." You can change how big that budget is:

| Mode | What it does | Use it for |
|---|---|---|
| **conservative** *(default)* | fast, cheap, ~10 best sources | everyday questions |
| **balanced** | wider net, ~25 sources | "pull everything we know about X" |
| **tokenmax** | deepest, most expensive | a big one-off research pass |

Most people never touch it. If you want more depth, just tell Claude *"use balanced search mode."*

---

## Recap in one breath

Your documents become **pins on a map of meaning** (embeddings), shelved into **pages about things** (taxonomy), wired together by **links** (the graph). When you ask, the brain rephrases your question, searches by *words* and by *meaning*, merges the results, walks a few connections, and hands Claude or Hermes the best of *your* knowledge — with sources. That's the second brain.
