@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.
@REM
@REM Maven Wrapper startup batch script, based on the original Maven startup script
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM Optional ENV vars
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to wait for a keystroke before ending
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM MAVEN_SKIP_RC - flag to disable loading of mavenrc files
@REM ----------------------------------------------------------------------------

@IF "%MAVEN_BATCH_ECHO%" == "on" echo %MAVEN_BATCH_ECHO%

@REM set %HOME% to equivalent of $HOME
@IF "%HOME%" == "" (SET "HOME=%HOMEDRIVE%%HOMEPATH%")

@SET MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
@IF NOT "%MAVEN_PROJECTBASEDIR%"=="" goto endDetectBaseDir

@SET EXEC_DIR=%CD%
@SET WDIR=%EXEC_DIR%
:findBaseDir
@IF EXIST "%WDIR%"\.mvn goto baseDirFound
@cd ..
@SET "WDIR=%CD%"
@goto findBaseDir

:baseDirFound
@SET MAVEN_PROJECTBASEDIR=%WDIR%
@cd "%EXEC_DIR%"

:endDetectBaseDir

@IF NOT EXIST "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar" (
    @IF NOT "%MVNW_REPOURL%" == "" (
        @SET MVNW_REPO_PATTERN=/apache/maven/apache-maven/
        @IF "%MVNW_REPO_PATTERN%" == "%MVNW_REPOURL:repo1.maven.org/maven2/apache/maven/apache-maven/=%" (
            @SET MVNW_REPO_PATTERN=/root/apache/maven/apache-maven/
        )
    )
    @powershell -Command "&{"^
        "$mavenVersion = '3.9.9';"^
        "$wrapperUrl = \"https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/$mavenVersion/maven-wrapper-$mavenVersion.jar\";"^
        "if ($env:MVNW_REPOURL) { $wrapperUrl = \"$env:MVNW_REPOURL/org/apache/maven/wrapper/maven-wrapper/$mavenVersion/maven-wrapper-$mavenVersion.jar\" };"^
        "$wrapperDir = \"%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\";"^
        "if (!(Test-Path $wrapperDir)) { mkdir $wrapperDir };"^
        "$wrapperJar = \"$wrapperDir\maven-wrapper.jar\";"^
        "if (!(Test-Path $wrapperJar)) { (New-Object Net.WebClient).DownloadFile($wrapperUrl, $wrapperJar) };"^
        "}"
)

@SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

@SET DOWNLOAD_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"

@FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties") DO (
    @IF "%%A" == "wrapperUrl" SET DOWNLOAD_URL=%%B
)

@SET MVNW_VERBOSE=false
@IF NOT "%MVNW_VERBOSE%" == "false" (
  @echo Checking for %MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar
)
@IF "%~1" == "--mvnw-verbose" (
  @SET MVNW_VERBOSE=true
  @SHIFT
)

@IF NOT EXIST "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar" (
    @IF NOT "%MVNW_VERBOSE%" == "false" (
        @echo Downloading from: %DOWNLOAD_URL%
    )
    @powershell -Command "(New-Object Net.WebClient).DownloadFile('%DOWNLOAD_URL%', '%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar')"
    @IF NOT EXIST "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar" (
        @echo Could not download %DOWNLOAD_URL%
        exit /b 1
    )
)

@IF "%JAVA_HOME%" == "" (
    @IF EXIST "C:\Program Files\Java\jdk-24" (
        @SET "JAVA_HOME=C:\Program Files\Java\jdk-24"
    )
)
@IF "%JAVA_HOME%" == "" (
    @SET MAVEN_JAVA_EXE="java"
) ELSE (
    @SET MAVEN_JAVA_EXE="%JAVA_HOME%\bin\java.exe"
)
@SET WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
@SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

%MAVEN_JAVA_EXE% ^
    %JVM_CONFIG_MAVEN_PROPS% ^
    %MAVEN_OPTS% ^
    %MAVEN_DEBUG_OPTS% ^
    -classpath %WRAPPER_JAR% ^
    "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
    %WRAPPER_LAUNCHER% %MAVEN_CONFIG% %*
