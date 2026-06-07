const suspiciousNativePaths = [
  "/system/bin/su",
  "/system/xbin/su",
  "/sbin/su",
  "/system/su",
  "/system/bin/busybox",
  "/system/xbin/busybox"
];

function readPath(pointerValue) {
  try {
    return pointerValue.readCString();
  } catch (_) {
    return "";
  }
}

function isSuspiciousPath(pointerValue) {
  const path = readPath(pointerValue);

  if (!path) {
    return false;
  }

  return suspiciousNativePaths.indexOf(path) !== -1 ||
    path.includes("/proc/mounts") ||
    path.includes("/proc/self/mounts");
}

function hookLibc(functionName, pathArgumentIndex) {
  const address = Module.findExportByName("libc.so", functionName) ||
    Module.findExportByName(null, functionName);

  if (!address) {
    console.log("[*] Export not found:", functionName);
    return;
  }

  Interceptor.attach(address, {
    onEnter(args) {
      const pathArgument = pathArgumentIndex >= 0 ? args[pathArgumentIndex] : null;

      if (pathArgument && isSuspiciousPath(pathArgument)) {
        this.block = true;
        this.path = readPath(pathArgument);
      }
    },
    onLeave(returnValue) {
      if (this.block) {
        console.log("[+] Blocked", functionName, "on", this.path);
        returnValue.replace(ptr(-1));
      }
    }
  });

  console.log("[+] Hooked", functionName);
}

hookLibc("open", 0);
hookLibc("openat", 1);
hookLibc("access", 0);
hookLibc("stat", 0);
hookLibc("lstat", 0);
