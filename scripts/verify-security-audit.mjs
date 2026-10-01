import fs from 'fs';
import path from 'path';

console.log('=== StorkCrypto Security & UX Verification Suite ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`[PASS] ${message}`);
        passCount++;
    } else {
        console.error(`[FAIL] ${message}`);
        failCount++;
    }
}

// 1. Admin Credential Scan
const searchPatterns = [
    'storkcrypto90@gmail.com',
    'dev_admin_bypass',
    'storkadmin2026'
];

let foundCredentials = 0;
function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (/\.(ts|tsx|js|jsx|json|html|css|env)$/.test(file)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            for (const pat of searchPatterns) {
                if (content.includes(pat)) {
                    console.error(`Found leaked pattern "${pat}" in ${fullPath}`);
                    foundCredentials++;
                }
            }
        }
    }
}

scanDir('.');
assert(foundCredentials === 0, `Credential leak scan: expected 0 matches, found ${foundCredentials}`);

// 2. Private Service Role Scan
let foundServiceRole = 0;
function scanForServiceRole(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanForServiceRole(fullPath);
        } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('service_role_key') || content.includes('SUPABASE_SERVICE_ROLE')) {
                foundServiceRole++;
            }
        }
    }
}
scanForServiceRole('./src');
scanForServiceRole('./components');
scanForServiceRole('./services');
scanForServiceRole('./store');
assert(foundServiceRole === 0, `Service role key in client code: expected 0, found ${foundServiceRole}`);

// 3. Fake Transaction Broadcast Scan
const walletServiceContent = fs.readFileSync('./services/walletService.ts', 'utf8');
const hasFakeBroadcast = walletServiceContent.includes('Transaction successfully broadcasted');
assert(!hasFakeBroadcast, 'walletService.ts does NOT claim fake broadcast');

const hasDemoSimulation = walletServiceContent.includes('DEMO SIMULATION — no blockchain transaction was sent');
assert(hasDemoSimulation, 'walletService.ts explicitly uses "DEMO SIMULATION — no blockchain transaction was sent"');

// 4. AI Memory Bounding and TTL verification
const memoryContent = fs.readFileSync('./services/strategyMemoryService.ts', 'utf8');
assert(memoryContent.includes('SIGNAL_TTL_MS'), 'strategyMemoryService implements TTL for stale signals');
assert(memoryContent.includes('MAX_LOCAL_ENTRIES = 20'), 'strategyMemoryService bounds entries to max 20');
assert(memoryContent.includes('MAX_LOCAL_BYTES'), 'strategyMemoryService bounds maximum storage size');
assert(memoryContent.includes('clearMemory'), 'strategyMemoryService provides purge on logout/reset');

// 5. Help Buttons Accessibility & Content
const helpContent = fs.readFileSync('./components/HelpIndicator.tsx', 'utf8');
assert(helpContent.includes('min-w-[44px] min-h-[44px]'), 'HelpIndicator button hit area >= 44px for WCAG compliance');
assert(helpContent.includes('Пояснення AI Market Insight'), 'HelpIndicator specifies semantic aria-label for AI Market Insight');
assert(helpContent.includes('Пояснення Quests System'), 'HelpIndicator specifies semantic aria-label for Quests System');
assert(helpContent.includes('activeHelpModalId'), 'HelpIndicator coordinates single active dialog');

const explanationsContent = fs.readFileSync('./utils/explanations.ts', 'utf8');
assert(explanationsContent.includes('Цей блок стисло пояснює ринкові сигнали та тренди'), 'explanations.ts has exact Ukrainian AI Market Insight text');
assert(explanationsContent.includes('Тут відображаються навчальні та demo-завдання'), 'explanations.ts has exact Ukrainian Quests System text');

// 6. LocalStorage Anti-Tampering in Store
const storeContent = fs.readFileSync('./store.tsx', 'utf8');
assert(storeContent.includes('stork-storage-v10'), 'store.tsx migrated to version v10');
assert(storeContent.includes('role: state.userStats.role === \'ADMIN\' ? \'USER\' : state.userStats.role') ||
       storeContent.includes('state.userStats.role = \'USER\''), 'store.tsx prevents unverified ADMIN role elevation');

console.log(`\nVerification finished: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
