@echo off

REM *************** COMANDI DI CONFIGURAZIONE DI CORDOVA ***********************

REM percorso JAVA JDK 
REM E' richiesta espressamente la versione jdk1.8.*
SET JAVA_HOME=C:\Program Files\Java\jdk1.8.0_311

REM percorso ANDROID SDK (copiare dai settings di Android Studio)
SET ANDROID_SDK_ROOT=C:\Users\Ettore\AppData\Local\Android\Sdk


SET PATH=%PATH%;C:\Program Files\Java\jdk1.8.0_311\bin;
SET PATH=%PATH%;C:\Users\Ettore\AppData\Local\Android\Sdk\tools;
SET PATH=%PATH%;C:\Users\Ettore\AppData\Local\Android\Sdk\platform-tools;

REM percorso GRADLE (copiare dai settings di Android Studio)
SET PATH=%PATH%;C:\Users\Ettore\.gradle\wrapper\dists\gradle-7.2-bin\2dnblmf4td7x66yl1d74lt32g\gradle-7.2\bin;

echo done


