@echo off
chcp 65001 > nul
title 해정뉴스 테스트 봇

echo.
echo  ================================
echo   해정뉴스 자동 테스트 봇
echo  ================================
echo.

:: Node.js 설치 확인
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [오류] Node.js가 설치되어 있지 않습니다.
    echo.
    echo  아래 링크에서 Node.js를 설치해주세요:
    echo  https://nodejs.org/ko/download
    echo.
    pause
    exit /b 1
)

echo  [1/3] Node.js 확인 완료
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo       버전: %NODE_VER%
echo.

:: npm install
echo  [2/3] 패키지 설치 중...
call npm install --silent 2>nul
if %errorlevel% neq 0 (
    echo  [오류] npm install 실패
    pause
    exit /b 1
)
echo       완료
echo.

:: Playwright chromium 설치 확인
echo  [3/3] 브라우저 확인 중...
call npx playwright install chromium --quiet 2>nul
echo       완료
echo.

echo  ================================
echo   테스트 시작!
echo  ================================
echo.

:: 봇 실행
node bot.js

echo.
echo  ================================
echo   테스트 완료! 결과 파일 확인:
for %%f in (report_*.txt) do echo   - %%f
echo  ================================
echo.
pause