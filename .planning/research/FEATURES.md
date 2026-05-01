# Features Research — MoneyMap PKR

**Domain:** Pakistani Islamic personal finance PWA
**Researched:** 2026-05-01
**Confidence:** MEDIUM-HIGH (based on training data through August 2025; web tools unavailable for live verification)

---

## Table Stakes (Must Have)

Features that users expect from any personal finance app. Missing these causes immediate abandonment or non-adoption. Derived from analysis of YNAB, Mint/Credit Karma, Money Manager, SadaPay, NayaPay, Meezan Bank app, and MCB Islamic.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Transaction logging | Core of any finance app — without it there is no product | Low | Manual entry only for v1 is acceptable; auto-sync is a later feature |
| Expense categories | Users need to see where money goes by type | Low | Must include Pakistan-local categories (rishta, school fees, utility bills, mehndi, eid gifts) |
| Monthly budget view | Users want to know if they are over/under budget | Low | Planned vs actual per category is the minimum bar |
| Running balance / remaining-to-spend | Users must know how much they can still spend | Low | MoneyMap's "bucket" view exceeds this baseline — important differentiator on top |
| Income entry | Record when salary arrives | Low | Pakistani users often have irregular disbursement dates; handling salary date flexibility matters |
| Basic reports / spending summary | Users want to see monthly summaries | Medium | Even simple pie chart / category breakdown satisfies this |
| Account or payment method tracking | Users want to see EasyPaisa vs cash vs bank separately | Low | Must include Pakistan-local wallets: EasyPaisa, JazzCash, SadaPay, NayaPay, Raast |
| Search and filter transactions | Users look up past transactions constantly | Low | Filter by category, date range, amount range, payment method |
| Data persistence and security | Users trust finance apps only if data does not disappear | Medium | Supabase RLS + authenticated sessions satisfies this |
| Mobile-first usability | Pakistan smartphone penetration is high; most users on Android | Medium | 44px tap targets, large number inputs, bottom nav — MoneyMap PROJECT.md already specifies this |
| PKR currency formatting | Pakistani users cannot read 180,000 — they read 1.80 L | Low | `formatPKR()` with lakh/crore notation is a hard constraint in PROJECT.md |
| Secure login / account creation | Users will not store financial data without auth | Low | Email/password via Supabase Auth; social login optional post-v1 |
| Debt tracking | Pakistani salaried workers carry personal loans, credit cards, family debts | Medium | Debt list, monthly payment, payoff date are minimum; MoneyMap goes deeper with emotional flags |
| Savings goals | Users want to save for specific targets | Low | Goal name, target amount, current amount, estimated date |
| Settings: notifications / reminders | Prompt users to log expenses and pay debts | Low | Salary allocation reminder, daily entry, debt due date — all in PROJECT.md |
| PWA installability on Android/iOS | Pakistani users expect a home screen icon, offline behavior | Medium | next-pwa; service worker; no App Store submission needed |

---

## Differentiators (MoneyMap PKR Advantages)

Features that no existing Pakistani finance app offers, or that existing apps do poorly. These are MoneyMap's competitive moat.

### 1. Committee (Rotating Savings Group) Tracker — HIGH confidence differentiator

**Why:** Committees (also called "bisi" or "chit fund" informally) are embedded in Pakistani middle-class financial life. A household may participate in 2-4 committees simultaneously, each representing 10k-50k PKR/month in cash flow. No mainstream finance app — Pakistani or global — models committees as first-class financial objects.

**What competing apps do:** Banks ignore committees entirely. SadaPay and NayaPay treat them as a payment type at best. YNAB and Mint have no awareness of them. Money Manager lets you log them as generic recurring expenses but provides zero intelligence.

**What MoneyMap does:** Contribution amount, member count, receiving month, manager, risk level, auto-calculated total value, expected payout, net position, warnings when burden exceeds 30% of salary, warnings when adding committee while debt > 0. This alone makes MoneyMap irreplaceable for the target user.

| Feature | MoneyMap | SadaPay/NayaPay | YNAB | Meezan Bank App |
|---------|----------|-----------------|------|-----------------|
| Committee as first-class object | Yes | No | No | No |
| Burden warnings | Yes | No | No | No |
| Receiving month / payout calc | Yes | No | No | No |

### 2. Islamic Finance Mode ON by Default — MEDIUM-HIGH confidence differentiator

**Why:** Pakistan is 96%+ Muslim. Every other budgeting app treats Islamic compliance as an afterthought or external add-on. MoneyMap bakes it in as the default, not an opt-in checkbox.

**What competing apps do:** YNAB has no Islamic awareness. Mint actively pushes credit card sign-ups and interest-bearing savings accounts. Meezan Bank's app shows Islamic products but is a bank app, not a budgeting tool. No app enforces Islamic finance rules across the full user journey — budgeting, debt, investment, AI coach.

**What MoneyMap does:** Islamic mode on by default; investment tracker enforces halal-only vehicles (Sukuk, Modarabas, KMI-30, Meezan mutual funds, gold, REITs, NPCs); AI coach (Rizq Coach) refuses to recommend riba-based products; Qarza (قرض) framing for debt instead of generic "loan"; debt urgency flagged by Islamic concern.

### 3. Zero-Based Budgeting with Salary Buckets — MEDIUM-HIGH confidence differentiator

**Why:** YNAB does ZBB globally but is expensive ($15/month USD), English-only, and not Pakistan-aware. Pakistani bank apps show a running balance but never a bucket-divided view. The behavioral insight — never show raw salary as "available" — is missing everywhere.

**What competing apps do:** Pakistani bank apps show total balance. NayaPay shows spend-by-category but no zero-based allocation. SadaPay shows transaction history but no budgeting framework. Money Manager does budgets but without the behavioral "every rupee has a job" philosophy.

**What MoneyMap does:** 6 fixed buckets (Needs/Debt/Emergency/Investment/Personal/Buffer) that must sum to 100% of salary. Dashboard never shows raw salary. Smart budget messages. Warnings when bucket allocation is behaviorally dangerous (e.g., investing while emergency fund is empty).

### 4. Behavioral / Emotional Spending Intelligence — HIGH confidence differentiator

**Why:** The core problem for the target user is behavioral, not mathematical. No Pakistani app addresses emotional spending triggers. Even globally, only apps like Cleo touch this, and none do it with Pakistani cultural context (family pressure, social obligations, eid pressure, shaadi spending).

**What competing apps do:** YNAB does not track emotional triggers. Mint shows category overspend but not why. Money Manager is purely transactional. No Pakistani app even mentions behavioral patterns.

**What MoneyMap does:** Emotional trigger field on transactions; leakage score (0-100) computed from unknown transactions, unplanned spending, emotional flags, cash withdrawals, weekend patterns, category overruns; monthly leakage report with top 5 leaks; fixed expense discovery to identify "leakage vs obligation." This turns MoneyMap into a financial behavior coach, not just a tracker.

### 5. Debt Payoff Planner with Islamic Awareness — MEDIUM confidence differentiator

**Why:** Pakistan has a large informal debt ecosystem — family loans (qarza), personal loans, credit cards. Most users do not know their total debt burden or have a payoff plan. Islamic awareness (flagging interest-bearing debt as a concern) adds cultural weight to the payoff motivation.

**What competing apps do:** Meezan Bank and MCB Islamic show loan balances but have no multi-debt payoff planner. YNAB handles debt "float" but has no structured payoff methodology. Dedicated payoff apps (like Debt Payoff Planner) exist globally but are not Pakistan-aware.

**What MoneyMap does:** Multi-debt dashboard; 3 payoff strategies (Urgent First default, Snowball, Markup First); Islamic concern flag per debt; emotional pressure field; impact modeling ("adding this debt pushes your debt-free date to X").

### 6. AI Rizq Coach — MEDIUM confidence differentiator (Phase 2)

**Why:** Personalized financial coaching is expensive and unavailable for the 100k-300k PKR/month income segment in Pakistan. An AI coach that knows the user's actual numbers, speaks in PKR, follows Islamic rules, and responds in culturally appropriate ways is genuinely novel.

**What competing apps do:** Credit Karma has AI suggestions but US-only and interest-product-centric. YNAB has no AI (as of training data). NayaPay and SadaPay have no financial coaching layer.

**What MoneyMap does:** Context-aware chat grounded in user's real data; quick prompts ("where did my money go", "can I afford this"); every response ends with one clear action; Islamic constraint enforcement in all advice.

### 7. Financial Freedom Roadmap + Milestone System — MEDIUM confidence differentiator

**Why:** Pakistani finance content focuses on "save 20%" generically. A concrete, personalized roadmap from "Rs 0 savings" to "Rs 5 crore financial freedom" with milestones calibrated to Pakistani cost of living and Islamic investment vehicles is not available in any app.

**What competing apps do:** YNAB age-of-money metric is its nearest equivalent but is US-centric and not goal-oriented in this way. Mint has goal tracking but generic. No Pakistani app has this.

**What MoneyMap does:** 15 auto-seeded system milestones (debt payoff → 50k emergency → 100k emergency → first investments → 1M net worth → 5Cr freedom); celebration animations; Freedom Calculator with 5 Islamic investment scenarios and interactive charts.

### 8. Leakage Detector with Named Categories — HIGH confidence differentiator

**Why:** "Leakage" is the behavioral term for money that disappears without the user noticing or intending. Pakistani users describe this as "pata nahi kahan chala gaya" (I don't know where it went). No app names this phenomenon and systematically detects it.

**What competing apps do:** Mint has category overspend alerts. YNAB shows unbudgeted spending. None compute a holistic leakage score or produce a ranked "top 5 leaks" analysis.

**What MoneyMap does:** Composite leakage score with 6 inputs; monthly leakage report; "Unknown category" highlighting; fixed vs flexible expense discovery after 2+ months of data.

---

## Anti-Features (Do NOT Build in v1)

Features that seem valuable but should be deliberately excluded from v1 to maintain focus and ship speed.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Bank account sync / Open Banking | Pakistan's open banking API ecosystem is immature (SBP's RAAST is payment rail, not data API); PSD2 equivalent does not exist; building a scraper is fragile and legally gray | Manual entry with fast quick-add modal (<15 seconds); revisit after PMF when regulatory clarity increases |
| Multi-currency support | Adds formatting complexity, schema complexity, exchange rate dependencies — no benefit for the target user who earns and spends entirely in PKR | PKR-only; format everything as lakh/crore; the constraint is a feature not a limitation |
| Social / shared budgets | Couples finance features require family consent flows, permission systems, conflict resolution UX — doubles complexity | Single-user only in v1; shared household budgets are a post-PMF request to validate |
| Credit score / SECP reporting integration | Pakistan's consumer credit bureau (eCIB) has no public API; building this requires partnerships | Out of scope entirely; not feasible without institutional relationships |
| Stock portfolio / trading integration | PSX API access requires NCCPL membership; real-time price feeds are costly; out of scope for v1 investment tracker | Manual investment entry with Sharia type and current value; no live price sync |
| Crypto tracking | Crypto is in a legal gray zone in Pakistan (SBP has issued multiple warnings); including it conflicts with Islamic mode and creates regulatory risk | Explicitly excluded from Islamic investment tracker |
| Receipt scanning / OCR | High complexity, requires ML pipeline or paid API (Google Vision, AWS Textract), fails frequently for handwritten Pakistani receipts; creates false accuracy expectations | Manual entry with fast UX is more reliable and sufficient for v1 |
| Urdu language support | Urdu RTL layout requires CSS/component rewrites throughout; Urdu number formatting differs; doubles testing surface | English-only v1 with Urdu-friendly terminology (Qarza, Rizq, Committee, Halal) in labels |
| In-app bill payments | Requires fintech license from SBP (EMI license); EasyPaisa/JazzCash integrations require agreements and compliance infrastructure | Track payments made externally; link out to EasyPaisa/JazzCash web if needed |
| Investment execution / brokerage | Requires SECP securities broker license; completely out of scope | Education + tracking only; recommend halal funds by name with disclaimer to open account externally |
| Subscription management (auto-detect) | Requires bank sync to identify recurring charges; not possible with manual entry | User can mark transactions as "recurring" manually; no auto-detection |
| Tax filing / FBR integration | FBR API access requires institutional registration; tax calculations require legal expertise | Out of scope; flagging freelance/business income for tax awareness is a post-v1 feature |
| Gamification / social leaderboards | Leaderboards require multi-user infrastructure; comparison can cause shame spiraling which conflicts with the app's non-judgmental tone | Achievement milestones and celebration animations are sufficient behavioral reward; no competitive features |
| Flutter / React Native app | Backend must be API-first to support this later, but native apps are out of scope for v1 | PWA is the v1 distribution; REST API layer prepared but no native app |

---

## Feature Complexity Notes

Notes on implementation complexity that should inform phase sequencing.

### Low Complexity (Phase 1 safe)
- Transaction CRUD with categories, payment methods, emotional trigger field
- Budget bucket system (6 fixed buckets, ZBB enforcement)
- Debt tracker (list, monthly payment, Islamic flag, emotional pressure)
- Committee tracker (contribution, members, receiving month, risk level, auto-calcs)
- Emergency fund milestones (hardcoded 5 levels)
- Goal tracker (system milestones + custom goals)
- PKR formatting utility (`formatPKR()` with lakh/crore)
- Basic monthly report (income, expenses, savings rate)
- Settings (profile, Islamic mode, strict mode, reminders)
- PWA installability (next-pwa)

### Medium Complexity (Phase 2, after core data exists)
- Leakage score calculation (needs 1+ months of transaction data to be meaningful)
- Fixed expense discovery algorithm (needs 2+ months of data)
- Financial freedom calculator (needs investment assumptions + current net worth data)
- Net worth snapshot (needs assets + liabilities across multiple categories)
- AI Rizq Coach (needs Anthropic API integration, context assembly from user data, prompt engineering, response validation for Islamic compliance)
- Push notifications (service worker + notification permission flow)

### High Complexity (Phase 3, validate need first)
- Advanced Recharts visualizations (10 chart types; requires full data history)
- Investment education content (10 lessons; content creation work, not just engineering)
- Zakat calculator (requires correct nisab calculation and jurisdictional nuance; needs disclaimer copy reviewed)
- Strict mode full implementation (full-screen warning intercepts on all spend paths; requires careful UX to avoid being annoying)
- Offline support (service worker caching strategy, conflict resolution for offline transactions)

### Complexity Traps to Avoid
- **Salary allocation validation**: Enforcing "all rupees assigned" sounds simple but the UX when total != salary needs careful design. Users will have partial allocations, rounding errors, and mid-month salary adjustments. This needs a "pending" state, not a hard block.
- **Committee payout logic**: Committees are not always linear (some members leave, amounts change, manager takes a cut). Start with the happy path and add edge cases post-v1.
- **AI context assembly**: The Rizq Coach response quality depends entirely on how much context is sent to the API. Assembling "user's current month snapshot" in a prompt-friendly format is non-trivial and requires careful schema design from day one.
- **Leakage score gaming**: If users know the score formula, they will close transactions in ways that improve the score. Keep the formula details private; surface the insight, not the formula.

---

## Pakistan-Specific Insights

### Financial Behavior Patterns (MEDIUM confidence — inferred from market context)

**Salary disbursement timing:** Government and many private sector salaries arrive between the 1st and 10th of the month. Many employees receive salary late (15th+). The app must handle flexible "salary date" settings and not assume the 1st.

**Cash economy:** Pakistan remains heavily cash-based. A significant portion of transactions, especially in bazaars, small shops, rickshaw/Careem, and domestic help payments, will be cash. "Cash" must be a first-class payment method. Cash withdrawals flagged as potential leakage vectors is accurate and culturally resonant.

**Family financial obligations:** Pakistani salaried workers regularly support parents, siblings, and extended family. These transfers ("kharch" for family) are not optional expenses but social obligations closer to fixed costs. The app should have a category for family support that is treated as an obligation, not a want.

**Eid/wedding season spending spikes:** Two Eid periods per year and a wedding season (Oct-Feb primarily) cause predictable budget disruptions. A future feature (post-v1) could warn when historical data shows this pattern. For v1, the category structure should accommodate "occasions" (mehndi, eid gifts, wedding shagun) without forcing users to call them "entertainment."

**Multiple income sources:** Many target users have a primary salary plus side income (tutoring, freelance work, rental income from inherited property). Income entry should support multiple income sources with different names and frequencies from day one — even if v1 only surfaces it as "add another income."

**Informal lending:** The debt ecosystem includes family loans (which users are embarrassed about), loans from colleagues, and informal moneylenders. The "Qarza" (قرض) framing for family/informal debt reduces shame and increases likelihood of honest logging. This is culturally significant — using the Islamic/Urdu term signals that the app understands the user.

### Payments Ecosystem (HIGH confidence)

The following payment methods must be present as distinct options in transaction entry — they are not interchangeable in the user's mental model:

| Payment Method | User Segment | Notes |
|----------------|--------------|-------|
| Cash | Universal | Still dominant in bazaar, transport, domestic staff |
| Bank Transfer | Salaried professionals | Meezan, HBL, UBL, MCB, Alfalah accounts |
| Debit Card | Urban professionals | Linked to same bank accounts |
| EasyPaisa | Mass market / blue collar | Telenor-owned; dominant in smaller cities |
| JazzCash | Mass market / blue collar | Jazz-owned; competitor to EasyPaisa |
| SadaPay | Urban professionals | Visa debit; popular with tech-forward users |
| NayaPay | Urban professionals | Visa debit; IFC-backed |
| Raast | Emerging | SBP's instant payment system; bank-to-bank; growing adoption |
| Credit Card | Upper-middle class | HBL, MCB, Alfalah; lower penetration than global norms |

### Islamic Finance Vehicles (HIGH confidence — well-documented)

Investment tracker must support exactly these halal instruments and exclude all others:

| Instrument | Provider Examples | Notes |
|------------|-------------------|-------|
| Islamic Mutual Funds | Meezan Islamic Fund, Al-Meezan Mutual Funds, NBP Islamic | Most accessible entry point |
| Sukuk | GOP Ijarah Sukuk, corporate Sukuk | Fixed-income alternative to bonds |
| Modaraba | First Habib Modaraba, Standard Chartered Modaraba | Profit-sharing vehicle |
| KMI-30 stocks | PSX-listed Shariah-compliant equities | Karachi Meezan Index screens |
| Gold (physical) | Gold savings accounts, physical gold | Common store of value in Pakistan |
| Islamic REITs | Limited market currently | Growing but illiquid |
| National Pension Scheme (Islamic) | NPS Islamic | Government-backed retirement vehicle |

Explicitly haram / excluded: Conventional bonds, savings accounts with interest (ribawi accounts), margin trading, options/futures, crypto speculation, conventional insurance (takaful is halal alternative but complex to track).

### Committee Risk Levels (HIGH confidence — domain knowledge)

Not all committees carry the same risk. MoneyMap should expose risk levels to surface this:

| Risk Level | Description | Indicators |
|------------|-------------|------------|
| Low | Organized by trusted family member or long-term colleague | Small group (<10), known manager, fixed workplace |
| Medium | Organized by acquaintance; some counterparty risk | Larger group (10-20), less familiar manager |
| High | Organized by non-known party or very large chit | 20+ members, external organizer, online committee |

Users who receive their payout early (in first half of a 12-month committee) are at highest risk: they have received value but the group must continue trusting them for the remainder. The app should flag this asymmetry.

### Local Debt Categories (MEDIUM confidence)

Pakistani debt doesn't fit Western categories neatly:

| Category | Description |
|----------|-------------|
| Family/Friends Loan (Qarza) | Interest-free informally; most common; carries honor/shame weight |
| Personal Bank Loan | From commercial banks; ribawi (interest-bearing); Islamic concern flag mandatory |
| Islamic Bank Finance | Meezan Murabaha, Diminishing Musharakah; permissible but still a liability |
| Credit Card Balance | Ribawi; emergency-only in Islamic worldview |
| BNPL / Installment | Growing (Tez, Bazaar Finance); technically ribawi if interest included |
| Office/Employer Advance | Salary advance from employer; common and low-stakes |
| Chit Fund / Committee Obligation | Future committee payments as a forward liability |

---

## Feature Dependency Map

```
Salary Input
    └─> Salary Bucket Allocation
            └─> Budget Tracking (planned vs actual)
                    └─> Leakage Detection (needs 1+ months data)
                            └─> Fixed Expense Discovery (needs 2+ months)
                                    └─> AI Rizq Coach (needs full context)

Transaction Log
    └─> Category + Bucket Assignment
            └─> Monthly Reports (basic)
                    └─> Advanced Charts (Phase 3)

Debt List
    └─> Payoff Planner
            └─> Debt-Free Date Estimate
                    └─> Milestone: Debt Paid Off

Committee List
    └─> Committee Burden Warning
    └─> Net Cash Flow Impact

Emergency Fund Target
    └─> Emergency Fund Milestones
            └─> Warning: spend > 10k when fund < 50k

Investment Log
    └─> Net Worth Calculation
            └─> Financial Freedom Calculator
                    └─> Freedom Roadmap / Milestones
```

---

## MVP Recommendation

### Must Ship in Phase 1 (Core Loop)

1. Transaction logging with category, payment method, emotional trigger, bucket
2. Salary entry + 6-bucket allocation with ZBB enforcement
3. Budget view: planned vs actual per bucket, color-coded
4. Debt tracker: list, monthly payment, Qarza framing, Islamic flag
5. Committee tracker: contribution, receiving month, burden warning
6. Emergency fund milestone tracker
7. Basic monthly report
8. PKR formatting (lakh/crore) everywhere
9. Onboarding: 5-step salary → debt → freedom target → preferences → allocation preview
10. PWA install + mobile-first layout

### Defer to Phase 2 (After First Users)

- Leakage score (needs real data to be meaningful)
- AI Rizq Coach (needs data + prompt engineering investment)
- Net worth tracker (adds complexity; validate users want it)
- Financial freedom calculator (needs investment assumptions to be personalised)
- Push notifications (can start with in-app banners)

### Defer to Phase 3 (After PMF Signal)

- Advanced charts (10 visualizations)
- Investment education content
- Zakat calculator
- Full strict mode intercepts
- Offline support
- Data export
- REST API layer for future Flutter app

---

## Sources

**Confidence notes:** Web tools were unavailable during this research session. All findings are drawn from training data (cutoff August 2025). Confidence levels assigned per finding:

- **HIGH confidence:** Features of YNAB, Mint, standard personal finance apps are well-documented and stable. Pakistani payment method landscape (EasyPaisa, JazzCash, SadaPay, NayaPay, Raast) is well-covered in training data through mid-2025. Islamic finance instruments are well-documented in AAOIFI standards and Meezan Bank materials.
- **MEDIUM confidence:** Specific feature gaps in SadaPay/NayaPay apps (they may have added budgeting features post-training-cutoff). Meezan Bank app feature depth (limited documentation available). Pakistani behavioral finance patterns (inferred from market context, not user research).
- **LOW confidence:** Exact features of MCB Islamic app. Current state of PSX/NCCPL API availability. SBP open banking API developments post-2024.

**Validation recommended for:**
- SadaPay and NayaPay — check current App Store listings for any new budgeting/savings features added in 2025
- Meezan Bank app — verify current feature set for Islamic budgeting tools
- SBP RAAST data-sharing capabilities — any new open banking announcements from SBP in 2025
