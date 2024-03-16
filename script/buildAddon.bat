@echo off

set commit=1ec38940e5c6f09a4c1d17a46d839a881c4f2db7
set branch=16-latest

setlocal enabledelayedexpansion

rem Remember current's parent directory and create a new, unique, temporary directory
set buildDir=%cd%
set projectDir=%cd%\..
set tmpDir=%temp%\tmpdir.libpg_query
rmdir /s /q %tmpDir%
md %tmpDir%


rem Define the make target
set makeTarget=build

rem Change to the newly created temp directory
cd /D %tmpDir%


rem Clone the selected branch of the libpg_query Git repo
git clone -b %branch% --single-branch https://github.com/pganalyze/libpg_query.git
cd libpg_query

rem Checkout the desired commit
git checkout %commit%

rem needed if being invoked from within gyp
set MAKEFLAGS=
set MFLAGS=

rem set path with Windows Developer Command Prompt
echo "please ensure you are running at Windows Developer Command Prompt environments"
nmake /F Makefile.msvc clean
nmake /F Makefile.msvc build


rem Terminate if build fails
if %errorlevel% NEQ 0 (
    echo ERROR: 'nmake' command failed
)

rem Search for pg_query.obj (libpg_query.a), error if not found
for /f "delims=" %%f in ('dir /b /s pg_query.lib') do set file=%%f
if not defined file (
    echo "ERROR: pg_query.lib not found"

)

rem Error if pg_query.h is missing
for /f "delims=" %%f in ('dir /b /s pg_query.h') do set file=%%f
if not defined file (
    echo "ERROR: pg_query.h not found"

)

rem Copy pg_query.lib to windows dir
copy /Y pg_query.lib "%projectDir%\libpg_query\windows\"

rem Copy header
copy /Y pg_query.h "%projectDir%\libpg_query\include\"

rem Cleanup: revert to original directory
cd /D %buildDir%

exit /B 0