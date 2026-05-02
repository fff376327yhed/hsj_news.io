/**
 * encrypt.js — JS 파일 XOR+Base64 암호화 도구
 *
 * 사용법:
 *   1) 이 파일을 js/ 폴더 안에 저장   ← ★ js/ 폴더 안에 위치해야 함
 *   2) 터미널에서: cd js && node encrypt.js
 *   3) 같은 js/ 폴더에 *.enc 파일이 생성됨
 *   4) GitHub에 .enc 파일만 커밋/푸시
 *   5) index.html 로더를 loader-patch.html 내용으로 교체
 *
 * ⚠️  _KEY 값을 index.html의 _K 와 반드시 동일하게 유지하세요
 *     현재 설정: hsj_news_2025
 */

const fs   = require('fs');
const path = require('path');

// ── 반드시 index.html _K 값과 동일하게 ──
const _KEY = 'hsj_news_2025';

// ── 암호화할 파일 목록 ──
const FILES = [
    'script.js',
    'script2.js',
    'ganadi-helper.js',
    'category-tutorial.js',
    'chat.js',
    'vote.js',
    'console-toggle.js',
    'chat-upgrade.js',
    'chat-nickname-dot.js',
    'device-detect.js',
    'ai.js',
    'wiki.js',
    'pwa.js',
    'ai-toggle.js',
    'category-manager.js'
];

// ── XOR 암호화 함수 (UTF-8 바이트 단위) ──
// latin1이 아닌 UTF-8 바이트 배열로 XOR → 한글/이모지 등 멀티바이트 문자 정확 처리
function xorEncrypt(code, key) {
    const codeBytes = Buffer.from(code, 'utf8');
    const keyBytes  = Buffer.from(key,  'utf8');
    const out       = Buffer.alloc(codeBytes.length);
    for (let i = 0; i < codeBytes.length; i++) {
        out[i] = codeBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    return out.toString('base64');
}

// ── 복호화 검증 함수 (UTF-8 바이트 단위) ──
function xorDecrypt(enc, key) {
    const encBytes = Buffer.from(enc, 'base64');
    const keyBytes = Buffer.from(key, 'utf8');
    const out      = Buffer.alloc(encBytes.length);
    for (let i = 0; i < encBytes.length; i++) {
        out[i] = encBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    return out.toString('utf8');
}

// encrypt.js 자신이 js/ 폴더 안에 있으므로 __dirname = js/ 폴더 그 자체
const JS_DIR = __dirname;

console.log('🔐 JS 파일 암호화 시작...\n');

let successCount = 0;
let skipCount    = 0;

for (const file of FILES) {
    const srcPath = path.join(JS_DIR, file);
    const outPath = path.join(JS_DIR, file + '.enc');

    if (!fs.existsSync(srcPath)) {
        console.log(`  ⚠️  건너뜀 (파일 없음): ${file}`);
        skipCount++;
        continue;
    }

    try {
        const code      = fs.readFileSync(srcPath, 'utf8');
        const encrypted = xorEncrypt(code, _KEY);

        // ── 복호화 검증 ──
        const verified = xorDecrypt(encrypted, _KEY);
        if (verified !== code) {
            console.error(`  ❌ 검증 실패: ${file} — 암호화/복호화 결과 불일치`);
            continue;
        }

        fs.writeFileSync(outPath, encrypted, 'utf8');
        const orig = (Buffer.byteLength(code, 'utf8') / 1024).toFixed(1);
        const enc  = (encrypted.length / 1024).toFixed(1);
        console.log(`  ✅ ${file.padEnd(30)} ${orig}KB → ${enc}KB (enc)`);
        successCount++;
    } catch (e) {
        console.error(`  ❌ 오류: ${file} —`, e.message);
    }
}

console.log(`\n🎉 완료: ${successCount}개 암호화 / ${skipCount}개 건너뜀`);
console.log(`📁 출력 위치: ${JS_DIR}  (js/ 폴더 내)`);
console.log('\n📌 다음 단계:');
console.log('   1. js/*.enc 파일을 GitHub에 커밋/푸시');
console.log('   2. index.html 로더 스크립트를 loader-patch.html 내용으로 교체');
console.log('   3. js/*.js 는 .gitignore 에 추가 (원본 숨기기)');

//...