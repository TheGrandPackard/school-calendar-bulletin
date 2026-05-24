# School Bulletin

A tiny static website for an elementary school. Parents see:

- An embedded **Google Calendar** of school events.
- A list of **bulletin PDFs** that admins drop into a shared Google Drive folder.

No backend. No database. No login on the site. Admins manage everything inside Google Calendar and Google Drive — tools they already know.

## How it works

```
Browser ──► index.html (static)
              ├─ <iframe> Google Calendar  (public embed)
              └─ Drive API v3 → list PDFs in folder → render
```

## One-time setup

### 1. Google Calendar

1. In [Google Calendar](https://calendar.google.com), open or create the calendar to use.
2. Open the calendar's **Settings and sharing**.
3. Under **Access permissions for events**, check **Make available to public** → *See all event details*.
4. Under **Share with specific people**, add school staff with **Make changes to events**.
5. Scroll to **Integrate calendar** and copy the URL from inside `src="..."` in the *Embed code* block.

### 2. Google Drive folder

1. In [Google Drive](https://drive.google.com), create a folder (e.g. "School Bulletins").
2. **Share** → **General access** → *Anyone with the link* → **Viewer**.
3. Also share with school staff as **Editor** so they can upload PDFs.
4. Copy the folder ID from the URL: `drive.google.com/drive/folders/<FOLDER_ID>`.

### 3. Google Cloud API key (free)

1. Open [Google Cloud Console](https://console.cloud.google.com), create a new project.
2. **APIs & Services → Library** → enable **Google Drive API**.
3. **APIs & Services → Credentials** → **Create credentials → API key**.
4. Edit the key and add restrictions (this is what keeps the key safe in client code):
   - **Application restrictions** → *HTTP referrers* → add the site's URL pattern, e.g. `https://<your-user>.github.io/*` (and `http://localhost:*/*` for local testing).
   - **API restrictions** → *Restrict key* → select **Google Drive API**.

### 4. Configure

Open `config.js` and fill in the four values:

```js
window.SchoolBulletinConfig = {
  SCHOOL_NAME: "Lincoln Elementary",
  CALENDAR_EMBED_SRC: "https://calendar.google.com/calendar/embed?src=...",
  DRIVE_FOLDER_ID: "1AbC...XyZ",
  DRIVE_API_KEY: "AIza...",
};
```

### 5. Deploy on GitHub Pages

```sh
git init
git add .
git commit -m "Initial site"
# Create an empty repo on GitHub, then:
git remote add origin git@github.com:<you>/<repo>.git
git branch -M main
git push -u origin main
```

In GitHub → **Settings → Pages**, set *Source* to **Deploy from a branch**, branch **main**, folder **/ (root)**. Wait ~1 minute and visit the published URL.

## How admins use it

- **Add an event** → add it in Google Calendar. It appears on the site immediately.
- **Add a bulletin** → drag a PDF into the shared Google Drive folder. It appears at the top of the list on the next page load. Use a descriptive filename — that's what parents see (e.g. `Spring Concert Reminder.pdf`).
- **Remove a bulletin** → move the PDF out of the folder or to Trash.

## Local preview

Open a terminal in this folder and run a tiny static server (any will do):

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Make sure your API key's referrer restriction includes `http://localhost:*/*` while testing.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure |
| `styles.css` | Look and feel |
| `app.js` | Loads bulletins from Drive |
| `config.js` | The only file you need to edit per deployment |
# school-calendar-bulletin
