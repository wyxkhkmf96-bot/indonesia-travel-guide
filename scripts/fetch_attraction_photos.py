#!/usr/bin/env python3
"""Fetch and optimize real attraction photography from Wikimedia Commons."""

from __future__ import annotations

import io
import json
import sys
import time
from pathlib import Path
from urllib.parse import quote

import requests
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "indonesia" / "scenes"
API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "IndonesiaTravelGuide/1.0 (travel-guide image attribution)"}

PHOTOS = {
    "tumpak-sewu": "File:Air Terjun Tumpak Sewu.jpg",
    "kapas-biru": "File:Air Terjun Kapas Biru Lumajang (Unsplash).jpg",
    "bromo-sunrise": "File:Mount Bromo at sunrise, showing its volcanoes and Mount Semeru (background).jpg",
    "bromo-sea-of-sand": "File:Bromo-Tengger-Semeru-National-Park Indonesia Horses-02.jpg",
    "ijen-blue-fire": "File:Blue Sulfur Flames.JPG",
    "ijen-crater": "File:Kawah-Ijen Indonesia Acidious-Lake-at the-floor-of-the-crater-01.jpg",
    "batur-kintamani": "File:Mount Batur Panorama from Kintamani Bali Indonesia 2012 12.jpg",
    "leke-leke": "File:Bali - Leke Leke Waterfall (2025) - img 01.jpg",
    "ubud-valley": "File:Tegallalang Rice Terraces Bali.jpg",
    "saba-beach": "File:Pantai Saba Gianyar Bali.jpg",
    "kelingking": "File:Kelingking Beach (T-Rex Bay) of Nusa Penida, Bali (2025) - img 02.jpg",
    "broken-beach": "File:Broken Bay, Nusa Penida.jpg",
    "angels-billabong": "File:Angels Billabong (142797899).jpeg",
    "labuan-bajo": "File:Labuan Bajo, Flores, Indonesia, 20250823 0718 2839.jpg",
    "padar-island": "File:Padar Island, Komodo National Park, Indonesia, 20250822 0911 2638.jpg",
    "pink-beach": "File:Pink Beach, Padar Island, Komodo National Park.jpg",
    "komodo-dragon": "File:Varanus komodoensis, Komodo Island, Indonesia, 20250822 1319 2749.jpg",
    "taka-makassar": "File:Beautiful Taka Makassar Island.jpg",
    "manta-point": "File:Manta ray silhouette at Manta Alley.jpg",
}

EXTERNAL_PHOTOS = {
    "leke-leke-pexels-v2": {
        "url": "https://images.pexels.com/photos/18189882/pexels-photo-18189882.jpeg"
        "?cs=srgb&fm=jpg&w=1600",
        "source": "https://www.pexels.com/photo/woman-posing-near-a-waterfall-18189882/",
        "title": "Leke Leke Waterfall",
        "author": "Patrick Gamelkoorn",
        "license": "Pexels License",
    },
    "kintamani-akasa-lunch": {
        "url": "https://wisatamilenial.com/wp-content/uploads/2021/11/"
        "Makanan-dan-View-di-Akasa-Kintamani-Coffee-Image-From-%40meylnd__.jpg",
        "source": "https://wisatamilenial.com/akasa-kintamani-coffe/",
        "title": "Lunch with Mount Batur view at AKASA Kintamani",
        "author": "@meylnd__ via Wisata Milenial",
        "license": "Source-linked editorial reference",
    },
}


def clean_metadata(value: dict | None) -> str:
    if not value:
        return ""
    text = value.get("value", "")
    return " ".join(text.replace("<br />", " ").replace("<br>", " ").split())


def save_optimized_image(content: bytes, destination: Path) -> None:
    image = Image.open(io.BytesIO(content))
    image = ImageOps.exif_transpose(image).convert("RGB")
    if image.width > 1600:
        height = round(image.height * 1600 / image.width)
        image = image.resize((1600, height), Image.Resampling.LANCZOS)
    image.save(destination, quality=82, optimize=True, progressive=True)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    manifest_path = OUTPUT / "sources.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    requested = set(sys.argv[1:]) or set(PHOTOS)
    unknown = requested.difference(PHOTOS | EXTERNAL_PHOTOS)
    if unknown:
        raise SystemExit(f"unknown photo slug(s): {', '.join(sorted(unknown))}")
    for slug, photo in EXTERNAL_PHOTOS.items():
        if slug not in requested:
            continue
        destination = OUTPUT / f"{slug}.jpg"
        if not destination.exists():
            response = requests.get(photo["url"], headers=HEADERS, timeout=45)
            response.raise_for_status()
            save_optimized_image(response.content, destination)
        manifest[slug] = {
            "title": photo["title"],
            "source": photo["source"],
            "author": photo["author"],
            "license": photo["license"],
        }
        manifest_path.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"saved {slug}.jpg")
    for slug, title in PHOTOS.items():
        if slug not in requested:
            continue
        response = requests.get(
            API,
            params={
                "action": "query",
                "titles": title,
                "prop": "imageinfo",
                "iiprop": "url|extmetadata",
                "iiurlwidth": "1800",
                "format": "json",
                "formatversion": "2",
            },
            headers=HEADERS,
            timeout=30,
        )
        response.raise_for_status()
        page = response.json()["query"]["pages"][0]
        info = page["imageinfo"][0]
        filename = title.removeprefix("File:")
        image_url = f"https://commons.wikimedia.org/wiki/Special:Redirect/file/{quote(filename)}?width=1600"
        destination = OUTPUT / f"{slug}.jpg"
        if not destination.exists():
            image_response = None
            for delay in (0.5, 2, 8):
                time.sleep(delay)
                image_response = requests.get(image_url, headers=HEADERS, timeout=45)
                if image_response.status_code != 429:
                    break
            image_response.raise_for_status()

            save_optimized_image(image_response.content, destination)

        metadata = info.get("extmetadata", {})
        manifest[slug] = {
            "title": title.removeprefix("File:"),
            "source": info["descriptionurl"],
            "author": clean_metadata(metadata.get("Artist")),
            "license": clean_metadata(metadata.get("LicenseShortName")),
        }
        manifest_path.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"saved {slug}.jpg")


if __name__ == "__main__":
    main()
