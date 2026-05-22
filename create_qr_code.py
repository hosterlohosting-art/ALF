from pathlib import Path

from reportlab.graphics.barcode import qr
from PIL import Image, ImageDraw


URL = "https://www.youtube.com/watch?v=Y6auo_fIrFo"
OUTPUT = Path("assets/youtube-car-accident-qr.png")


def create_static_qr_code(url: str, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)

    qr_code = qr.QrCodeWidget(url, barLevel="H")
    qr_code.qr.make()

    modules = qr_code.qr.modules
    module_count = qr_code.qr.getModuleCount()
    quiet_zone_modules = 4
    box_size = 24
    image_size = (module_count + quiet_zone_modules * 2) * box_size

    image = Image.new("RGB", (image_size, image_size), "white")
    draw = ImageDraw.Draw(image)

    for row in range(module_count):
        for col in range(module_count):
            if modules[row][col]:
                x0 = (col + quiet_zone_modules) * box_size
                y0 = (row + quiet_zone_modules) * box_size
                x1 = x0 + box_size
                y1 = y0 + box_size
                draw.rectangle((x0, y0, x1, y1), fill="black")

    image.save(output)


if __name__ == "__main__":
    create_static_qr_code(URL, OUTPUT)
    print(f"Created non-expiring static QR code: {OUTPUT.resolve()}")
