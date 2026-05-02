#!/bin/bash

echo ""
echo " ================================"
echo "  해정뉴스 자동 테스트 봇"
echo " ================================"
echo ""

# Node.js 확인
if ! command -v node &> /dev/null; then
    echo " [오류] Node.js가 설치되어 있지 않습니다."
    echo ""
    echo " 아래 링크에서 설치해주세요:"
    echo " https://nodejs.org/ko/download"
    echo ""
    exit 1
fi

echo " [1/3] Node.js 확인 완료"
echo "       버전: $(node --version)"
echo ""

# npm install
echo " [2/3] 패키지 설치 중..."
npm install --silent 2>/dev/null
echo "       완료"
echo ""

# Playwright chromium
echo " [3/3] 브라우저 확인 중..."
npx playwright install chromium --quiet 2>/dev/null
echo "       완료"
echo ""

echo " ================================"
echo "  테스트 시작!"
echo " ================================"
echo ""

# 봇 실행
node bot.js

echo ""
echo " ================================"
echo "  테스트 완료! 결과 파일:"
ls report_*.txt 2>/dev/null | while read f; do echo "  - $f"; done
echo " ================================"
echo ""