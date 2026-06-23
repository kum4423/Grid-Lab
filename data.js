// MAIN world と ISOLATED world の橋渡しに使う CustomEvent 名、
// および chrome.scripting.registerContentScripts で使うスクリプトIDの定義
"use strict";

const eventGetRowFixerData = "getRowFixerData";
const eventSendRowFixerData = "sendRowFixerData";

const scriptContentScript = "content_script_bridge";
const scriptInjectScript = "inject_script_main";

const allScriptIds = [scriptContentScript, scriptInjectScript];
