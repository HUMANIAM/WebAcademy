from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
import re

TRACKING_KEYS = {
    "gclid", "fbclid", "igshid", "mc_cid", "mc_eid", "ref", "ref_src", "spm"
}

def normalize_url(raw: str) -> str:
    s = (raw or "").strip()
    if not s:
        return ""

    # Add scheme if missing
    if "://" not in s:
        s = "https://" + s

    parts = urlsplit(s)

    scheme = (parts.scheme or "https").lower()
    netloc = (parts.netloc or "").lower()

    # Remove default ports
    netloc = re.sub(r":80$", "", netloc)
    netloc = re.sub(r":443$", "", netloc)

    # Path cleanup
    path = parts.path or "/"
    path = re.sub(r"/{2,}", "/", path)
    if path != "/" and path.endswith("/"):
        path = path[:-1]

    # Drop fragment
    fragment = ""

    # Query: remove tracking params + sort
    q = []
    for k, v in parse_qsl(parts.query, keep_blank_values=True):
        kl = k.lower()
        if kl.startswith("utm_") or kl in TRACKING_KEYS:
            continue
        q.append((k, v))
    q.sort(key=lambda kv: (kv[0], kv[1]))
    query = urlencode(q, doseq=True)

    return urlunsplit((scheme, netloc, path, query, fragment))
