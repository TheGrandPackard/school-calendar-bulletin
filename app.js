(function () {
  const cfg = window.SchoolBulletinConfig || {};

  document.addEventListener("DOMContentLoaded", () => {
    setSchoolName(cfg.SCHOOL_NAME);
    setCalendar(cfg.CALENDAR_EMBED_SRC);
    loadBulletins(cfg.DRIVE_FOLDER_ID, cfg.DRIVE_API_KEY);
  });

  function setSchoolName(name) {
    if (!name) return;
    const el = document.getElementById("school-name");
    if (el) el.textContent = name;
    document.title = name + " — Bulletin";
  }

  function setCalendar(src) {
    const frame = document.getElementById("calendar-frame");
    const fallback = document.getElementById("calendar-fallback");
    if (!src || !src.startsWith("http")) {
      frame.hidden = true;
      if (fallback) fallback.hidden = false;
      return;
    }
    // Google Calendar's month view is unreadable at phone widths.
    // Switch to AGENDA (schedule list) when the viewport is narrow.
    const narrow = window.matchMedia("(max-width: 640px)").matches;
    if (narrow && !/[?&]mode=/i.test(src)) {
      src += (src.includes("?") ? "&" : "?") + "mode=AGENDA";
      document.querySelector(".calendar-wrap")?.classList.add("agenda");
    }
    frame.src = src;
  }

  async function loadBulletins(folderId, apiKey) {
    const status = document.getElementById("bulletins-status");
    const list = document.getElementById("bulletins");

    if (!folderId || !apiKey) {
      status.textContent =
        "Bulletins aren't configured yet. See README.md for setup steps.";
      return;
    }

    const q =
      `'${folderId}' in parents and ` +
      `mimeType = 'application/pdf' and ` +
      `trashed = false`;
    const params = new URLSearchParams({
      q,
      orderBy: "modifiedTime desc",
      fields: "files(id,name,modifiedTime,webViewLink)",
      pageSize: "100",
      key: apiKey,
    });
    const url = "https://www.googleapis.com/drive/v3/files?" + params.toString();

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const files = data.files || [];

      if (files.length === 0) {
        status.textContent = "No bulletins yet — check back soon.";
        return;
      }

      status.hidden = true;
      const fmt = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      for (const f of files) {
        list.appendChild(renderBulletin(f, fmt));
      }
    } catch (err) {
      console.error("Bulletin load failed:", err);
      status.textContent =
        "Bulletins couldn't load right now. Please try again later.";
    }
  }

  function renderBulletin(file, fmt) {
    const li = document.createElement("li");
    li.className = "bulletin";

    const icon = document.createElement("div");
    icon.className = "icon";
    icon.textContent = "PDF";
    li.appendChild(icon);

    const meta = document.createElement("div");
    meta.className = "meta";

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = cleanName(file.name);
    meta.appendChild(title);

    const date = document.createElement("span");
    date.className = "date";
    const d = new Date(file.modifiedTime);
    date.textContent = isNaN(d) ? "" : fmt.format(d);
    meta.appendChild(date);

    li.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "actions";

    const view = document.createElement("a");
    view.className = "btn primary";
    view.href = file.webViewLink || driveViewUrl(file.id);
    view.target = "_blank";
    view.rel = "noopener";
    view.textContent = "View";
    actions.appendChild(view);

    const download = document.createElement("a");
    download.className = "btn";
    download.href = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(
      file.id
    )}`;
    download.target = "_blank";
    download.rel = "noopener";
    download.textContent = "Download";
    actions.appendChild(download);

    li.appendChild(actions);
    return li;
  }

  function cleanName(name) {
    // Strip ".pdf" and turn underscores/dashes into spaces for nicer titles.
    return name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim();
  }

  function driveViewUrl(id) {
    return `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`;
  }
})();
