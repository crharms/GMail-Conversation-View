var EXPORTED_SYMBOLS = ["Prefs", "kStubUrl"]

const Ci = Components.interfaces;
const Cc = Components.classes;
const Cu = Components.utils;
const Cr = Components.results;

const prefsService = Cc["@mozilla.org/preferences-service;1"]
  .getService(Ci.nsIPrefService)
  .getBranch("conversations.");
const gPrefBranch = Cc["@mozilla.org/preferences-service;1"]
  .getService(Ci.nsIPrefService)
  .getBranch(null);

const kStubUrl = "chrome://conversations/content/stub.xhtml";

function PrefManager() {
  this.expand_who = prefsService.getIntPref("expand_who");
  this.no_friendly_date = prefsService.getBoolPref("no_friendly_date");
  this.logging_enabled = prefsService.getBoolPref("logging_enabled");
  this.tweak_bodies = prefsService.getBoolPref("tweak_bodies");
  this.tweak_chrome = prefsService.getBoolPref("tweak_chrome");
  this.add_embeds = prefsService.getBoolPref("add_embeds");
  this.expensive_quote_detection = prefsService.getBoolPref("expensive_quote_detection");
  this.operate_on_conversations = prefsService.getBoolPref("operate_on_conversations");
  this.enabled = prefsService.getBoolPref("enabled");
  this.extra_attachments = prefsService.getBoolPref("extra_attachments");
  this.hide_quote_length = prefsService.getIntPref("hide_quote_length");
  // This is a hashmap
  this.monospaced_senders = {};
  for each (s in this.split(prefsService.getCharPref("monospaced_senders")))
    this.monospaced_senders[s] = null;

  this.watchers = [];

  this.register();
}

PrefManager.prototype = {

  split: function (s) Array.map(s.split(","), String.trim).filter(String.trim),

  watch: function (watcher) this.watchers.push(watcher),

  register: function mpo_register (observer) {
    prefsService.QueryInterface(Ci.nsIPrefBranch2);
    if (observer)
      prefsService.addObserver("", observer, false);
    else
      prefsService.addObserver("", this, false);
  },

  unregister: function mpo_unregister () {
    if (!prefsService)
      return;
    prefsService.removeObserver("", this);
  },

  observe: function mpo_observe (aSubject, aTopic, aData) {
    if (aTopic != "nsPref:changed")
      return;

    switch (aData) {
      case "no_friendly_date":
      case "logging_enabled":
      case "tweak_bodies":
      case "tweak_chrome":
      case "add_embeds":
      case "expensive_quote_detection":
      case "operate_on_conversations":
      case "extra_attachments":
      case "enabled": {
        let v = prefsService.getBoolPref(aData)
        this[aData] = v;
        [x(aData, v) for each (x in this.watchers)];
        break;
      }

      case "expand_who":
      case "hide_quote_length": {
        let v = prefsService.getIntPref(aData)
        this[aData] = v;
        [x(aData, v) for each (x in this.watchers)];
        break;
      }

      case "monospaced_senders":
        this.monospaced_senders = {};
        for each (s in this.split(prefsService.getCharPref("monospaced_senders")))
          this.monospaced_senders[s] = null;
        break;
    }
  },

  getChar: function (p) {
    return gPrefBranch.getCharPref(p);
  },

  getInt: function (p) {
    return gPrefBranch.getIntPref(p);
  },

  getBool: function (p) {
    return gPrefBranch.getBoolPref(p);
  },

  getString: function (p) {
    return gPrefBranch.getComplexValue(p, Ci.nsISupportsString).data;
  },

  setChar: function (p, v) {
    return gPrefBranch.setCharPref(p, v);
  },

  setInt: function (p, v) {
    return gPrefBranch.setIntPref(p, v);
  },

  setBool: function (p, v) {
    return gPrefBranch.setBoolPref(p, v);
  },

  setString: function (p, v) {
    let str = Cc["@mozilla.org/supports-string;1"]
              .createInstance(Ci.nsISupportsString);
    str.data = v;
    return gPrefBranch.setComplexValue(p, Ci.nsISupportsString, str);
  },

  kScrollUnreadOrLast: 0,
  kScrollSelected: 1,

  kExpandNone: 1,
  kExpandAll: 3,
  kExpandAuto: 4,
}

// Prefs is a singleton.
let Prefs = new PrefManager();
