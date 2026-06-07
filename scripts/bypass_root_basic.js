const suspiciousPaths = [
  "/system/bin/su",
  "/system/xbin/su",
  "/sbin/su",
  "/system/su",
  "/system/app/Superuser.apk",
  "/system/app/SuperSU.apk",
  "/system/bin/busybox",
  "/system/xbin/busybox"
];

function lower(value) {
  try {
    return ("" + value).toLowerCase();
  } catch (_) {
    return "";
  }
}

function stringArrayToJs(arrayValue) {
  const output = [];

  if (!arrayValue) {
    return output;
  }

  for (let i = 0; i < arrayValue.length; i++) {
    output.push(String(arrayValue[i]));
  }

  return output;
}

function isSuspiciousCommand(command) {
  const value = Array.isArray(command) ? command.join(" ") : command;
  const normalized = lower(value);

  return normalized === "su" ||
    normalized.startsWith("su ") ||
    normalized.includes(" which su") ||
    normalized.includes(" busybox") ||
    normalized.includes(" su ");
}

Java.perform(function () {
  try {
    const Build = Java.use("android.os.Build");
    Build.TAGS.value = "release-keys";
    console.log("[+] Build.TAGS -> release-keys");
  } catch (error) {
    console.log("[-] Build.TAGS hook failed:", error);
  }

  try {
    const RootBeer = Java.use("com.scottyab.rootbeer.RootBeer");

    RootBeer.isRooted.implementation = function () {
      console.log("[+] RootBeer.isRooted -> false");
      return false;
    };

    RootBeer.isRootedWithoutBusyBoxCheck.implementation = function () {
      console.log("[+] RootBeer.isRootedWithoutBusyBoxCheck -> false");
      return false;
    };

    RootBeer.isRootedWithBusyBoxCheck.implementation = function () {
      console.log("[+] RootBeer.isRootedWithBusyBoxCheck -> false");
      return false;
    };
  } catch (_) {
    console.log("[*] RootBeer class not present or not loaded");
  }

  try {
    const File = Java.use("java.io.File");

    File.exists.implementation = function () {
      const path = this.getAbsolutePath();

      if (suspiciousPaths.indexOf(path) !== -1) {
        console.log("[+] File.exists bypass:", path);
        return false;
      }

      return this.exists.call(this);
    };

    console.log("[+] File.exists hook installed");
  } catch (error) {
    console.log("[-] File.exists hook failed:", error);
  }

  try {
    const Runtime = Java.use("java.lang.Runtime");
    const JString = Java.use("java.lang.String");
    const StringArray = Java.use("[Ljava.lang.String;");

    Runtime.exec.overload("java.lang.String").implementation = function (command) {
      if (isSuspiciousCommand(command)) {
        console.log("[+] Blocked Runtime.exec:", command);
        return this.exec(JString.$new("echo"));
      }

      return this.exec(command);
    };

    Runtime.exec.overload("[Ljava.lang.String;").implementation = function (commandArray) {
      const commands = stringArrayToJs(commandArray);

      if (isSuspiciousCommand(commands)) {
        console.log("[+] Blocked Runtime.exec:", commands.join(" "));
        const replacement = StringArray.$new(1);
        replacement[0] = JString.$new("echo");
        return this.exec(replacement);
      }

      return this.exec(commandArray);
    };

    Runtime.exec.overload("java.lang.String", "[Ljava.lang.String;").implementation = function (command, envp) {
      if (isSuspiciousCommand(command)) {
        console.log("[+] Blocked Runtime.exec:", command);
        return this.exec(JString.$new("echo"), envp);
      }

      return this.exec(command, envp);
    };

    Runtime.exec.overload("[Ljava.lang.String;", "[Ljava.lang.String;").implementation = function (commandArray, envp) {
      const commands = stringArrayToJs(commandArray);

      if (isSuspiciousCommand(commands)) {
        console.log("[+] Blocked Runtime.exec:", commands.join(" "));
        const replacement = StringArray.$new(1);
        replacement[0] = JString.$new("echo");
        return this.exec(replacement, envp);
      }

      return this.exec(commandArray, envp);
    };

    console.log("[+] Runtime.exec hooks installed");
  } catch (error) {
    console.log("[-] Runtime.exec hooks failed:", error);
  }

  console.log("[+] Java root bypass installed");
});
