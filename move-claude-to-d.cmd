@echo off
REM ============================================================
REM  Chuyen C:\Users\Admin\.claude sang D:\ClaudeHome
REM  roi tao junction de duong dan cu van hoat dong.
REM
REM  QUAN TRONG: DONG HOAN TOAN Claude Code truoc khi chay.
REM  Chay bang double-click hoac: move-claude-to-d.cmd
REM ============================================================

setlocal
set "SRC=C:\Users\Admin\.claude"
set "DST=D:\ClaudeHome"

echo.
echo === Kiem tra Claude Code co dang chay khong ===
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I "node.exe" >nul
if not errorlevel 1 (
    echo.
    echo [CANH BAO] Van con tien trinh node.exe dang chay.
    echo Dong het cua so Claude Code / terminal roi chay lai.
    echo.
    choice /M "Van tiep tuc"
    if errorlevel 2 goto :end
)

if not exist "%SRC%" (
    echo [LOI] Khong tim thay %SRC%
    goto :end
)

if exist "%DST%" (
    echo [LOI] %DST% da ton tai. Doi ten hoac xoa no truoc.
    goto :end
)

echo.
echo === Dang chuyen du lieu sang %DST% ===
robocopy "%SRC%" "%DST%" /E /MOVE /R:2 /W:2 /NFL /NDL /NJH
set RC=%ERRORLEVEL%
if %RC% GEQ 8 (
    echo.
    echo [LOI] robocopy that bai, ma loi %RC%. Du lieu goc van con o %SRC%.
    goto :end
)

if exist "%SRC%" rd /S /Q "%SRC%" 2>nul

echo.
echo === Tao junction %SRC% -^> %DST% ===
mklink /J "%SRC%" "%DST%"
if errorlevel 1 (
    echo [LOI] Tao junction that bai. Du lieu nam o %DST%.
    goto :end
)

echo.
echo === Buoc 2: xoa thu muc npm cu tren C ===
set "OLDNPM=C:\Users\Admin\AppData\Roaming\npm"
if exist "%OLDNPM%" (
    echo Ban sao moi da nam o D:\npm-global va da duoc kiem tra.
    choice /M "Xoa %OLDNPM%"
    if errorlevel 2 (
        echo Bo qua, giu nguyen thu muc npm cu.
    ) else (
        rd /S /Q "%OLDNPM%"
        if exist "%OLDNPM%" (
            echo [CANH BAO] Xoa khong hoan toan - co the van con tien trinh dang chay.
        ) else (
            echo Da xoa %OLDNPM%
        )
    )
) else (
    echo Khong con thu muc npm cu, bo qua.
)

echo.
echo === HOAN TAT ===
echo Du lieu Claude da o %DST%, duong dan cu %SRC% van dung duoc qua junction.
echo Mo lai Claude Code de kiem tra.

:end
echo.
pause
endlocal
