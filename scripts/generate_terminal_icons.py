from pathlib import Path

from PIL import Image, ImageDraw


def _scale_point(point, size, margin=0.06):
    x_norm, y_norm = point
    span = 1 - margin * 2
    return (
        margin * size + x_norm * span * size,
        margin * size + y_norm * span * size,
    )


def _draw_bracket(draw, size, stroke_color, stroke_width):
    poly_points = [(0.35, 0.18), (0.12, 0.5), (0.35, 0.82)]
    scaled_points = [_scale_point(p, size) for p in poly_points]
    draw.line(scaled_points, fill=stroke_color, width=stroke_width, joint="curve")
    radius = stroke_width / 2
    for center in scaled_points:
        x, y = center
        draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=stroke_color)


def _draw_cursor(draw, size, stroke_color, stroke_width):
    line_points = [(0.62, 0.18), (0.62, 0.82)]
    scaled_points = [_scale_point(p, size) for p in line_points]
    draw.line(scaled_points, fill=stroke_color, width=stroke_width, joint="curve")
    radius = stroke_width / 2
    for center in scaled_points:
        x, y = center
        draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=stroke_color)


def make_icon(size: int) -> Image.Image:
    stroke_width = max(int(round(size * 0.08)), 2)
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    _draw_bracket(draw, size, "#000000", stroke_width)
    _draw_cursor(draw, size, "#000000", stroke_width)
    return image


def save_pngs(base_dir: Path) -> None:
    exports = [
        (32, base_dir / "32x32.png"),
        (128, base_dir / "128x128.png"),
        (256, base_dir / "128x128@2x.png"),
        (512, base_dir / "icon.png"),
    ]
    for size, path in exports:
        path.parent.mkdir(parents=True, exist_ok=True)
        make_icon(size).save(path)


def save_icon_containers(base_dir: Path) -> None:
    max_icon = make_icon(512)
    ico_path = base_dir / "icon.ico"
    icns_path = base_dir / "icon.icns"
    sizes = [(32, 32), (128, 128), (256, 256), (512, 512)]
    max_icon.save(ico_path, sizes=sizes)
    max_icon.save(icns_path, sizes=sizes)


def main() -> None:
    target_dir = Path("src-tauri/icons")
    save_pngs(target_dir)
    save_icon_containers(target_dir)


if __name__ == "__main__":
    main()
