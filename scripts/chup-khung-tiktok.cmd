@echo off
REM ============================================================
REM  Chup khung hinh tung giay tu mot video TikTok/YouTube/Reels
REM
REM  Dung:  chup-khung-tiktok.cmd <url> [so_khung_moi_giay]
REM  Vi du: chup-khung-tiktok.cmd https://vm.tiktok.com/ZTfTsLkwx/
REM         chup-khung-tiktok.cmd https://vm.tiktok.com/ZTfTsLkwx/ 2
REM
REM  Ket qua nam o:  reference\<ten-video>\
REM    frames\sec-000.jpg ...   mot anh moi giay
REM    contact-01.jpg ...       bang tong hop 6x5 khung de xem nhanh
REM    info.json                tieu de, tac gia, do dai, luot xem
REM ============================================================

setlocal enabledelayedexpansion
set "FFMPEG_DIR=C:\Users\Admin\AppData\Local\Programs\ffmpeg\bin"
if exist "%FFMPEG_DIR%\ffmpeg.exe" set "PATH=%FFMPEG_DIR%;%PATH%"

set "URL=%~1"
set "FPS=%~2"
if "%FPS%"=="" set "FPS=1"

if "%URL%"=="" (
    echo [LOI] Thieu URL.
    echo    Dung: chup-khung-tiktok.cmd ^<url^> [so_khung_moi_giay]
    goto :end
)

where ffmpeg >nul 2>&1
if errorlevel 1 (
    echo [LOI] Khong tim thay ffmpeg trong PATH.
    echo    Sua bien FFMPEG_DIR o dau file nay cho dung may ban.
    goto :end
)

REM --- yt-dlp: uu tien ban da cai, khong co thi tai ban standalone ---
set "YTDLP=yt-dlp"
where yt-dlp >nul 2>&1
if errorlevel 1 (
    set "YTDLP=%~dp0yt-dlp.exe"
    if not exist "!YTDLP!" (
        echo === Tai yt-dlp.exe lan dau ===
        curl -L -o "!YTDLP!" https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe
        if errorlevel 1 (
            echo [LOI] Tai yt-dlp that bai. Kiem tra mang.
            goto :end
        )
    )
)

REM --- lay slug lam ten thu muc ---
for /f "delims=" %%i in ('"!YTDLP!" --no-warnings --print "%%(id)s" "%URL%" 2^>nul') do set "VID=%%i"
if "!VID!"=="" (
    echo [LOI] Khong doc duoc thong tin video. URL co dung khong, hay video da bi an?
    goto :end
)

set "OUT=%~dp0..\reference\!VID!"
if not exist "!OUT!\frames" mkdir "!OUT!\frames"

echo.
echo === Tai video !VID! ===
"!YTDLP!" --no-playlist --no-warnings --write-info-json ^
    -f "bv*+ba/b" --merge-output-format mp4 ^
    -o "!OUT!\video.%%(ext)s" "%URL%"
if not exist "!OUT!\video.mp4" (
    echo [LOI] Khong tai duoc video.
    goto :end
)

echo.
echo === Thong so goc ===
ffprobe -v error -select_streams v:0 ^
    -show_entries "stream=width,height,r_frame_rate:format=duration" ^
    -of default=noprint_wrappers=1 "!OUT!\video.mp4"

echo.
echo === Chup khung: !FPS! khung/giay ===
ffmpeg -hide_banner -loglevel error -y -i "!OUT!\video.mp4" ^
    -vf "fps=!FPS!" -q:v 2 -start_number 0 "!OUT!\frames\sec-%%03d.jpg"
if errorlevel 1 (
    echo [LOI] ffmpeg chup khung that bai.
    goto :end
)

echo === Bang tong hop 6x5 ===
ffmpeg -hide_banner -loglevel error -y -i "!OUT!\video.mp4" ^
    -vf "fps=!FPS!,scale=320:-1,tile=6x5:padding=4:margin=4:color=black" ^
    -q:v 3 "!OUT!\contact-%%02d.jpg"
REM Khung doc trai-phai, tren-xuong: o dau tien la giay 0.

set /a N=0
for %%f in ("!OUT!\frames\sec-*.jpg") do set /a N+=1

echo.
echo === XONG ===
echo Da chup !N! khung vao:  !OUT!\frames\
echo Bang tong hop:          !OUT!\contact-01.jpg
echo.
explorer "!OUT!"

:end
echo.
pause
endlocal
