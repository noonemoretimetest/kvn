export default async function handler(req, res) {
    try {
        let encoded = req.query.p || "";
        if (!encoded) return res.status(400).send("Missing p");

        // Bỏ đuôi .m3u8 nếu có
        if (encoded.endsWith(".m3u8")) {
            encoded = encoded.slice(0, -6);
        }

        // Decode Base64
        const decoded = Buffer.from(encoded, "base64").toString("utf8");
        const parts = decoded.split("|");
        const u = parts[0];
        const ref = parts[1] || u;

        // Fetch nội dung gốc
        const response = await fetch(u, {
            headers: {
                "Referer": ref,
                "User-Agent":
                    "Mozilla/5.0 (SMART-TV; LINUX; Tizen 9.0) AppleWebKit/537.36 (KHTML, like Gecko) 120.0.6099.5/9.0 TV Safari/537.36",
            }
        });

        if (!response.ok) return res.status(500).send("Fetch error: " + response.status);

        const text = await response.text();
        const lines = text.split("\n");

        let output = "";

        for (let line of lines) {
            const trim = line.trim();
            if (trim.startsWith("http://") || trim.startsWith("https://")) {
                const bencode = encodeURIComponent(
                    Buffer.from(`${trim}|${ref}`).toString("base64")
                );
                // Không cần thêm .m3u8 nữa, vì client đã truyền p=xxx.m3u8
                line = `https://phuocphap.ahiep.name.vn/phuocphap/KODI/F/ts.php?b=${bencode}`;
            }
            output += line + "\n";
        }

        res.setHeader("Content-Type", "application/x-mpegurl");
        return res.status(200).send(output);

    } catch (err) {
        return res.status(500).send("Server error: " + err.message);
    }
}
