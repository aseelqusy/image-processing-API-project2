# Image Resizing API

---

## Recuirments

- Node.js 18+
- npm

## How to run it

```bash

npm run dev

# http://localhost:3000/health  → {"ok":true}
```

## Scripts

```bash
npm run format
npm run lint
npm test
npm run build
npm start
```

## EndPoints

--GET

```bash
http://localhost:3000/health
http://localhost:3000/api/images?filename=sample.jpg&width=300&height=300
```

NOTE : the integrated file will appear in the rout of the project

--POST

```bash
$dir  = "C:\Users\DELL\image-api\storage\originals"
$file = Join-Path $dir "sample.jpg"
$b64  = [Convert]::ToBase64String([IO.File]::ReadAllBytes($file))
$body = @{ filename = "sample-post.jpg"; data = $b64 } | ConvertTo-Json
Invoke-WebRequest "http://localhost:3000/api/images" -Method POST -ContentType "application/json" -Body $body
```

NOTE : the integrated file will appear in this path storage/originals/sample-post.jpg

--PUT

```bash
$b64new  = [Convert]::ToBase64String([IO.File]::ReadAllBytes(".\sample-300x300.jpg"))
$bodyPut = @{ filename = "sample.jpg"; data = $b64new } | ConvertTo-Json
Invoke-WebRequest "http://localhost:3000/api/images" -Method PUT -ContentType "application/json" -Body $bodyPut
```

NOTE : this will update sample.jpg and clean the cache folder

--DELETE

```bash
Invoke-WebRequest "http://localhost:3000/api/images/sample-post.jpg" -Method DELETE
```

Note : this will delete the image
