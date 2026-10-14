"""Build the ready-to-post example PNG; browser editor remains the editable source."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


HERE = Path(__file__).resolve().parent
OUT = HERE / "valmis-mainos.png"
W = H = 1080
BLACK = "#000000"
GOLD = "#c8ae4d"
PAPER = "#f6f4ef"
INK = "#171914"
HEAVY = r"C:\Windows\Fonts\impact.ttf"
BOLD = r"C:\Windows\Fonts\arialbd.ttf"


def font(size, heavy=False):
    return ImageFont.truetype(HEAVY if heavy else BOLD, size)


def fitted(draw, value, max_width, size, heavy=False):
    while size > 18 and draw.textbbox((0, 0), value, font=font(size, heavy))[2] > max_width:
        size -= 1
    return font(size, heavy)


def line(draw, value, x, y, size, color, max_width, heavy=False):
    draw.text((x, y), value, font=fitted(draw, value, max_width, size, heavy), fill=color)


def build():
    image = Image.new("RGB", (W, H), BLACK)
    photo = ImageOps.fit(Image.open(HERE / "default.webp").convert("RGB"),
                         (515, 688), Image.Resampling.LANCZOS, centering=(0.37, 0.5))
    image.paste(photo, (565, 0))
    fade = Image.new("RGBA", (515, 688), (0, 0, 0, 0))
    overlay = ImageDraw.Draw(fade)
    for x in range(175):
        opacity = round(220 * (1 - x / 175))
        overlay.line((x, 0, x, 688), fill=(0, 0, 0, opacity))
    image.paste(fade, (565, 0), fade)
    draw = ImageDraw.Draw(image)
    draw.rectangle((557, 0, 565, 688), fill=GOLD)
    draw.rectangle((0, 688, W, 697), fill=GOLD)
    draw.rectangle((0, 697, W, 975), fill=PAPER)
    draw.rectangle((48, 847, 1032, 849), fill="#cfcfc5")

    logo = Image.open(HERE.parent / "assets" / "capra-logo-light.jpeg").convert("RGB")
    logo = logo.resize((250, 250), Image.Resampling.LANCZOS)
    image.paste(logo, (25, 4))
    draw = ImageDraw.Draw(image)
    line(draw, "ARVONTA", 291, 88, 40, GOLD, 260)
    line(draw, "VOITA", 46, 246, 125, PAPER, 492, True)
    line(draw, "PERUSKURSSI", 47, 366, 75, PAPER, 492, True)
    line(draw, "SINULLE JA", 48, 463, 61, PAPER, 492, True)
    line(draw, "KAVERILLE", 45, 533, 91, GOLD, 492, True)
    line(draw, "2 PERUSKURSSIPAIKKAA", 49, 722, 48, INK, 980, True)
    line(draw, "ARVO 240 €", 51, 782, 46, GOLD, 980)
    line(draw, "TYKKÄÄ + JAA + KOMMENTOI", 49, 863, 47, INK, 980, True)
    line(draw, "Kenet ottaisit mukaan?", 51, 918, 34, INK, 980)
    line(draw, "OSALLISTUMINEN PÄÄTTYY 24.11.", 49, 1000, 34, PAPER, 982)
    image.save(OUT, "PNG", optimize=True)
    print(OUT)


if __name__ == "__main__":
    build()

