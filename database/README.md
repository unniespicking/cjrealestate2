# /database

This is the application's filesystem database. The folder is server-side only — never served to the browser directly.

## Files

- **`properties.csv`** — every property listing. One row per property. Auto-generated from `lib/data/properties.ts` on first server start.
- **`sessions.json`** — active and pending staff auth tokens.
- **`photos/`** — uploaded property photos, organised by property ID. Served via `/api/photo/[...path]`.

## CSV schema

```
id,action,address,suburb,postcode,price,priceNumeric,beds,baths,cars,area,
propertyType,heading,description,features,photos,agent,lat,lng,availableFrom,inspectionSlots
```

Complex fields are JSON-encoded inside a quoted CSV cell:

- `features` → `["Pool","Concierge"]`
- `photos` → `["rho-001/1.jpg","https://example.com/external.jpg"]` (mix of local paths and external URLs)
- `inspectionSlots` → `[{"date":"Sat","start":"10:00","end":"10:30"}]`

Local photo paths are resolved at render time to `/api/photo/{path}`. External URLs (starting with `http`) are used as-is — handy for stock or Domain CDN images.

## Editing

Three ways:

1. **Web UI**: log in at `/portal/login` → `/portal/staff/listings` → New / Edit / Delete. Each action posts to Slack and updates the CSV.
2. **Direct CSV edit**: open `properties.csv` in Excel / Numbers / Google Sheets. Save. Restart dev server (or hit any data route) and changes are picked up.
3. **API**: `POST /api/properties` (create), `PATCH /api/properties/[id]` (update), `DELETE /api/properties/[id]`.

## Reset

Delete `properties.csv` — it'll be re-seeded from `lib/data/properties.ts` on next server access.
