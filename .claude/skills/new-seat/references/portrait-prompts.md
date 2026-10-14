# Portrait prompts (Gemini)

The room shows each seat as a cartoon bust and swaps between four frames by opacity: `base` while idle, `open` and `mid` while the seat speaks, `blink` for idle blinks. Because the frames cross-fade on top of each other, **they must line up exactly**: same crop, same head position, same lighting, same skin tone. Only the mouth (open, mid) or the eyes (blink) may change.

Files: `app/public/portraits/<key>-base.webp`, `-open.webp`, `-mid.webp`, `-blink.webp`. Existing frames are 560 x 560, a head-and-shoulders 3D animated bust on a flat white background (see `buffett-base.webp`).

## Fill the look block first

Write one short block of visual facts, from the person's public photos and sources. Use traits, never the name, so the prompt does not trip a real-person filter and the result reads as a caricature.

```
LOOK: <age range>, <face shape>, <skin tone>, <hair: length, color, style>, <facial hair or none>,
<glasses or none>, <one or two signature features>.
WARDROBE: <the outfit they are known for>, <any cap or prop, with its exact text if it has text>.
BASE EXPRESSION: <their resting look: warm half smile, serious, amused>, mouth closed.
```

Show the block to the user in the report and invite corrections. The descriptors are best effort.

## Prompt 1: base (run first, iterate until it is right)

```
A stylized 3D animated character portrait in the look of a modern animated feature film, head and
shoulders bust of a real-world business leader drawn as a friendly caricature: {LOOK}. {WARDROBE}.
Facing the camera straight on, head centered and level, eyes looking at the viewer, shoulders cut
off by the bottom edge of the frame with a little headroom above the head. Expression: {BASE
EXPRESSION}, mouth closed and relaxed. Soft even studio lighting, gentle shading, slightly glossy
skin, detailed hair and fabric texture. Background: flat pure white (#FFFFFF) with no shadow, no
gradient, no props behind the figure. No text anywhere except {PROP TEXT, or "none"}. Square 1:1.
Not a photograph; clearly an animated character.
```

Pick the best result and keep that chat open. Every other frame is an edit of this image.

## Prompt 2: open (attach the base image)

```
Edit the attached image. Change only the mouth: open it wide in the middle of speaking, as if
saying "ah". Lips parted, upper teeth visible, dark mouth interior with a tongue, jaw dropped
slightly. Keep everything else identical to the attached image: same framing, scale, and head
position, same eyes and eyebrows, same hair, same clothing, same lighting, same skin tone, same
flat white background. Do not add a second mouth. Do not change the {facial hair or chin outline,
if any} beyond what the open mouth needs. No color shift, no stray marks near the ears or collar.
Output the same size and aspect ratio as the attached image.
```

## Prompt 3: mid (attach the base image)

```
Edit the attached image. Change only the mouth: a small round "oh" shape, lips pushed slightly
forward, a small dark opening, jaw dropped a little. Keep everything else identical to the
attached image: same framing, scale, and head position, same eyes and eyebrows, same hair, same
clothing, same lighting, same flat white background. Keep the skin tone exactly the same as the
attached image around the mouth; do not warm or redden it. Do not add a second mouth. No stray
marks near the ears or collar. Output the same size and aspect ratio as the attached image.
```

## Prompt 4: blink (attach the base image)

```
Edit the attached image. Change only the eyes: close both eyes in a relaxed blink, eyelids down
with a soft lash line. Keep the eyebrows, mouth, and everything else identical to the attached
image: same framing, scale, and head position, same hair, same clothing, same lighting, same skin
tone, same flat white background. The mouth stays exactly as in the attached image. Output the
same size and aspect ratio as the attached image.
```

## Workflow

1. Run Prompt 1 until the base looks like the person and matches the other seats' style. Download it.
2. In the same chat, attach the base and run Prompts 2, 3, and 4 one at a time. Regenerate any frame that fails the checklist below.
3. Convert each frame to 560 x 560 webp:

```bash
cwebp -q 85 -resize 560 560 <key>-base.png -o app/public/portraits/<key>-base.webp
cwebp -q 85 -resize 560 560 <key>-open.png -o app/public/portraits/<key>-open.webp
cwebp -q 85 -resize 560 560 <key>-mid.png -o app/public/portraits/<key>-mid.webp
cwebp -q 85 -resize 560 560 <key>-blink.png -o app/public/portraits/<key>-blink.webp
```

## Checklist (the failures that have shipped before)

- Flip between base and each frame at the same size: the head must not move, scale, or tilt.
- One mouth only. No second mouth below or above the real one.
- No green or off-color specks near the ears, collar, or hairline.
- The skin around the mouth in `mid` matches the base (no orange or red face on the "oh").
- The background is pure white in all four frames.
- `blink` changes nothing but the eyes.

## If Gemini will not hold the framing

Keep the base, take only the changed region from the edited frame, and composite it onto the base. Pillow is enough:

```python
from PIL import Image, ImageDraw, ImageFilter
base = Image.open("key-base.png").convert("RGB")
edit = Image.open("key-open.png").convert("RGB").resize(base.size)
mask = Image.new("L", base.size, 0)
# box around the mouth (open, mid) or the eyes (blink), in pixels of the 1:1 image
ImageDraw.Draw(mask).ellipse((x0, y0, x1, y1), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(12))
Image.composite(edit, base, mask).save("key-open-fixed.png")
```

Keep the box tight and on skin and facial hair only, and match the tone to the base before saving.

## If Gemini refuses

Remove any trait that reads as an identity claim, keep the cartoon style words, and try again. Or attach a reference photo the user has the right to use and ask for a stylized animated character "inspired by the attached photo". Do not tell the user to work around a block by naming the person if the descriptors alone were refused.
