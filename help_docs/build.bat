@echo off
chcp 65001 >nul
echo ================================================
echo Building CHM Help File - UTE Library System
echo ================================================
echo.

REM Kiểm tra xem HTML Help Workshop đã được cài đặt chưa
if exist "C:\Program Files (x86)\HTML Help Workshop\hhc.exe" (
    echo HTML Help Workshop found!
    echo.
    echo Compiling help_project.hhp...
    echo.
    "C:\Program Files (x86)\HTML Help Workshop\hhc.exe" help_project.hhp
    echo.
    if exist UTE_Library_Management_Guide.chm (
        echo ================================================
        echo Build complete!
        echo Output: UTE_Library_Management_Guide.chm
        echo ================================================
        echo.
        dir UTE_Library_Management_Guide.chm
    ) else (
        echo ================================================
        echo Build may have warnings but file might be created
        echo Check for UTE_Library_Management_Guide.chm
        echo ================================================
    )
) else (
    echo ERROR: HTML Help Workshop not found!
    echo.
    echo Please install HTML Help Workshop from:
    echo https://www.microsoft.com/en-us/download/details.aspx?id=21138
    echo.
    echo Or update the path in this script if installed in a different location.
)

echo.
echo Press any key to exit...
pause >nul


