# Local Media Server

Show photos and videos from your laptop on another device, such as a phone, tablet, Android TV, smart TV browser, or a Chromecast-cast browser tab.

This project scans a local `media/` folder, starts a small web server, and lets other devices on the same Wi-Fi open the viewer using your laptop IP address and port.

## Features

- Shows local images and videos in a full-screen viewer
- Works over your home Wi-Fi using your laptop IP address
- Supports keyboard and button navigation
- Protects the viewer with a 4-character access code
- Automatically scans the `media/` folder when the page is refreshed

## Supported Files

Images:

```text
.jpg
.jpeg
.png
.webp
.gif
```

Videos:

```text
.mp4
.webm
.ogg
```

## Requirements

Install Node.js first:

```text
https://nodejs.org/
```

Then install project packages:

```bash
npm install
```

## Add Your Media

Put your photos and videos inside the `media/` folder:

```text
media/
  holiday-photo.jpg
  family-video.mp4
  movie-clip.webm
```

## Start The Server

The default port is `3000`.

```bash
npm start
```

Open this on the laptop:

```text
http://localhost:3000
```

The default 4-character code is:

```text
CODE
```

## Use A Custom Code

The code must be exactly 4 characters.

On Windows PowerShell:

```powershell
$env:MEDIA_CODE="1234"
npm start
```

On macOS/Linux:

```bash
MEDIA_CODE=1234 npm start
```

## Use A Different Port

If port `3000` is already being used, choose another port, for example `3100`.

On Windows PowerShell:

```powershell
$env:PORT=3100
$env:MEDIA_CODE="1234"
npm start
```

On macOS/Linux:

```bash
PORT=3100 MEDIA_CODE=1234 npm start
```

Then open:

```text
http://localhost:3100
```

## Open On Another Device

Your TV, phone, or tablet must be connected to the same Wi-Fi as your laptop.

Find your laptop IP address.

On Windows:

```powershell
ipconfig
```

Look for `IPv4 Address`, for example:

```text
192.168.1.7
```

If the server is running on port `3000`, open this on the other device:

```text
http://192.168.1.7:3000
```

If the server is running on port `3100`, open:

```text
http://192.168.1.7:3100
```

Enter your 4-character code, then the image/video viewer will open.

## Chromecast Usage

You can use this in two common ways:

1. Open the viewer in Chrome on your laptop, then cast the browser tab to Chromecast.
2. Open the laptop IP address directly in a TV browser or Android TV browser.

For tab casting, `http://localhost:3000` is usually enough because the laptop is the device opening the page.

For another device opening the page directly, use your laptop IP address:

```text
http://YOUR-LAPTOP-IP:PORT
```

Example:

```text
http://192.168.1.7:3000
```

## Navigation

- Click the left button to go to the previous file
- Click the right button to go to the next file
- Press `ArrowLeft` or `ArrowRight` on a keyboard

## Refresh After Adding Files

If you add or remove files from `media/`, refresh the browser page. The server scans the folder again and updates the list.

## Security Notes

This is meant for private local network use.

- Do not port-forward this server from your router.
- Do not run it on public Wi-Fi.
- Anyone on the same Wi-Fi who knows the IP, port, and code can view the media.
- Stop the server when you are done.
- Do not put highly sensitive files in `media/` unless you trust the local network.

## Stop The Server

Press:

```text
Ctrl + C
```

in the terminal where the server is running.

