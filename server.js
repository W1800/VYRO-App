const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const app = express();
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: "محاولات كثيرة، حاول بعد دقيقة."
});

app.use("/api/", limiter);
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("VYRO Backend is running!");
});

app.get("/version", (req, res) => {
  res.json({
    version: "v1.0.0",
    apkUrl: "https://github.com/W1800/VYRO-App/releases/download/v1.0.0/VYRO-latest.apk"
  });
});

app.post("/api/download", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.includes("tiktok.com")) {
      return res.status(400).json({
        error: "ضع رابط تيك توك صحيح"
      });
    }

    const response = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ url })
    });

    const data = await response.json();

    if (!data.data || !data.data.play) {
      return res.status(400).json({
        error: "تعذر الحصول على الفيديو"
      });
    }

    res.json({
      success: true,
      video: data.data.play
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "حدث خطأ في الخادم"
    });
  }
});


// تحميل الفيديو عن طريق الباكند
app.get("/api/download-file", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || !url.includes("tiktok.com")) {
      return res.status(400).send("رابط TikTok غير صحيح");
    }

    const response = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ url })
    });

    const data = await response.json();

    if (!data.data || !data.data.play) {
      return res.status(400).send("تعذر الحصول على الفيديو");
    }

    const videoResponse = await fetch(data.data.play);

    if (!videoResponse.ok) {
      return res.status(500).send("تعذر تحميل الفيديو");
    }

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="VYRO-video.mp4"'
    );

    const buffer = await videoResponse.arrayBuffer();

    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error(error);

    res.status(500).send("حدث خطأ أثناء تحميل الفيديو");
  }
});

// Instagram Downloader
app.post("/api/instagram-download", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.includes("instagram.com")) {
      return res.status(400).json({
        error: "ضع رابط Instagram صحيح"
      });
    }

    const response = await fetch(
      "https://api.easydown.org/api/v1/platforms/instagram/parse",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.EASYDOWN_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      }
    );

    const data = await response.json();
    console.log("EasyDown response:", JSON.stringify(data));

    if (
      !data.data ||
      !data.data.media ||
      !data.data.media.videos ||
      !data.data.media.videos[0]
    ) {
      return res.status(400).json({
        error: "تعذر الحصول على فيديو Instagram"
      });
    }

    res.json({
      success: true,
      video: data.data.media.videos[0].url
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "حدث خطأ أثناء معالجة Instagram"
    });
  }
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
