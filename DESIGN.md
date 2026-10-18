---
name: Blackout
description: Dark recovery security workspace with evidence-led mint feedback.
colors:
  primary: "#85efb6"
  primary-hover: "#b1ffd3"
  primary-ink: "#0a261a"
  pass-surface: "#17372c"
  fail: "#ff947e"
  fail-surface: "#3a2424"
  unverified: "#edcc80"
  unverified-surface: "#34301f"
  page: "#080d13"
  surface: "#101922"
  panel: "#0e1720"
  verdict: "#111d28"
  ink: "#e5eef6"
  muted: "#91a4b7"
  line: "#23313e"
typography:
  display:
    fontFamily: "Space, Manrope, 'Segoe UI', sans-serif"
    fontSize: "clamp(30px, 3.15vw, 45px)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Space, Manrope, 'Segoe UI', sans-serif"
    fontSize: "19px"
    fontWeight: 500
    letterSpacing: "-.02em"
  title:
    fontFamily: "Space, Manrope, 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 500
  body:
    fontFamily: "Manrope, 'Segoe UI', sans-serif"
    fontSize: "14px"
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, 'Segoe UI', sans-serif"
    fontSize: "12px"
  code:
    fontFamily: "'Cascadia Code', Consolas, monospace"
    fontSize: "12px"
  metadata:
    fontFamily: "Consolas, monospace"
    fontSize: "11px"
rounded:
  tag: "3px"
  control: "6px"
  zone: "8px"
  panel: "12px"
spacing:
  small: "8px"
  medium: "16px"
  grid: "20px"
  panel: "24px"
  gutter: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-ink}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  card:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.panel}"
  tag-pass:
    backgroundColor: "{colors.pass-surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.tag}"
    padding: "4px 8px"
---

# Design System: Blackout

## Overview

**Creative North Star: "Recovery security workspace"**

Blackout uses the user's chosen dark cybersecurity direction: navy surfaces, mint signals, precise geometry and purposeful glow. The interface feels like an operating instrument for examining recovery evidence. The former ivory deck direction is superseded.

Type and borders carry the hierarchy. Glow marks a restore or a newly observed result; it does not establish a successful outcome. General Blackout product branding stands alone, without competition branding or a demo video.

**Key Characteristics:**
- Dark navy tonal layers with legible cool text.
- Mint actions and preserved-state signals, with explicit outcome labels.
- Compact technical evidence alongside clear operational headings.
- Bounded event feedback with a reduced-motion path.

## Colors

### Primary
Mint is the primary action, active-navigation and preserved-state accent. The stylesheet retains the legacy custom-property name `--blue` for this mint value; it is not a blue branding direction. Mint also denotes PASS, always paired with written status.

### Semantic signals
Warm coral denotes FAIL or reopened access. Amber denotes UNVERIFIED, missing evidence and requirements needing review. Dark tinted companions contain these signals without flooding the workspace. Informational phase tags use a muted blue distinct from the primary accent.

### Neutral
Deep navy page, panel and verdict surfaces create depth. Cool near-white carries main text; slate carries supporting text and rules.

**The Evidence Color Rule.** Color reinforces an explicit status label; color alone never communicates verification success.

## Typography

**Display Font:** Space Grotesk, self-hosted as CSS family `Space`, with the body stack as fallback.
**Body Font:** Manrope, self-hosted variable font, with Segoe UI and sans-serif fallbacks.
**Label/Mono Font:** Cascadia Code or Consolas for technical strings; Consolas for minor metadata.

Space Grotesk gives headings a geometric instrument-panel character. Manrope keeps dense explanations readable. Paragraphs generally stop at 72ch.

### Hierarchy
Display headings use the frontmatter clamp, with a phone override (32px). Section headings use the headline role; compact panel headings use title. Verdict text is larger (34px desktop, 28px tablet, 32px phone). Main body uses the body role, while compact explanations use 12-13px. Functional labels and controls stay at least 12px. Minor monochrome metadata, timestamps and desktop step numerals may use 11px.

**The Readable Label Rule.** Never shrink functional labels below 12px to make a layout fit; allow wrapping or scrolling instead.

## Layout

The centered main container is capped at 1408px, including desktop gutters. A horizontal masthead and task navigation lead into an operational workspace. The recovery diagram sits beside a verdict column (354px by default) with a 20px gap; evidence spans beneath. Incident requirements, challenges and mechanism explanation are separate views.

At 1450px and above, the verdict column grows to 380px. At 1100px and below it narrows to 320px and secondary details simplify. At 850px and below, workspace and evidence grids stack; the verdict temporarily uses two internal columns. At 560px and below, the verdict and topology become vertical, main gutters become 16px, navigation scrolls, and wide evidence tables scroll within their panels. Panel padding typically ranges from 16px on phones to 24px on desktop.

## Elevation & Depth

Borders and navy tonal layering provide most separation. The protected zone has a very faint mint resting shadow and a fine luminous top edge. Toasts float above content. The primary button gains a small hover glow. Neither panels nor every interactive element receive a permanent halo.

### Shadow Vocabulary
- Protected state: `0 5px 24px #64edaa08` at rest.
- Primary hover: `0 4px 20px #85efb624`.
- Toast: `0 8px 24px #0005`.
- Restore wire: `0 2px 12px #85efb680` during restore.
- Result arrival: a single pulse peaking at `0 7px 32px var(--result-light)`; its tint follows the observed result.

**The Bounded Glow Rule.** Animated glow responds to restore or result arrival, runs for a finite duration, and never substitutes for observed evidence.

## Shapes

Gently curved panels use the panel radius; nested zones use the zone radius. Controls use the control radius and tags are tighter. Thin strokes, small dots and simple inline SVG icons carry technical structure. Dashed boundary rules distinguish the application rollback boundary from independent state. The verdict icon has a larger rounded frame (18px) to anchor the outcome.

## Components

### Buttons
Compact, clearly weighted actions. Primary buttons use mint with dark ink, a minimum height of 42px and strong labels (750 weight). Outline actions use a dark blue surface with a lighter border; quiet actions have no fill until hover. Background, text and border transitions last 160ms. Keyboard focus uses a mint outline (2px with 4px offset). Disabled actions use half opacity and a waiting cursor.

### Chips
Tight rectangular status tags use tinted backgrounds and explicit labels. PASS, FAIL and UNVERIFIED retain distinct text and color. Informational and neutral tags must not imply successful verification.

### Cards / Containers
Navy panels have thin blue-gray borders and clipped rounded corners. The verdict panel combines its label, outcome, explanation, check list and run metadata. Waiting, stale and unverified outcomes remain visually distinct from PASS.

### Inputs / Fields
Incident notes use a dark inset textarea, a visible stroke, control radius and 16px padding. Text is 13px with a generous 1.9 line height. Labels remain outside the input. Select controls use the same dark language. Focus follows the shared mint outline; rejected extraction has a written explanation on amber tint.

### Navigation
Horizontal text tabs use muted labels, a brighter mint active label and a mint bottom rule. The navigation stays scrollable on narrow screens. Selected states are expressed semantically with tab roles and `aria-selected` as well as visually. A keyboard skip link reveals itself on focus.

### Recovery boundary and result feedback
The independent state zone sits above a dashed rollback boundary. The snapshot and application are linked horizontally on desktop and vertically on phones. A restore uses two 700ms wire/application passes plus one 1.2s protected-state pulse. Result arrival uses one 850ms pulse with cubic-bezier(.16,1,.3,1). Actual request results determine the verdict independently of animation.

Reduced-motion preference disables animations and transitions; result arrival uses a brief static outline instead. A requirements-review state replaces the mint protected treatment with amber and removes its resting glow.

## Do's and Don'ts

### Do:
- **Do** use dark navy tonal layers and the established mint primary accent.
- **Do** pair every outcome color with explicit status text and evidence.
- **Do** keep functional labels at least 12px and reserve 11px for minor mono metadata.
- **Do** keep restore and result animation finite and honor reduced motion.

### Don't:
- **Don't** reintroduce the superseded ivory direction or competition branding.
- **Don't** use glow or healthy business status as proof of containment.
- **Don't** add continuous decorative pulsing or a demo video.
- **Don't** hide missing evidence behind a successful-looking state.
