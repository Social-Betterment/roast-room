# Mohnish Pabrai seat: Gemini portrait prompts

Four frames for `app/public/portraits/`: `pabrai-base.webp`, `pabrai-open.webp`, `pabrai-mid.webp`, `pabrai-blink.webp`. Frames cross-fade, so they must line up exactly. Method and checklist: `.claude/skills/new-seat/references/portrait-prompts.md`.

## Look block (best effort, correct it before you generate)

```
LOOK: man in his early 60s, warm brown skin, friendly round-oval face, short dark hair graying at
the temples, clean-shaven, no glasses, bright attentive eyes, easy relaxed smile.
WARDROBE: charcoal blazer over a light blue open-collar shirt, no tie.
BASE EXPRESSION: relaxed warm half smile, mouth closed.
PROP TEXT: none
```

## Prompt 1: base (run first, iterate until it is right)

```
A stylized 3D animated character portrait in the look of a modern animated feature film, head and shoulders bust of a real-world business leader drawn as a friendly caricature: a man in his early 60s, warm brown skin, friendly round-oval face, short dark hair graying at the temples, clean-shaven, no glasses, bright attentive eyes. He wears a charcoal blazer over a light blue open-collar shirt, no tie. Facing the camera straight on, head centered and level, eyes looking at the viewer, shoulders cut off by the bottom edge of the frame with a little headroom above the head. Expression: a relaxed warm half smile, mouth closed and relaxed. Soft even studio lighting, gentle shading, slightly glossy skin, detailed hair and fabric texture. Background: flat pure white (#FFFFFF) with no shadow, no gradient, no props behind the figure. No text anywhere. Square 1:1. Not a photograph; clearly an animated character.
```

## Prompt 2: open (attach the base image)

```
Edit the attached image. Change only the mouth: open it wide in the middle of speaking, as if saying "ah". Lips parted, upper teeth visible, dark mouth interior with a tongue, jaw dropped slightly. Keep everything else identical to the attached image: same framing, scale, and head position, same eyes and eyebrows, same hair, same clothing, same lighting, same skin tone, same flat white background. Do not add a second mouth. Do not change the chin outline beyond what the open mouth needs. No color shift, no stray marks near the ears or collar. Output the same size and aspect ratio as the attached image.
```

## Prompt 3: mid (attach the base image)

```
Edit the attached image. Change only the mouth: a small round "oh" shape, lips pushed slightly forward, a small dark opening, jaw dropped a little. Keep everything else identical to the attached image: same framing, scale, and head position, same eyes and eyebrows, same hair, same clothing, same lighting, same flat white background. Keep the skin tone exactly the same as the attached image around the mouth; do not warm or redden it. Do not add a second mouth. No stray marks near the ears or collar. Output the same size and aspect ratio as the attached image.
```

## Prompt 4: blink (attach the base image)

```
Edit the attached image. Change only the eyes: close both eyes in a relaxed blink, eyelids down with a soft lash line. Keep the eyebrows, mouth, and everything else identical to the attached image: same framing, scale, and head position, same hair, same clothing, same lighting, same skin tone, same flat white background. The mouth stays exactly as in the attached image. Output the same size and aspect ratio as the attached image.
```

## Workflow

1. Run Prompt 1 until the base looks right and matches the other seats' style. Download it.
2. In the same chat, attach the base and run Prompts 2, 3, and 4 one at a time. Regenerate any frame that fails the checklist.
3. Convert to 560 x 560 webp:

```bash
cwebp -q 85 -resize 560 560 pabrai-base.png -o app/public/portraits/pabrai-base.webp
cwebp -q 85 -resize 560 560 pabrai-open.png -o app/public/portraits/pabrai-open.webp
cwebp -q 85 -resize 560 560 pabrai-mid.png -o app/public/portraits/pabrai-mid.webp
cwebp -q 85 -resize 560 560 pabrai-blink.png -o app/public/portraits/pabrai-blink.webp
```

## Checklist

- Flip between base and each frame: the head must not move, scale, or tilt.
- One mouth only; no second mouth above or below.
- No green or off-color specks near the ears, collar, or hairline.
- Skin around the mouth in `mid` matches the base (no orange or red).
- The blazer and shirt collar stay identical in all four frames.
- Background pure white in all four frames.
- `blink` changes nothing but the eyes.
