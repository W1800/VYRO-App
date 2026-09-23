async function checkForUpdates() {
    try {
        const response = await fetch('https://api.github.com/repos/W1800/VYRO/releases/latest');
        const data = await response.json();
        const latestVersion = data.tag_name;
        const currentVersion = "v1.0";
        if (latestVersion && latestVersion !== currentVersion) {
            const banner = document.createElement('div');
            banner.innerHTML = `<div style="position:fixed;bottom:0;left:0;right:0;background:#ff9800;color:#fff;padding:15px;text-align:center;z-index:9999;font-family:sans-serif;">يوجد تحديث جديد (${latestVersion})! <a href="${data.assets && data.assets[0] ? data.assets[0].browser_download_url : data.html_url}" style="color:#fff;text-decoration:underline;font-weight:bold;margin-left:10px;" target="_blank">تنزيل التحديث</a></div>`;
            document.body.appendChild(banner);
        }
    } catch (e) {
        console.error("Update check failed", e);
    }
}
document.addEventListener("DOMContentLoaded", checkForUpdates);
