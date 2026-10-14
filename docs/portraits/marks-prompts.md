# Howard Marks seat: Gemini portrait prompts

Four frames for `app/public/portraits/`: `marks-base.webp`, `marks-open.webp`, `marks-mid.webp`, `marks-blink.webp`. Frames cross-fade, so they must line up exactly. Method and checklist: `.claude/skills/new-seat/references/portrait-prompts.md`.

## Look block (best effort, correct it before you generate)

```
LOOK: man in his late 70s, thoughtful lined face, light skin, silver-white hair neatly combed back,
thin-framed glasses, clean-shaven, calm attentive eyes, a slight reflective smile.
WARDROBE: dark navy suit jacket, white collared shirt, a muted dark blue tie.
BASE EXPRESSION: calm, reflective half smile, mouth closed.
PROP TEXT: none
```

## Prompt 1: base (run first, iterate until it is right)

```
A stylized 3D animated character portrait in the look of a modern animated feature film, head and shoulders bust of a real-world business leader drawn as a friendly caricature: a man in his late 70s, thoughtful lined face, light skin, silver-white hair neatly combed back, thin-framed glasses, clean-shaven, calm attentive eyes. He wears a dark navy suit jacket, a white collared shirt, and a muted dark blue tie. Facing the camera straight on, head centered and level, eyes looking at the viewer, shoulders cut off by the bottom edge of the frame with a little headroom above the head. Expression: a calm, reflective half smile, mouth closed and relaxed. Soft even studio lighting, gentle shading, slightly glossy skin, detailed hair and fabric texture. Background: flat pure white (#FFFFFF) with no shadow, no gradient, no props behind the figure. No text anywhere. Square 1:1. Not a photograph; clearly an animated character.
```

## Prompt 2: open (attach the base image)

```
Edit the attached image. Change only the mouth: open it wide in the middle of speaking, as if saying "ah". Lips parted, upper teeth visible, dark mouth interior with a tongue, jaw dropped slightly. Keep everything else identical to the attached image: same framing, scale, and head position, same eyes and eyebrows, same glasses, same hair, same clothing, same lighting, same skin tone, same flat white background. Do not add a second mouth. Do not change the chin outline beyond what the open mouth needs. No color shift, no stray marks near the ears or collar. Output the same size and aspect ratio as the attached image.
```

## Prompt 3: mid (attach the base image)

```
Edit the attached image. Change only the mouth: a small round "oh" shape, lips pushed slightly forward, a small dark opening, jaw dropped a little. Keep everything else identical to the attached image: same framing, scale, and head position, same eyes and eyebrows, same glasses, same hair, same clothing, same lighting, same flat white background. Keep the skin tone exactly the same as the attached image around the mouth; do not warm or redden it. Do not add a second mouth. No stray marks near the ears or collar. Output the same size and aspect ratio as the attached image.
```

## Prompt 4: blink (attach the base image)

```
Edit the attached image. Change only the eyes: close both eyes in a relaxed blink, eyelids down with a soft lash line, still visible behind the glasses. Keep the eyebrows, glasses, mouth, and everything else identical to the attached image: same framing, scale, and head position, same hair, same clothing, same lighting, same skin tone, same flat white background. The mouth stays exactly as in the attached image. Output the same size and aspect ratio as the attached image.
```

## Workflow

1. Run Prompt 1 until the base looks right and matches the other seats' style. Download it.
2. In the same chat, attach the base and run Prompts 2, 3, and 4 one at a time. Regenerate any frame that fails the checklist.
3. Convert to 560 x 560 webp:

```bash
cwebp -q 85 -resize 560 560 marks-base.png -o app/public/portraits/marks-base.webp
cwebp -q 85 -resize 560 560 marks-open.png -o app/public/portraits/marks-open.webp
cwebp -q 85 -resize 560 560 marks-mid.png -o app/public/portraits/marks-mid.webp
cwebp -q 85 -resize 560 560 marks-blink.png -o app/public/portraits/marks-blink.webp
```

## Checklist

- Flip between base and each frame: the head must not move, scale, or tilt.
- One mouth only; no second mouth above or below.
- No green or off-color specks near the ears, collar, or hairline.
- Skin around the mouth in `mid` matches the base (no orange or red).
- Glasses identical in all four frames (they tend to drift or vanish in `blink`).
- Background pure white in all four frames.
- `blink` changes nothing but the eyes.
