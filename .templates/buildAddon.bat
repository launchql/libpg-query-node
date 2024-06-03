@echo off

set LIBPG_REPO=___LIBPG_REPO___
set LIBPG_COMMIT=___LIBPG_COMMIT___
set LIBPG_BRANCH=___LIBPG_BRANCH___

:: Check if each required variable is set
if "%LIBPG_REPO%"=="" (
    echo ERROR: LIBPG_REPO variable is not set.
    exit /B 1
)

if "%LIBPG_COMMIT%"=="" (
    echo ERROR: LIBPG_COMMIT variable is not set.
    exit /B 1
)

if "%LIBPG_BRANCH%"=="" (
    echo ERROR: LIBPG_BRANCH variable is not set.
    exit /B 1
)

:: The environment variables must be set
echo Using repository: %LIBPG_REPO%
echo Using commit: %LIBPG_COMMIT%
echo Using branch: %LIBPG_BRANCH%

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
git clone -b %LIBPG_BRANCH% --single-branch %LIBPG_REPO%
cd libpg_query

rem Checkout the desired commit
git checkout %LIBPG_COMMIT%

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