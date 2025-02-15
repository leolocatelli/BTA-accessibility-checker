import puppeteer from "puppeteer";
import { AxePuppeteer } from "@axe-core/puppeteer";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        console.log("❌ Method not allowed");
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { url } = req.body;

        if (!url) {
            console.log("❌ Missing URL in request");
            return res.status(400).json({ error: "Missing URL" });
        }

        console.log(`🔍 Starting accessibility analysis for: ${url}`);

        // Launch Puppeteer and ignore SSL certificate errors
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--ignore-certificate-errors"]
        });
        const page = await browser.newPage();
        await page.setBypassCSP(true);
        await page.goto(url, { waitUntil: "load", timeout: 30000 });

        console.log("✅ Page loaded successfully in Puppeteer");

        // Run Axe accessibility analysis
        const results = await new AxePuppeteer(page).analyze();

        console.log("✅ Accessibility results obtained:", results.violations);

        await browser.close();

        // Score Calculation
        let score = 100;
        const severityWeights = {
            critical: 20,
            serious: 10,
            moderate: 5,
            minor: 2
        };

        results.violations.forEach(violation => {
            const weight = severityWeights[violation.impact] || 5; 
            score -= weight;
        });

        score = Math.max(0, score); // Ensure score never goes below 0

        res.status(200).json({
            success: true,
            url,
            score,
            violations: results.violations.map((violation) => ({
                description: violation.description,
                impact: violation.impact,
                nodes: violation.nodes.map((node) => node.target),
            })),
        });

    } catch (error) {
        console.error("❌ Error during accessibility check:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
