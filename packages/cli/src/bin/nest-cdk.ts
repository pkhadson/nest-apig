#!/usr/bin/env node
import init from "../init";

const action = process.argv[2];

switch (action) {
  case "init":
    init();
    break;
  //   case "destroy":
  //     destroy()
  //     break
  //   case "info":
  //     info()
  //     break
  default:
    console.error(`Unknown action`);
}
