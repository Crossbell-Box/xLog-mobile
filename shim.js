import "node-libs-expo/globals";
import { Platform } from "react-native";
import { btoa, atob, toByteArray } from "react-native-quick-base64";

if (typeof BigInt === "undefined")
  global.BigInt = require("big-integer");

if (typeof __dirname === "undefined")
  global.__dirname = "/"
  ;

if (typeof __filename === "undefined")
  global.__filename = ""
  ;

if (typeof process === "undefined") {
  global.process = require("process");
}
else {
  const bProcess = require("process");
  for (const p in bProcess) {
    if (!(p in process))
      process[p] = bProcess[p];
  }
}

process.browser = false;
if (typeof Buffer === "undefined")
  global.Buffer = require("buffer").Buffer
  ;

// eslint-disable-next-line no-undef
const isDev = typeof __DEV__ === "boolean" && __DEV__;
process.env.NODE_ENV = isDev ? "development" : "production";
if (typeof localStorage !== "undefined")
  localStorage.debug = isDev ? "*" : "";

if (Platform.OS !== "web") {
  global.atob = atob;
  global.btoa = btoa;
  FileReader.prototype.readAsArrayBuffer = function (blob) {
    if (this.readyState === this.LOADING)
      throw new Error("InvalidStateError");

    this._setReadyState(this.LOADING);
    this._result = null;
    this._error = null;
    const fr = new FileReader();
    fr.onloadend = () => {
      this._result = toByteArray(fr.result.split(",").pop().trim());
      this._setReadyState(this.DONE);
    };
    fr.readAsDataURL(blob);
  };
}
