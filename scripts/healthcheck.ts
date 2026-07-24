import fs from 'fs';
import path from 'path';

// Load achievements JSON
const achievementsPath = path.join(process.cwd(), 'src', 'data', 'achievements.json');
let achievements: any[] = [];

try {
    achievements = JSON.parse(fs.readFileSync(achievementsPath, 'utf8'));
} catch (e) {
    console.error("❌ Failed to load achievements.json. Make sure you are running this script from the project root.");
    process.exit(1);
}

const AFRIKYIA_URL = 'https://www.afrikyia.com';
const TIMEOUT_MS = 10000; // 10 seconds

async function checkLink(url: string, projectName: string) {
    if (!url || url === '#') {
        return { projectName, url, status: 'SKIPPED', message: 'No external URL' };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            redirect: 'follow', // Follow redirects implicitly
            headers: {
                'User-Agent': 'Afrikyia-Healthcheck-Bot/1.0'
            }
        });

        clearTimeout(timeoutId);

        // Treat 2xx and 3xx as success
        if (response.ok || (response.status >= 300 && response.status < 400)) {
            return { projectName, url, status: 'OK', message: `HTTP ${response.status}` };
        } else {
            // Some servers reject HEAD requests with 405 Method Not Allowed or 403 Forbidden. 
            // In a real world script, you might want to fallback to GET if HEAD fails.
            return { projectName, url, status: 'ERROR', message: `HTTP ${response.status} ${response.statusText}` };
        }
    } catch (error: any) {
        if (error.name === 'AbortError') {
            return { projectName, url, status: 'TIMEOUT', message: `Timed out after 10s` };
        }
        return { projectName, url, status: 'ERROR', message: error.message };
    }
}

async function checkSecurityHeaders(url: string) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const headers = response.headers;
        return {
            hsts: headers.get('strict-transport-security'),
            contentTypeOptions: headers.get('x-content-type-options'),
            frameOptions: headers.get('x-frame-options')
        };
    } catch (error: any) {
        return null;
    }
}

async function runCheck() {
    console.log('===================================================');
    console.log('🔍 RUNNING HEALTH & SECURITY CHECK');
    console.log('===================================================\n');

    console.log('1. Checking External Projects Links (Timeout: 10s)...');
    let errorsFound = 0;

    for (const item of achievements) {
        const result = await checkLink(item.link, item.en?.title || item.id);
        if (result.status === 'OK') {
            console.log(`✅ [OK] ${result.projectName} (${result.url}) - ${result.message}`);
        } else if (result.status === 'SKIPPED') {
            console.log(`➖ [SKIP] ${result.projectName} - ${result.message}`);
        } else {
            console.log(`❌ [${result.status}] ${result.projectName} (${result.url}) - ${result.message}`);
            errorsFound++;
        }
    }

    console.log('\n2. Checking Security Headers on afrikyia.com...');
    const secHeaders = await checkSecurityHeaders(AFRIKYIA_URL);
    let secErrors = 0;

    if (!secHeaders) {
        console.log(`❌ Failed to reach ${AFRIKYIA_URL}`);
        secErrors++;
    } else {
        const checks = [
            { name: 'Strict-Transport-Security (HSTS)', value: secHeaders.hsts },
            { name: 'X-Content-Type-Options', value: secHeaders.contentTypeOptions },
            { name: 'X-Frame-Options', value: secHeaders.frameOptions }
        ];

        for (const check of checks) {
            if (check.value) {
                console.log(`✅ [FOUND] ${check.name}: ${check.value}`);
            } else {
                console.log(`❌ [MISSING] ${check.name}`);
                secErrors++;
            }
        }
    }

    console.log('\n===================================================');
    console.log('📊 REPORT SUMMARY');
    console.log('===================================================');
    console.log(`Project Links Failed: ${errorsFound} / ${achievements.length}`);
    console.log(`Security Headers Missing: ${secErrors} / 3`);

    // Add instructions on how to set security headers in Next.js if missing
    if (secErrors > 0) {
        console.log('\n💡 Hint: To add missing security headers in Next.js, add an async headers() function in next.config.ts.');
    }

    if (errorsFound > 0 || secErrors > 0) {
        console.log('\n⚠️  ACTION REQUIRED: Some checks failed. Please review the logs above.');
        process.exit(1); // Exit with 1 for CI to catch the failure
    } else {
        console.log('\n🎉 ALL CHECKS PASSED SUCCESSFULLY!');
        process.exit(0);
    }
}

runCheck();
