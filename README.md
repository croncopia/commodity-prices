# croncopia/commodity-prices

Aggregated commodity prices, rebuilt every 30 minutes from independent providers and published as static JSON — one file per commodity, no API key required, no rate limits.

## How to access the data?

Access is as simple as fetching the specific JSON file. There are multiple ways to do this depending on your caching and freshness needs — to target a specific commodity, change `metal/gold` to the relevant commodity path:

**GitHub Pages** — served as a static site, good if you want a less verbose url and a stable endpoint with predictable caching via GitHub's own CDN:
```
https://croncopia.github.io/commodity-prices/latest/metal/gold.json
```

**jsDelivr** — CDN-cached globally, fast and reliable for production use (cache typically refreshes every ~12-24h, or instantly if you pin a commit SHA instead of a branch):
```
https://cdn.jsdelivr.net/gh/croncopia/commodity-prices/latest/metal/gold.json
```

**Statically** — alternative CDN proxy, similar caching behaviour to jsDelivr, useful as a fallback or for load distribution:
```
https://cdn.statically.io/gh/croncopia/commodity-prices/main/latest/metal/gold.json
```

**Githack** — serves files with correct `Content-Type` headers, handy if you're fetching this client-side and need proper MIME types rather than `text/plain`:
```
https://raw.githack.com/croncopia/commodity-prices/main/latest/metal/gold.json
```

**GitHub raw** — direct from the repo, always reflects the latest commit, no caching layer (subject to GitHub's rate limits on heavy use):
```
https://raw.githubusercontent.com/croncopia/commodity-prices/refs/heads/main/latest/metal/gold.json
```

> [!NOTE] 
> If you need guaranteed up-to-the-minute data, use the `raw.githubusercontent.com` link. If you're optimizing for speed/uptime and can tolerate slightly stale data, the CDN options (jsDelivr, Statically, Githack) are the better choice.

## Data Structure

Each file holds a single commodity's USD price converted across the standard weight units, stamped with the moment it was generated:

```json
{
  "base": "USD",
  "price": {
    "troy_ounce": 4264.570915110066,
    "gram": 137.10913871564566,
    "kilogram": 137109.13871564565,
    "ounce": 3886.9786952403006,
    "pound": 62191.659178688475,
    "metric_ton": 137109138.71564567
  },
  "sources": 3,
  "timestamp": "2026-06-18T16:28:30.666Z"
}
```

## How it works?

1. **Fetch** — each source module pulls the latest price from its provider and normalises it to a common unit: *USD per troy ounce*.
2. **Filter** — only commodities on a defined whitelist pass into the aggregate, a single choke point that keeps unexpected or malformed symbols from a source out of the dataset.
3. **Aggregate** — sources are fetched concurrently and each may fail independently; the run continues as long as at least one source delivers. Per commodity, the prices are averaged — and when 3+ sources report, any price deviating more than 10% from the median is discarded as an outlier before averaging.
4. **Distribute** — one JSON file is written per commodity, with the averaged USD/troy-ounce price converted into the other weight units shown above.
