#!/usr/bin/env python3
"""Generate focused, static daily route maps from CARTO/OSM tiles."""

from __future__ import annotations

import io
import math
import time
from pathlib import Path

import requests
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "maps" / "daily"
CACHE = ROOT / ".map-tile-cache"
WIDTH, HEIGHT = 1600, 900
TILE = 512

COLORS = {
    "road": "#E6644E",
    "boat": "#27345F",
    "flight": "#D9A13B",
    "ink": "#173F38",
    "paper": "#FFF9ED",
    "muted": "#61706B",
}

DAYS = [
    {
        "day": 1,
        "route": "上海 → 泗水",
        "points": [("上海浦东", 121.805, 31.144), ("泗水机场", 112.787, -7.379), ("泗水酒店", 112.735, -7.289)],
        "segments": ["flight", "road"],
    },
    {
        "day": 2,
        "route": "泗水 → 赛武瀑布 → 布罗莫",
        "points": [("泗水", 112.735, -7.289), ("赛武瀑布", 112.917, -8.230), ("Blue Cotton", 112.920, -8.215), ("布罗莫", 112.953, -7.943)],
        "segments": ["road", "road", "road"],
        "clusters": [([2, 3], "赛武瀑布群")],
    },
    {
        "day": 3,
        "route": "布罗莫 → 外南梦",
        "points": [("布罗莫酒店", 112.953, -7.943), ("观景台", 112.950, -7.907), ("火山口", 112.950, -7.942), ("外南梦", 114.369, -8.219)],
        "segments": ["road", "road", "road"],
        "clusters": [([1, 2, 3], "布罗莫景区")],
    },
    {
        "day": 4,
        "route": "外南梦 → 伊真 → 巴厘岛北部",
        "points": [("外南梦", 114.369, -8.219), ("伊真火山", 114.242, -8.058), ("吉打邦港", 114.402, -8.160), ("吉利马努克", 114.437, -8.165), ("洛维纳", 115.024, -8.161)],
        "segments": ["road", "road", "boat", "road"],
        "clusters": [([1, 3, 4], "外南梦 / 轮渡码头")],
    },
    {
        "day": 5,
        "route": "洛维纳 → 金塔马尼 → 乌布",
        "points": [("洛维纳", 115.024, -8.161), ("金塔马尼", 115.354, -8.245), ("Leke Leke", 115.133, -8.330), ("乌布", 115.263, -8.506)],
        "segments": ["road", "road", "road"],
    },
    {
        "day": 6,
        "route": "乌布 → ATV → 黑沙滩 → 乌布",
        "points": [("乌布", 115.263, -8.506), ("ATV 山谷", 115.279, -8.451), ("Saba 黑沙滩", 115.298, -8.604), ("乌布", 115.263, -8.506)],
        "segments": ["road", "road", "road"],
        "clusters": [([1, 4], "乌布")],
    },
    {
        "day": 7,
        "route": "乌布 → 佩尼达西线 → 沙努尔",
        "points": [("乌布", 115.263, -8.506), ("Sanur 港", 115.263, -8.690), ("精灵坠崖", 115.474, -8.751), ("Broken Beach", 115.450, -8.733), ("Sanur", 115.263, -8.690)],
        "segments": ["road", "boat", "road", "boat"],
        "clusters": [([2, 5], "Sanur 港")],
    },
    {
        "day": 8,
        "route": "沙努尔 → 巴厘机场 → 拉布安巴焦",
        "points": [("Sanur", 115.263, -8.690), ("巴厘机场", 115.167, -8.748), ("拉布安巴焦", 119.889, -8.496)],
        "segments": ["road", "flight"],
    },
    {
        "day": 9,
        "route": "科莫多国家公园一日环线",
        "points": [("拉布安巴焦", 119.889, -8.496), ("Padar", 119.592, -8.655), ("粉色沙滩", 119.548, -8.603), ("科莫多岛", 119.492, -8.589), ("Taka / Manta", 119.606, -8.530), ("拉布安巴焦", 119.889, -8.496)],
        "segments": ["boat", "boat", "boat", "boat", "boat"],
        "clusters": [([1, 6], "拉布安巴焦")],
    },
    {
        "day": 10,
        "route": "拉布安巴焦 → 新加坡 → 上海",
        "points": [("拉布安巴焦", 119.889, -8.496), ("新加坡", 103.991, 1.364), ("上海浦东", 121.805, 31.144)],
        "segments": ["flight", "flight"],
    },
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size, index=1 if bold else 0)
        except OSError:
            continue
    return ImageFont.load_default()


def world_xy(lon: float, lat: float, zoom: int) -> tuple[float, float]:
    lat = max(-85.0511, min(85.0511, lat))
    scale = TILE * (2**zoom)
    x = (lon + 180.0) / 360.0 * scale
    sin_lat = math.sin(math.radians(lat))
    y = (0.5 - math.log((1 + sin_lat) / (1 - sin_lat)) / (4 * math.pi)) * scale
    return x, y


def choose_zoom(points: list[tuple[str, float, float]]) -> int:
    for zoom in range(12, 2, -1):
        xy = [world_xy(lon, lat, zoom) for _, lon, lat in points]
        width = max(x for x, _ in xy) - min(x for x, _ in xy)
        height = max(y for _, y in xy) - min(y for _, y in xy)
        if width <= WIDTH * 0.67 and height <= HEIGHT * 0.58:
            return zoom
    return 3


def tile_image(zoom: int, tx: int, ty: int) -> Image.Image:
    count = 2**zoom
    tx = tx % count
    ty = max(0, min(count - 1, ty))
    cache_file = CACHE / str(zoom) / str(tx) / f"{ty}.png"
    if cache_file.exists():
        return Image.open(cache_file).convert("RGB")
    cache_file.parent.mkdir(parents=True, exist_ok=True)
    url = f"https://a.basemaps.cartocdn.com/light_all/{zoom}/{tx}/{ty}@2x.png"
    response = requests.get(
        url,
        headers={"User-Agent": "IndonesiaTravelGuide/1.0 (static trip map)"},
        timeout=20,
    )
    response.raise_for_status()
    cache_file.write_bytes(response.content)
    time.sleep(0.04)
    return Image.open(io.BytesIO(response.content)).convert("RGB")


def dashed_line(draw: ImageDraw.ImageDraw, points: list[tuple[float, float]], fill: str, width: int, dash: int, gap: int) -> None:
    for start, end in zip(points, points[1:]):
        dx, dy = end[0] - start[0], end[1] - start[1]
        length = math.hypot(dx, dy)
        if not length:
            continue
        ux, uy = dx / length, dy / length
        cursor = 0.0
        while cursor < length:
            stop = min(cursor + dash, length)
            draw.line(
                [(start[0] + ux * cursor, start[1] + uy * cursor), (start[0] + ux * stop, start[1] + uy * stop)],
                fill=fill,
                width=width,
            )
            cursor += dash + gap


def segment_curve(start: tuple[float, float], end: tuple[float, float], curved: bool) -> list[tuple[float, float]]:
    if not curved:
        return [start, end]
    mx, my = (start[0] + end[0]) / 2, (start[1] + end[1]) / 2
    dx, dy = end[0] - start[0], end[1] - start[1]
    length = math.hypot(dx, dy)
    bend = min(110, max(45, length * 0.12))
    cx, cy = mx + (-dy / max(length, 1)) * bend, my + (dx / max(length, 1)) * bend
    curve = []
    for i in range(41):
        t = i / 40
        x = (1 - t) ** 2 * start[0] + 2 * (1 - t) * t * cx + t**2 * end[0]
        y = (1 - t) ** 2 * start[1] + 2 * (1 - t) * t * cy + t**2 * end[1]
        curve.append((x, y))
    return curve


def label_box(draw: ImageDraw.ImageDraw, xy: tuple[float, float], text: str, anchor: str, gap: float = 30) -> None:
    label_font = font(28, True)
    bbox = draw.textbbox((0, 0), text, font=label_font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x, y = xy
    if anchor == "left":
        x -= tw + gap
    else:
        x += gap
    y -= th / 2 + 4
    pad_x, pad_y = 12, 8
    draw.rounded_rectangle(
        (x - pad_x, y - pad_y, x + tw + pad_x, y + th + pad_y),
        radius=7,
        fill=(255, 249, 237, 235),
        outline=(23, 63, 56, 60),
        width=1,
    )
    draw.text((x, y), text, font=label_font, fill=COLORS["ink"])


def render(day: dict) -> None:
    zoom = choose_zoom(day["points"])
    projected = [world_xy(lon, lat, zoom) for _, lon, lat in day["points"]]
    center_x = (min(x for x, _ in projected) + max(x for x, _ in projected)) / 2
    center_y = (min(y for _, y in projected) + max(y for _, y in projected)) / 2
    left, top = center_x - WIDTH / 2, center_y - HEIGHT / 2

    canvas = Image.new("RGB", (WIDTH, HEIGHT), COLORS["paper"])
    min_tx = math.floor(left / TILE)
    max_tx = math.floor((left + WIDTH) / TILE)
    min_ty = math.floor(top / TILE)
    max_ty = math.floor((top + HEIGHT) / TILE)
    for tx in range(min_tx, max_tx + 1):
        for ty in range(min_ty, max_ty + 1):
            tile = tile_image(zoom, tx, ty)
            canvas.paste(tile, (round(tx * TILE - left), round(ty * TILE - top)))

    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    points = [(x - left, y - top) for x, y in projected]

    for index, kind in enumerate(day["segments"]):
        path = segment_curve(points[index], points[index + 1], kind == "flight")
        draw.line(path, fill=(255, 249, 237, 220), width=15, joint="curve")
        if kind == "road":
            draw.line(path, fill=COLORS[kind], width=8, joint="curve")
        elif kind == "boat":
            dashed_line(draw, path, COLORS[kind], 8, 20, 14)
        else:
            dashed_line(draw, path, COLORS[kind], 8, 10, 15)

    number_font = font(26, True)
    clusters = day.get("clusters", [])
    clustered_indexes = {index for indexes, _ in clusters for index in indexes}
    markers = []
    for indexes, cluster_label in clusters:
        selected = [points[index - 1] for index in indexes]
        markers.append(
            (
                "·".join(str(index) for index in indexes),
                cluster_label,
                (sum(x for x, _ in selected) / len(selected), sum(y for _, y in selected) / len(selected)),
            )
        )
    for index, ((name, _, _), point) in enumerate(zip(day["points"], points), start=1):
        if index not in clustered_indexes:
            markers.append((str(index), name, point))

    markers.sort(key=lambda item: int(item[0].split("·")[0]))
    label_sides = ["right", "left", "right", "left", "right", "left"]
    for marker_index, (number, name, point) in enumerate(markers):
        x, y = point
        tb = draw.textbbox((0, 0), number, font=number_font)
        number_width = tb[2] - tb[0]
        marker_half = max(23, number_width / 2 + 13)
        draw.rounded_rectangle(
            (x - marker_half, y - 23, x + marker_half, y + 23),
            radius=23,
            fill=COLORS["ink"],
            outline=COLORS["paper"],
            width=6,
        )
        draw.text((x - (tb[2] - tb[0]) / 2, y - (tb[3] - tb[1]) / 2 - 2), number, font=number_font, fill="#FFFFFF")
        side = label_sides[marker_index % len(label_sides)]
        if x < 260:
            side = "right"
        elif x > WIDTH - 320:
            side = "left"
        label_box(draw, point, name, side, marker_half + 10)

    legend_font = font(24, True)
    small_font = font(20)
    draw.rounded_rectangle((34, 30, 520, 112), radius=10, fill=(255, 249, 237, 235))
    draw.text((58, 48), f"DAY {day['day']:02d}", font=legend_font, fill=COLORS["road"])
    draw.text((188, 48), day["route"], font=small_font, fill=COLORS["ink"])

    legend_x = WIDTH - 438
    draw.rounded_rectangle((legend_x, 30, WIDTH - 34, 112), radius=10, fill=(255, 249, 237, 235))
    for offset, (kind, label) in enumerate([("road", "陆路"), ("boat", "船"), ("flight", "飞行")]):
        x = legend_x + 24 + offset * 126
        y = 70
        if kind == "road":
            draw.line((x, y, x + 38, y), fill=COLORS[kind], width=6)
        else:
            dashed_line(draw, [(x, y), (x + 38, y)], COLORS[kind], 6, 8, 6)
        draw.text((x + 48, y - 15), label, font=small_font, fill=COLORS["ink"])

    attribution = "路线示意，非导航 · © OpenStreetMap contributors · © CARTO"
    abox = draw.textbbox((0, 0), attribution, font=small_font)
    draw.rounded_rectangle(
        (WIDTH - (abox[2] - abox[0]) - 58, HEIGHT - 50, WIDTH - 20, HEIGHT - 14),
        radius=6,
        fill=(255, 249, 237, 225),
    )
    draw.text((WIDTH - (abox[2] - abox[0]) - 40, HEIGHT - 45), attribution, font=small_font, fill=COLORS["muted"])

    canvas = Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    canvas.save(OUTPUT / f"day-{day['day']:02d}.jpg", quality=88, optimize=True, progressive=True)


if __name__ == "__main__":
    for itinerary_day in DAYS:
        render(itinerary_day)
        print(f"generated day-{itinerary_day['day']:02d}.jpg")
