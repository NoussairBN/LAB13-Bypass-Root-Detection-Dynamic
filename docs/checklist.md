# Checklist LAB14

- [ ] `python --version` capture
- [ ] `pip --version` capture
- [ ] `frida --version` capture
- [ ] `adb devices` capture
- [ ] `adb shell getprop ro.product.cpu.abi` capture
- [ ] `adb push frida-server /data/local/tmp/` capture
- [ ] `adb shell chmod 755 /data/local/tmp/frida-server` capture
- [ ] lancement de `frida-server` capture
- [ ] `adb forward tcp:27042 tcp:27042` capture
- [ ] `adb forward tcp:27043 tcp:27043` capture
- [ ] `frida-ps -Uai` capture
- [ ] injection `scripts/hello.js` capture
- [ ] etat avant bypass capture
- [ ] bypass Java avec `scripts/bypass_root_basic.js` capture
- [ ] bypass natif avec `scripts/bypass_native.js` capture si utilise
- [ ] bypass Objection `android root disable` capture
- [ ] etat apres bypass capture
